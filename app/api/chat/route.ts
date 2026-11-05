import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SANZHAN_SYSTEM_PROMPT } from '@/config/prompts';

export const runtime = 'edge';

const githubModels = createOpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
});

export async function POST(req: Request) {
  try {
    if (!process.env.GITHUB_TOKEN) {
      return new Response('尚未設定 GITHUB_TOKEN 環境變數', { status: 500 });
    }

    const { messages } = await req.json();

    const result = await streamText({
      // 關鍵修正：加上 .chat() 強制使用標準對話協定，解決 GitHub Models 0 回覆問題
      model: githubModels.chat('gpt-4o-mini'),
      system: SANZHAN_SYSTEM_PROMPT,
      messages,
      temperature: 0.3,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    return new Response(error?.message || '連線異常，請檢查 GITHUB_TOKEN。', {
      status: 500,
    });
  }
}
