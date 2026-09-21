import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

/**
 * Official Google AI Studio SDK integration helper for DARLEK CAAN.
 * Lazily initializes the GoogleGenerativeAI client using server-side GEMINI_API_KEY.
 */

let genAIClient: GoogleGenerativeAI | null = null;

export function getGoogleGenerativeAIClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required to initialize GoogleGenerativeAI.');
  }

  if (!genAIClient) {
    genAIClient = new GoogleGenerativeAI(apiKey);
  }
  return genAIClient;
}

export function isGenerativeAIConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY);
}

export function getGenerativeModel(
  modelName: string = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
): GenerativeModel {
  const client = getGoogleGenerativeAIClient();
  return client.getGenerativeModel({ model: modelName });
}

export async function generateContentWithGemini(
  prompt: string,
  modelName: string = 'gemini-1.5-flash'
): Promise<string> {
  const model = getGenerativeModel(modelName);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export const DarlekAI = {
  getClient: getGoogleGenerativeAIClient,
  isConfigured: isGenerativeAIConfigured,
  getModel: getGenerativeModel,
  generateText: generateContentWithGemini,
};
