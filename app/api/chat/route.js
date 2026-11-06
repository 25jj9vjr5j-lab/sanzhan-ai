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
    // 優先讀取 HF_TOKEN，並自動清除隱形亂碼
    const rawToken = process.env.HF_TOKEN || process.env.GITHUB_TOKEN || '';
    const token = rawToken.replace(/[^a-zA-Z0-9_-]/g, '');

    if (!token) {
      return new Response('【系統提示】：未讀取到乾淨的 HF_TOKEN', { 
        status: 200, 
        headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
      });
    }

    const { messages } = await req.json();

    const reply = await new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        model: 'Qwen/Qwen2.5-72B-Instruct', // 使用 Hugging Face 上的千問 72B 頂級大模型
        messages: [{ role: 'system', content: SANZHAN_PROMPT }, ...messages],
        temperature: 0.3,
        max_tokens: 1500
      });

      // 替換為 Hugging Face 伺服器
      const options = {
        hostname: 'api-inference.huggingface.co',
        port: 443,
        path: '/v1/chat/completions',
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
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode !== 200) {
              resolve(`【HuggingFace 報錯 ${res.statusCode}】：${parsed.error?.message || parsed.error || data}`);
            } else {
              resolve(parsed.choices?.[0]?.message?.content || '軍師無回應');
            }
          } catch (e) {
            resolve(`【資料解析失敗】：${data}`);
          }
        });
      });

      request.on('error', (e) => reject(e));
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
