import {
  MonkeyToolCategories,
  MonkeyToolDescription,
  MonkeyToolDisplayName,
  MonkeyToolExtra,
  MonkeyToolIcon,
  MonkeyToolInput,
  MonkeyToolName,
  MonkeyToolOutput,
} from '@/common/decorators/monkey-block-api-extensions.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import {
  OOTDiffusionFullBodyParams,
  OOTDiffusionHalfBodyParams,
  OotdifussionService,
} from './ootdifussion.service';

@Controller('ootdifussion')
export class OotdifussionController {
  constructor(private readonly service: OotdifussionService) {}

  @Post('/half-body')
  @MonkeyToolName('huggingface_OOTDiffusion_halfbody')
  @MonkeyToolDisplayName('OOTDiffusion 换衣（半身）')
  @MonkeyToolDescription('基于 OOTDiffusion 模型对人物进行换衣。')
  @MonkeyToolCategories(['gen-image'])
  @MonkeyToolIcon('emoji:🏞️:#ceefc5')
  @MonkeyToolInput([
    {
      name: 'bodyImage',
      displayName: '身体图片',
      type: 'file',
      required: true,
      typeOptions: {
        // 是否支持多文件上传
        multipleValues: false,
        // 文件类型限制，例如：'.jpg,.png,.gif'
        accept: '.jpg,.jpeg,.png',
        // 文件数量限制
        // multipleValues 为 false 时，下面两个的值不需要填，因为只能为 1
        minValue: 1,
        maxValue: 1,
        maxSize: 1024 * 1024 * 10,
      },
    },
    {
      name: 'clothesImage',
      displayName: '衣服图片',
      type: 'file',
      required: true,
      typeOptions: {
        // 是否支持多文件上传
        multipleValues: false,
        // 文件类型限制，例如：'.jpg,.png,.gif'
        accept: '.jpg,.jpeg,.png',
        // 文件数量限制
        // multipleValues 为 false 时，下面两个的值不需要填，因为只能为 1
        minValue: 1,
        maxValue: 1,
        maxSize: 1024 * 1024 * 10,
      },
    },
    {
      name: 'garmentCategory',
      displayName: '生成类型',
      type: 'options',
      required: true,
      description: '选择的生成类型必须和上传的图片一致，否则可能生成失败',
      options: [
        {
          name: 'Upper-body',
          value: 'Upper-body',
        },
        {
          name: 'Lower-body',
          value: 'Lower-body',
        },
        {
          name: 'Dress',
          value: 'Dress',
        },
      ],
    },
    {
      name: 'imageCount',
      displayName: '生成图片数量',
      type: 'number',
      required: true,
      default: 1,
      typeOptions: {
        maxValue: 5,
        minValue: 1,
      },
    },
    {
      name: 'steps',
      displayName: 'Steps',
      type: 'number',
      required: true,
      default: 20,
    },
    {
      name: 'guidanceScale',
      displayName: 'Guidance Scale',
      type: 'number',
      required: true,
      default: 2,
    },
    {
      name: 'seed',
      displayName: 'Seed',
      type: 'number',
      required: true,
      default: -1,
    },
  ])
  @MonkeyToolOutput([
    {
      name: 'result',
      displayName: '生成图片链接',
      type: 'string',
      required: true,
      typeOptions: {
        multipleValues: true,
      },
    },
  ])
  @MonkeyToolExtra({
    estimateTime: 20,
  })
  public async runOOTDiffusionHalfBody(
    @Body() body: OOTDiffusionHalfBodyParams,
  ) {
    const result = await this.service.halfBody(body);
    return result;
  }

  @Post('/full-body')
  @MonkeyToolName('huggingface_OOTDiffusion_fullbody')
  @MonkeyToolDisplayName('OOTDiffusion 换衣（全身）')
  @MonkeyToolDescription('基于 OOTDiffusion 模型对人物进行换衣。')
  @MonkeyToolCategories(['gen-image'])
  @MonkeyToolIcon('emoji:🏞️:#ceefc5')
  @MonkeyToolInput([
    {
      name: 'bodyImage',
      displayName: '身体图片',
      type: 'file',
      required: true,
      typeOptions: {
        // 是否支持多文件上传
        multipleValues: false,
        // 文件类型限制，例如：'.jpg,.png,.gif'
        accept: '.jpg,.jpeg,.png',
        // 文件数量限制
        // multipleValues 为 false 时，下面两个的值不需要填，因为只能为 1
        minValue: 1,
        maxValue: 1,
        maxSize: 1024 * 1024 * 10,
      },
    },
    {
      name: 'clothesImage',
      displayName: '衣服图片',
      type: 'file',
      required: true,
      typeOptions: {
        // 是否支持多文件上传
        multipleValues: false,
        // 文件类型限制，例如：'.jpg,.png,.gif'
        accept: '.jpg,.jpeg,.png',
        // 文件数量限制
        // multipleValues 为 false 时，下面两个的值不需要填，因为只能为 1
        minValue: 1,
        maxValue: 1,
        maxSize: 1024 * 1024 * 10,
      },
    },
    {
      name: 'garmentCategory',
      displayName: '生成类型',
      type: 'options',
      required: true,
      description: '选择的生成类型必须和上传的图片一致，否则可能生成失败',
      options: [
        {
          name: 'Upper-body',
          value: 'Upper-body',
        },
        {
          name: 'Lower-body',
          value: 'Lower-body',
        },
        {
          name: 'Dress',
          value: 'Dress',
        },
      ],
    },
    {
      name: 'imageCount',
      displayName: '生成图片数量',
      type: 'number',
      required: true,
      default: 1,
      typeOptions: {
        maxValue: 5,
        minValue: 1,
      },
    },
    {
      name: 'steps',
      displayName: 'Steps',
      type: 'number',
      required: true,
      default: 20,
    },
    {
      name: 'guidanceScale',
      displayName: 'Guidance Scale',
      type: 'number',
      required: true,
      default: 2,
    },
    {
      name: 'seed',
      displayName: 'Seed',
      type: 'number',
      required: true,
      default: -1,
    },
  ])
  @MonkeyToolOutput([
    {
      name: 'result',
      displayName: '生成图片链接',
      type: 'string',
      required: true,
      typeOptions: {
        multipleValues: true,
      },
    },
  ])
  @MonkeyToolExtra({
    estimateTime: 20,
  })
  public async runOOTDiffusionFullBody(
    @Body() body: OOTDiffusionFullBodyParams,
  ) {
    const result = await this.service.fullBody(body);
    return result;
  }
}
