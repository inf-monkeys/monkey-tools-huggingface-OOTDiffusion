import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { DOWNLOAD_FOLDER } from '../config';

export async function downloadFile(url: string) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    const imageBuffer = Buffer.from(response.data, 'binary');
    url = url.split('?')[0];
    url = url.split('/')[url.split('/').length - 1];
    const filename = path.join(DOWNLOAD_FOLDER, url);
    fs.writeFileSync(filename, imageBuffer);
    return filename;
  } catch (error) {
    console.error('Error save image:', error);
    throw new Error(`下载文件失败: ${error.message}`);
  }
}

export async function downloadFileAsBuffer(url: string) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    const imageBuffer = Buffer.from(response.data, 'binary');
    return imageBuffer;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}
