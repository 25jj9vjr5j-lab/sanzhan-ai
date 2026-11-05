import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SANZHAN_SYSTEM_PROMPT } from '@/config/prompts';

export const runtime = 'edge';

// 使用 Hugging Face 官方免費的 OpenAI 相容路由器
const huggingface = createOpenAI({
  baseURL: 'https://router.huggingface.co/novita/v1',
  apiKey: process.env.HF_TOKEN,
});

export async function POST(req: Request) {
  try {
    if (!process.env.HF_TOKEN) {
      return new Response('尚未在 Vercel 設定 HF_TOKEN 環境變數', { status: 500 });
    }

    const { messages } = await req.json();

    const result = await streamText({
      // 調用 Meta 開源最新、中文理解極佳的 Llama 3.3 70B 模型
      model: huggingface.chat('meta-llama/Llama-3.3-70B-Instruct'),
      system: SANZHAN_SYSTEM_PROMPT,
      messages,
      temperature: 0.3,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    return new Response(error?.message || '連線異常，請檢查 HF_TOKEN。', {
      status: 500,
    });
  }
}
