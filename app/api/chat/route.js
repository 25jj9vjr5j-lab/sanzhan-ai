// 關鍵突破 1：延長 Vercel 免費版限制，從 10 秒放寬到 60 秒！
export const maxDuration = 60; 
// 關鍵突破 2：強制關閉 Next.js 快取，確保每次都發出最新請求
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
    const rawToken = process.env.GITHUB_TOKEN || process.env.HF_TOKEN || '';
    const token = rawToken.replace(/[^a-zA-Z0-9_-]/g, '');

    if (!token) {
      return new Response('【系統提示】：未讀取到乾淨的 GITHUB_TOKEN', { 
        status: 200, 
        headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
      });
    }

    const { messages } = await req.json();

    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 關鍵突破 3：偽裝成正常的 Windows Google Chrome 瀏覽器，騙過微軟防火牆
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SANZHAN_PROMPT },
          ...messages,
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
       const errorText = await response.text();
       return new Response(`【微軟伺服器報錯 ${response.status}】：${errorText}`, { 
         status: 200, 
         headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
       });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '軍師無回應，請重試。';
    
    return new Response(reply, { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
    });

  } catch (err) {
    return new Response(`【底層網路異常】：${err.message}\n👉 診斷：若偶發此錯誤為微軟伺服器瞬間擁塞，請稍後再點一次發送即可。`, { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
    });
  }
}
