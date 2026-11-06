import https from 'https';

export const maxDuration = 60;
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
      return new Response('【系統提示】：未讀取到 GITHUB_TOKEN', { 
        status: 200, 
        headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
      });
    }

    const { messages } = await req.json();

    // 啟動原生連線模組，徹底拋棄會報錯的 fetch
    const reply = await new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: SANZHAN_PROMPT }, ...messages],
        temperature: 0.3
      });

      const options = {
        hostname: 'models.inference.ai.azure.com',
        port: 443,
        path: '/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Length': Buffer.byteLength(payload),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      };

      const request = https.request(options, (res) => {
        let data = '';
        // 接收伺服器傳回的資料碎片
        res.on('data', (chunk) => { data += chunk; });
        // 接收完成，開始組合解析
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode !== 200) {
              resolve(`【微軟伺服器報錯 ${res.statusCode}】：${parsed.error?.message || data}`);
            } else {
              resolve(parsed.choices?.[0]?.message?.content || '軍師無回應');
            }
          } catch (e) {
            resolve(`【資料解析失敗】：${data}`);
          }
        });
      });

      // 如果底層網路真的斷線，才會觸發這裡
      request.on('error', (e) => reject(e));
      
      // 送出請求
      request.write(payload);
      request.end();
    });

    return new Response(reply, { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
    });

  } catch (err) {
    return new Response(`【底層原生連線異常】：${err.message}`, { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
    });
  }
}
