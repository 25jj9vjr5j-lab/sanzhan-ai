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
    // 關鍵修復：.trim() 會自動把多餘的隱形空格和換行刪掉
    const rawToken = process.env.GITHUB_TOKEN || process.env.HF_TOKEN || '';
    const token = rawToken.trim();

    if (!token) {
      return '【系統提示】：尚未在 Vercel 設定 GITHUB_TOKEN 環境變數！';
    }

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

    // 如果微軟伺服器拒絕，直接把真實原因印出來
    if (!response.ok) {
       const errorText = await response.text();
       return `【API 拒絕連線 ${response.status}】：${errorText}`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '軍師暫無回應，請重試。';
    
  } catch (err) {
    return `【Fetch 崩潰原因】：${err.message} \n\n👉 解決辦法：請到 Vercel 的 Environment Variables，把 GITHUB_TOKEN 刪除並「重新貼上一次」，小心不要複製到前後的空白！`;
  }
}
