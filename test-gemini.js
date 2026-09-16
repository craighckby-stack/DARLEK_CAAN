import { GoogleGenAI } from '@google/genai';

async function main() {
  const key = process.env.GEMINI_API_KEY;
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const res = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Hello',
    });
    console.log("Response:", res.text);
  } catch (err) {
    console.log("Error type:", err.constructor.name);
    console.log("Error msg:", err.message);
  }
}
main();
