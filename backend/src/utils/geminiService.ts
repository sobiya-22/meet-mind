import { GoogleGenerativeAI } from '@google/generative-ai';

  
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const callGemini = async (prompt: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};
