'use server';

const SANZHAN_PROMPT = `
你是一位精通手機遊戲《三國志·戰略版》的配將導師與軍師助理。
請遵循以下規範回答：
1. 戰法平替：依序給出 S 級平替、A 級平民平替、加點調整建議與實戰代價預警。
2. 嚴禁虛構不存在的戰法或武將陣營。
3. 全部使用條理化的 Markdown 標題與粗體標記。
`;

export async function askJunshi(messages) {
  try {
    const rawToken = process.env.GITHUB_TOKEN || process.env.HF_TOKEN || '';
    const token = rawToken.trim();

    if (!token) {
      return '【系統提示】：尚未在 Vercel 設定 GITHUB_TOKEN 環境變數！';
    }

    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      cache: 'no-store', // 關鍵修復 1：強制每次都重新發送，不准 Vercel 偷懶用快取
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', // 關鍵修復 2：偽裝成 Windows 電腦瀏覽器，突破微軟防火牆
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
       return `【API 拒絕連線 ${response.status}】：${errorText}`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '軍師暫無回應，請重試。';
    
  } catch (err) {
    // 萬一再失敗，印出密碼前 4 碼，讓我們一眼看出 Vercel 到底有沒有讀到對的密碼
    const rawToken = process.env.GITHUB_TOKEN || process.env.HF_TOKEN || '';
    const safeHint = rawToken.length > 4 ? rawToken.substring(0, 4) + '***' : '空';
    
    return `【伺服器斷線】：${err.message} \n\n👉 系統診斷：讀取到的密碼開頭為「${safeHint}」。\n如果顯示為 ghp_ 或 hf_，代表密碼正確，純粹是伺服器網路波動，請再點一次發送。`;
  }
}
