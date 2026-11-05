export const dynamic = 'force-dynamic';

const SANZHAN_PROMPT = `
你是一位精通手機遊戲《三國志·戰略版》的配將導師與軍師助理。
請遵循以下規範回答：
1. 戰法平替：依序給出 S 級平替、A 級平民平替、加點調整建議與實戰代價預警。
2. 嚴禁虛構不存在的戰法或武將陣營。
3. 全部使用條理化的 Markdown 標題與粗體標記。
`;

export async function POST(req) {
  try {
    const token = process.env.HF_TOKEN || process.env.GITHUB_TOKEN;

    if (!token) {
      return new Response('未在 Vercel 設定 HF_TOKEN 或 GITHUB_TOKEN', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const { messages } = await req.json();

    const response = await fetch('https://api-inference.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages: [
          { role: 'system', content: SANZHAN_PROMPT },
          ...messages,
        ],
        stream: false,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return new Response(`AI平台回應：${data.error.message || JSON.stringify(data.error)}`, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const reply = data.choices?.[0]?.message?.content || '軍師暫無回應，請稍後重試。';
    return new Response(reply, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    return new Response(`伺服器錯誤：${err.message}`, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
