import axios from 'axios';
import fs from 'fs';
import path from 'path';

const getDirectDriveLink = (url: string): string => {
  const match = url.match(/\/d\/(.+?)\//);
  if (!match) throw new Error('Invalid Google Drive link format');
  const fileId = match[1];
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

export const downloadRecording = async (url: string): Promise<string> => {
  // Check if it's a Google Drive link and convert
  if (url.includes('drive.google.com') && url.includes('/file/d/')) {
    url = getDirectDriveLink(url);
  }

  const fileName = `recording_${Date.now()}.mp4`;
  const destPath = path.join('uploads', fileName);
  const writer = fs.createWriteStream(destPath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    validateStatus: status => status < 400, // Treat 4xx as errors
  });

  // Check if we accidentally got an HTML page
  const contentType = response.headers['content-type'];
  if (contentType && contentType.includes('text/html')) {
    throw new Error('URL did not return a valid audio/video file. Received HTML content instead.');
  }

  response.data.pipe(writer);
  console.log(`✅ Recording downloaded and saved to: ${destPath}`);
  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(destPath));
    writer.on('error', reject);
  });
};
