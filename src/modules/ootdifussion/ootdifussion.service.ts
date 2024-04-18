import { logger } from '@/common/logger';
import { S3Helpers } from '@/common/s3';
import { generateRandomString } from '@/common/utils';
import { downloadFile, downloadFileAsBuffer } from '@/common/utils/file';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export interface OOTDiffusionHalfBodyParams {
  bodyImage: string;
  clothesImage: string;
  imageCount?: number;
  steps?: number;
  guidanceScale?: number;
  seed?: number;
}

export enum GarmentCategory {
  UppperBody = 'Upper-body',
  LowerBody = 'Lower-body',
  Dress = 'Dress',
}

export interface OOTDiffusionFullBodyParams {
  bodyImage: string;
  garmentCategory: GarmentCategory;
  clothesImage: string;
  imageCount?: number;
  steps?: number;
  guidanceScale?: number;
  seed?: number;
}

export interface HuggingFaceMessage {
  msg: string;
  event_id: string;
  output: {
    data: Array<
      Array<{
        image: {
          path: string;
        };
      }>
    >;
    is_generating: boolean;
    duration: number;
    average_duration: number;
  };
  success: boolean;
}

@Injectable()
export class OotdifussionService {
  private async uploadImageToHuggingFace(imageUrl: string): Promise<string> {
    const uploadApi = `https://levihsu-ootdiffusion.hf.space/--replicas/eldt3/upload?upload_id=${generateRandomString(11)}`;
    // Path to your file
    const filePath = await downloadFile(imageUrl);

    // Create a new FormData instance
    const formData = new FormData();

    // Append the file to the FormData instance
    // The first argument is the field name (the name of the form field in your API)
    // The second argument is a ReadStream of your file
    formData.append('files', fs.createReadStream(filePath));

    // Make a POST request with Axios
    const { data } = await axios.post<string[]>(uploadApi, formData, {
      headers: {
        // FormData will set the Content-Type to 'multipart/form-data' with a boundary automatically
        ...formData.getHeaders(),
      },
    });
    logger.log('上传 huggingface 图片结果: ', data);
    if (!data.length) {
      throw new Error('上传图像到 huggingface 失败');
    }
    return data[0];
  }

  private async poolForResult(sessionHash: string): Promise<string[]> {
    const dataApi = `https://levihsu-ootdiffusion.hf.space/--replicas/eldt3/queue/data?session_hash=${sessionHash}`;
    const { data: stream } = await axios.get(dataApi, {
      responseType: 'stream',
    });
    const timout = 300;
    const start = +new Date();
    const result: string[] = [];

    outerLoop: for await (const part of stream) {
      const strs: string[] = part.toString('utf-8').split('\n');
      for (const str of strs) {
        if (!str.trim()) {
          continue;
        }
        logger.info('生成结果: ', str);
        const message: HuggingFaceMessage = JSON.parse(
          str.replace('data: ', ''),
        );
        if (message.msg === 'process_completed') {
          const { success } = message;
          if (!success) {
            throw new Error('生成失败');
          }
          for (const item of message.output.data[0]) {
            const {
              image: { path },
            } = item;
            result.push(`
            https://levihsu-ootdiffusion.hf.space/--replicas/eldt3/file=${path}`);
          }
          break outerLoop;
        }
      }
      if (+new Date() - start >= timout * 1000) {
        throw new Error('生成超时');
      }
    }
    logger.info('生成成功: ', result);
    return result;
  }

  private async uploadImageToS3(
    session_hash: string,
    generatedImages: string[],
  ): Promise<string[]> {
    // 4. Upload to s3
    logger.info('开始上传到 oss ');
    const result: string[] = [];
    for (const index in generatedImages) {
      const generatedImageUrl = generatedImages[index];
      logger.info(`上传文件: ${generatedImageUrl}`);
      const buffer = await downloadFileAsBuffer(generatedImageUrl);
      const s3Helpers = new S3Helpers();
      const url = await s3Helpers.uploadFile(
        buffer,
        `artifacts/huggingface/ootdifussion/${session_hash}_${index}.png`,
      );
      logger.info(`上传文件 ${generatedImageUrl} 成功`);
      result.push(url);
    }
    return result;
  }

