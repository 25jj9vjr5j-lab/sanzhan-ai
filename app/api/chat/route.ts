import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SANZHAN_SYSTEM_PROMPT } from '@/config/prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const token = process.env.HF_TOKEN || process.env.GITHUB_TOKEN;

    if (!token) {
      return new Response('未設定 HF_TOKEN 或 GITHUB_TOKEN', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const { messages } = await req.json();

    const provider = createOpenAI({
      baseURL: 'https://api-inference.huggingface.co/v1/',
      apiKey: token,
    });

    const result = await streamText({
      model: provider.chat('Qwen/Qwen2.5-72B-Instruct'),
      system: SANZHAN_SYSTEM_PROMPT,
      messages,
      temperature: 0.3,
    });

    return result.toDataStreamResponse();
  } catch (err: any) {
    return new Response(String(err?.message || err), {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
