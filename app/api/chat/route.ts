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
    const { messages } = await req.json();

    const result = await streamText({
      model: githubModels('gpt-4o-mini'),
      system: SANZHAN_SYSTEM_PROMPT,
      messages,
      temperature: 0.3,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    return new Response(JSON.stringify({ error: '連線異常，請檢查 GITHUB_TOKEN 是否正確。' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