  public async halfBody(params: OOTDiffusionHalfBodyParams) {
    const {
      bodyImage,
      clothesImage,
      imageCount = 1,
      steps = 20,
      guidanceScale = 2,
      seed = -1,
    } = params;

    if (!bodyImage) {
      throw new Error('请上传身体图片');
    }
    if (!clothesImage) {
      throw new Error('请上传衣服图片');
    }
    const session_hash = generateRandomString(11);

    // 1. upload image
    const bodyImagePath = await this.uploadImageToHuggingFace(bodyImage);
    const clothImagePath = await this.uploadImageToHuggingFace(clothesImage);

    // 2. join queue
    const joinQueueApi = `https://levihsu-ootdiffusion.hf.space/--replicas/eldt3/queue/join?__theme=light`;
    await axios.post<{ event_id: string }>(joinQueueApi, {
      data: [
        {
          path: bodyImagePath,
          url: `https://levihsu-ootdiffusion.hf.space/--replicas/eldt3/file=${bodyImagePath}`,
          orig_name:
            bodyImagePath.split('/')[bodyImagePath.split('/').length - 1],
          size: null,
          mime_type: null,
        },
        {
          path: clothImagePath,
          url: `https://levihsu-ootdiffusion.hf.space/--replicas/eldt3/file=${clothImagePath}`,
          orig_name:
            clothImagePath.split('/')[clothImagePath.split('/').length - 1],
          size: null,
          mime_type: null,
        },
        imageCount,
        steps,
        guidanceScale,
        seed,
      ],
      event_data: null,
      fn_index: 2,
      trigger_id: 17,
      session_hash,
    });

    // 3. Get data stream
    const generatedImages = await this.poolForResult(session_hash);

    // 4. Upload to s3
    const result = await this.uploadImageToS3(session_hash, generatedImages);
    return {
      result,
    };
  }

  public async fullBody(params: OOTDiffusionFullBodyParams) {
    const {
      bodyImage,
      clothesImage,
      garmentCategory,
      imageCount = 1,
      steps = 20,
      guidanceScale = 2,
      seed = -1,
    } = params;

    if (!bodyImage) {
      throw new Error('请上传身体图片');
    }
    if (!clothesImage) {
      throw new Error('请上传衣服图片');
    }

    if (!garmentCategory) {
      throw new Error('请输入 garmentCategory');
    }

    const session_hash = generateRandomString(11);

    // 1. upload image
    const bodyImagePath = await this.uploadImageToHuggingFace(bodyImage);
    const clothImagePath = await this.uploadImageToHuggingFace(clothesImage);

    // 2. join queue
    const joinQueueApi = `https://levihsu-ootdiffusion.hf.space/--replicas/eldt3/queue/join?__theme=light`;
    await axios.post<{ event_id: string }>(joinQueueApi, {
      data: [
        {
          path: bodyImagePath,
          url: `https://levihsu-ootdiffusion.hf.space/--replicas/eldt3/file=${bodyImagePath}`,
          orig_name:
            bodyImagePath.split('/')[bodyImagePath.split('/').length - 1],
          size: null,
          mime_type: null,
        },
        {
          path: clothImagePath,
          url: `https://levihsu-ootdiffusion.hf.space/--replicas/eldt3/file=${clothImagePath}`,
          orig_name:
            clothImagePath.split('/')[clothImagePath.split('/').length - 1],
          size: null,
          mime_type: null,
        },
        garmentCategory,
        imageCount,
        steps,
        guidanceScale,
        seed,
      ],
      garmentCategory,
      event_data: null,
      fn_index: 8,
      trigger_id: 42,
      session_hash,
    });

    // 3. Get data stream
    const generatedImages = await this.poolForResult(session_hash);

    // 4. Upload to s3
    const result = await this.uploadImageToS3(session_hash, generatedImages);
    return {
      result,
    };
  }
}
