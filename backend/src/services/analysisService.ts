import { AssemblyAI } from "assemblyai";
import fs from "fs";
import { callGemini } from '../utils/geminiService'; // your Gemini API wrapper

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

// ─── Upload Utility ──────────────────────────────
export const uploadToAssemblyAI = async (filePath: string): Promise<string> => {
  const readableStream = fs.createReadStream(filePath);
  const uploadUrl = await client.files.upload(readableStream);
  return uploadUrl;
};

// ─── Transcription from audio URL ──────────────────────────────
export const getTranscriptFromAudioUrl = async (audioUrl: string): Promise<string> => {
  try {
    const transcript = await client.transcripts.transcribe({ audio_url: audioUrl });
    const completedTranscript = await client.transcripts.get(transcript.id);

    if (completedTranscript.status === "completed") {
      return completedTranscript.text || "Transcript unavailable";
    } else {
      throw new Error(completedTranscript.error || "Transcription failed.");
    }
  } catch (error) {
    console.error("Error during transcription:", error);
    return "__ERROR__";
  }
};

// ─── Summary from audio URL ──────────────────────────────
export const generateSummaryFromAudioUrl = async (audioUrl: string): Promise<string> => {
  try {
    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
      summarization: true,
      summary_type: "bullets",
      summary_model: "informative",
    });

    const completedTranscript = await client.transcripts.get(transcript.id);
    return completedTranscript.summary || "No summary available";
  } catch (error) {
    console.error("Summary generation error:", error);
    return "Summary error";
  }
};

// ─── Task Extraction (Gemini AI) ──────────────────────────────
export const extractTasks = async (transcript: string): Promise<{ tasks: string[] }> => {
  const prompt = `
You are an assistant that extracts actionable tasks from meeting transcripts.

Transcript:
"""
${transcript}
"""

Instructions:
- Identify clear tasks mentioned in the meeting.
- For each task, extract:
  - "title": a short, clear description of the task
  - "dueDate": the due date if mentioned, or null if not specified
- Return the result as a JSON array of objects with "title" and "dueDate" fields.
- Do not include any explanation. Output ONLY the JSON array.

Example output:
[
  {
    "title": "Prepare the monthly report",
    "dueDate": "2025-04-20"
  },
  {
    "title": "Follow up with the marketing team",
    "dueDate": null
  },
  {
    "title": "Schedule a meeting with the client",
    "dueDate": "2025-04-15"
  }
]
`;


  const response = await callGemini(prompt);

  try {
    const tasks = JSON.parse(response);
    return { tasks: Array.isArray(tasks) ? tasks : ["No clear tasks identified"] };
  } catch (e) {
    console.error('❌ Failed to parse Gemini task output:', e);
    return { tasks: ["No clear tasks identified"] };
  }
};

// ─── Minutes Extraction (Gemini AI) ──────────────────────────────
export const extractMinutes = async (transcript: string): Promise<{ minutes: string[] }> => {
  const prompt = `
You are an assistant that summarizes meeting transcripts into key minutes.

Transcript:
"""
${transcript}
"""

Instructions:
- Extract important discussion points, decisions, and updates.
- Each point must be in one simple sentence.
- Return the result as a JSON array of bullet points.
- No introduction, just the JSON array.

Example output:
[
  "The team agreed to launch the new feature next Monday",
  "Budget constraints were discussed in detail",
  "Client feedback will be reviewed in the next meeting"
]
`;

  const response = await callGemini(prompt);

  try {
    const minutes = JSON.parse(response);
    return { minutes: Array.isArray(minutes) ? minutes : ["No clear minutes extracted"] };
  } catch (e) {
    console.error('❌ Failed to parse Gemini minutes output:', e);
    return { minutes: ["No clear minutes extracted"] };
  }
};
