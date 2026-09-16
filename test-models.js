import { GoogleGenAI } from '@google/genai';

async function main() {
  const key = process.env.GEMINI_API_KEY;
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.list();
    for await (const model of response) {
      console.log(model.name);
    }
  } catch (err) {
    console.log("Error:", err.message);
  }
}
main();
