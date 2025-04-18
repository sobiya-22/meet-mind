import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import {
  uploadToAssemblyAI,
  extractTasks,
  extractMinutes,
  generateSummaryFromAudioUrl,
  getTranscriptFromAudioUrl
} from '../services/analysisService';

interface AnalysisResult {
  transcript: string;
  summary: string;
  tasks: string[];
  minutes: string[];
  participants: string[];
  audioPath: string;
  timestamp: number;
}

// Use existing Chrome profile
const chromeUserDataDir = 'C:/Users/ASUS/AppData/Local/Google/Chrome/User Data';

export const joinAndRecordMeet = async (meetLink: string): Promise<string> => {
  const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // make sure this is correct
    userDataDir: 'C:\\Users\\YourUsername\\AppData\\Local\\Google\\Chrome\\User Data',
    args: [
      '--use-fake-ui-for-media-stream',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-infobars',
      '--disable-notifications',
      '--mute-audio'
    ]
  });

  const page = await browser.newPage();

  // Navigate directly to the Meet link
  await page.goto(meetLink);
  await page.waitForSelector('button[aria-label="Join now"]', { timeout: 60000 });
  await page.click('button[aria-label="Join now"]');

  // Start recording
  const outputPath = path.join('recordings', `audio_${Date.now()}.mp3`);
  const ffmpegProcess = spawn('ffmpeg', [
    '-f', 'dshow',
    '-i', 'audio="virtual-audio-capturer"', // Make sure VB-Audio or equivalent is installed
    '-t', '3600', // Max 1 hour
    outputPath,
  ]);

  console.log('Recording started...');
  await new Promise(resolve => setTimeout(resolve, 60000)); // record 1 minute for test
  ffmpegProcess.kill('SIGINT');

  await browser.close();
  console.log('Recording saved:', outputPath);
  return outputPath;
};

export const analyzeAudioFile = async (audioPath: string): Promise<AnalysisResult> => {
  const audioUrl = await uploadToAssemblyAI(audioPath);
  // console.log('audio url: ',audioUrl)
  const transcript = await getTranscriptFromAudioUrl(audioUrl);
  // console.log('transcript:',transcript)
  const summary = await generateSummaryFromAudioUrl(audioUrl);
  const { tasks } = await extractTasks(transcript);
  const { minutes } = await extractMinutes(transcript);

  return {
    transcript,
    summary,
    tasks,
    minutes,
    participants: [], // You can add this later
    audioPath,
    timestamp: Date.now(),
  };
};

