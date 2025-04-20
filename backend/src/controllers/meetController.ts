import { Request, Response } from 'express';
import { joinAndRecordMeet, analyzeAudioFile } from '../utils/meetBot';
import { saveMeetingAnalysis } from '../services/dbService';
import { downloadRecording } from '../utils/downloadRecording';
// import multer from 'multer';
import path from 'path';
import fs from 'fs';

interface MeetingRequest {
  meetLink: string;
  meetingTitle: string;
}

interface RecordingRequest {
  recordingUrl?: string; // For drive/shared links
  meetingTitle: string;
}

// Add multer file type
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const startLiveMeetingBot = async (req: Request<{}, {}, MeetingRequest>, res: Response) => {
  console.log('Received request:', req.body);
  const { meetLink, meetingTitle } = req.body;
  
  if (!meetLink || !meetingTitle) {
    return res.status(400).json({ error: 'Missing required fields: meetLink and meetingTitle' });
  }

  try {
    const audioPath = await joinAndRecordMeet(meetLink || '');
    const analysis = await analyzeAudioFile(audioPath);
    // await saveMeetingAnalysis({
    //   ...analysis,
    //   title: meetingTitle,
    //   source: 'live_meeting'
    // });
    res.status(200).json({ 
      message: 'Meeting analyzed successfully.',
      analysis,
      meetingTitle,
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString(),
      participants: analysis.participants,
      duration: '1 hour', // This should be calculated from the actual recording
      recordingPath: audioPath
    });
  } catch (error) {
    console.error('Error in startLiveMeetingBot:', error);
    res.status(500).json({ error: 'Failed to process live meeting.' });
  }
};

// // Configure multer for file uploads
// const upload = multer({ dest: 'uploads/' });

export const analyzeRecording = async (req: MulterRequest, res: Response) => {
  const { meetingTitle } = req.body;
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;
  console.log('Received headers:', req.headers);
  if (!userId || !userEmail) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  try {
    let audioPath = '';

    if (req.body.recordingLink) {
      // 1. Download the file from Google Drive/shared link
      audioPath = await downloadRecording(req.body.recordingLink);

      console.log(`✅ Recording downloaded from link and saved to: ${audioPath}`);
    } else if (req.file) {
      // 2. Handle file uploaded from mobile
      const uploadedPath = req.file.path;
      console.log(uploadedPath);
      const newFileName = `${Date.now()}_${req.file.originalname}`;
      const newFilePath = path.join('uploads', newFileName);

      // Move file from temp to uploads with a better name
      fs.renameSync(uploadedPath, newFilePath);
      audioPath = newFilePath;

      console.log(`✅ Uploaded file received and moved to: ${audioPath}`);
    } else {
      return res.status(400).json({ error: 'No recording provided' });
    }

    // Perform analysis
    const analysisResults = await analyzeAudioFile(audioPath);
    console.log(analysisResults)
    // Save to DB
    await saveMeetingAnalysis({
      userId: userId,
      userEmail:userEmail,
      title: meetingTitle,
      source: 'recording',
      ...analysisResults,
    });

    res.json({
      message: 'Recording analysis successful',
      analysis: analysisResults,
      recordingPath: audioPath,
    });

  } catch (err) {
    console.error('❌ Analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze recording' });
  }
};
