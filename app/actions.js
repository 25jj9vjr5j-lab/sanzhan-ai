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
    // 優先讀取 GITHUB_TOKEN
    const token = process.env.GITHUB_TOKEN || process.env.HF_TOKEN;

    if (!token) {
      return '【系統提示】：尚未在 Vercel 設定 GITHUB_TOKEN 環境變數！';
    }

    // 改用微軟 GitHub 官方的高速穩定端點，杜絕 fetch failed
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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

    const data = await response.json();

    if (data.error) {
      return `【AI 平台回應】：${data.error.message || JSON.stringify(data.error)}`;
    }

    return data.choices?.[0]?.message?.content || '軍師暫無回應，請重試。';
  } catch (err) {
    return `【連線異常】：${err.message} (請確認 Vercel 的 GITHUB_TOKEN 是否正確填寫)`;
  }
}
