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
    
    // 終極暴力淨化：只保留大小寫英文、數字、底線、橫線，其他隱形空格/亂碼全部砍掉！
    const token = rawToken.replace(/[^a-zA-Z0-9_-]/g, '');

    if (!token) {
      return '【系統提示】：Vercel 中未設定或未讀取到 GITHUB_TOKEN！';
    }

    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Authorization': `Bearer ${token}` // 現在這個 token 絕對是 100% 乾淨的
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
       return `【微軟伺服器拒絕連線 ${response.status}】：${errorText}`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '軍師暫無回應，請重試。';
    
  } catch (err) {
    // 若依然失敗，顯示出淨化後的 Token 長度，確認是否有讀到東西
    const rawToken = process.env.GITHUB_TOKEN || process.env.HF_TOKEN || '';
    const token = rawToken.replace(/[^a-zA-Z0-9_-]/g, '');
    
    return `【強制淨化版報錯】：${err.message}\n👉 診斷：目前讀到的乾淨密碼長度為 ${token.length} 字元。如果長度為 0，代表 Vercel 環境變數真的沒設定成功。`;
  }
}
