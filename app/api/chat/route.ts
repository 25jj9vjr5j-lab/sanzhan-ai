import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SANZHAN_SYSTEM_PROMPT } from '@/config/prompts';

// 使用 Hugging Face 官方相容端點
const huggingface = createOpenAI({
  baseURL: 'https://api-inference.huggingface.co/v1/',
  apiKey: process.env.HF_TOKEN,
});

export async function POST(req: Request) {
  try {
    if (!process.env.HF_TOKEN) {
      return new Response('錯誤：Vercel 未讀取到 HF_TOKEN，請檢查 Environment Variables 設定。', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    const { messages } = await req.json();

    const result = await streamText({
      model: huggingface.chat('Qwen/Qwen2.5-72B-Instruct'),
      system: SANZHAN_SYSTEM_PROMPT,
      messages,
      temperature: 0.3,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    return new Response(`後端連線異常：${errorMsg}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
