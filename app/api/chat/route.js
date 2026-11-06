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
      return new Response('【系統提示】：未讀取到 GITHUB_TOKEN', { 
        status: 200, 
        headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
      });
    }

    const { messages } = await req.json();

    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    const reply = data.choices?.[0]?.message?.content || '軍師無回應';
    
    return new Response(reply, { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
    });

  } catch (err) {
    return new Response(`【底層網路異常】：${err.message}`, { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
    });
  }
}
