import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SANZHAN_SYSTEM_PROMPT } from '@/config/prompts';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // 檢查是否所有可能的 Key 都沒填
  const token = process.env.HF_TOKEN || process.env.GITHUB_TOKEN || process.env.GROQ_API_KEY;

  if (!token) {
    return new Response(
      "【診斷結果】：Vercel 裡面完全沒有讀取到任何 API Key！\n請檢查 Vercel 的 Environment Variables 是否忘記填寫，或者 Key 的名字打錯了（必須是 HF_TOKEN 或 GITHUB_TOKEN）。",
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  try {
    const { messages } = await req.json();

    // 嘗試連線
    const provider = createOpenAI({
      baseURL: 'https://api-inference.huggingface.co/v1/',
      apiKey: token,
    });

    const result = await streamText({
      model: provider.chat('meta-llama/Llama-3.2-3B-Instruct'),
      system: SANZHAN_SYSTEM_PROMPT,
      messages,
      temperature: 0.3,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    // 關鍵：用 200 狀態把真實錯誤原因印在聊天室，不再讓系統彈出「An error occurred」
    const rawError = error?.message || JSON.stringify(error) || String(error);
    return new Response(
      `【連線失敗，真實原因如下】：\n${rawError}\n\n請把這段字複製或截圖發給我！`,
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }
}
    const errorMsg = error?.message || String(error);
    return new Response(`後端連線異常：${errorMsg}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
