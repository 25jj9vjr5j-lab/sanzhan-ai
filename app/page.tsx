'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Swords, ShieldAlert, Sparkles, User, RefreshCw } from 'lucide-react';

const QUICK_QUERIES = [
  "太尉盾沒有刮骨療毒如何平替？",
  "富貴騎缺撫輯軍民怎麼配？",
  "姜維關妹蔡文姬蜀騎開荒打地細節",
  "當鋒摧決有任何平替方案嗎？",
  "麒麟弓龐統兵書與速度加點推薦"
];

const SANZHAN_PROMPT = `
你是一位精通手機遊戲《三國志·戰略版》的配將導師與軍師助理。
請遵循以下規範回答：
1. 戰法平替：依序給出 S 級平替、A 級平民平替、加點調整建議與實戰代價預警。
2. 嚴禁虛構不存在的戰法或武將陣營。
3. 全部使用條理化的 Markdown 標題與粗體標記。
`;

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg = { role: 'user', content: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // 讀取前端專用的環境變數
      const rawToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
      const token = rawToken.replace(/[^a-zA-Z0-9_-]/g, '');

      if (!token) {
        throw new Error("請先在 Vercel 設定 NEXT_PUBLIC_GITHUB_TOKEN");
      }

      // 直接由你的手機/電腦瀏覽器發起連線，徹底繞過 Vercel 伺服器！
      const res = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SANZHAN_PROMPT },
            ...newMessages
          ],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`微軟拒絕連線 (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const replyText = data.choices?.[0]?.message?.content || '軍師暫無回應';
      
      setMessages([...newMessages, { role: 'assistant', content: replyText }]);
    } catch (e: any) {
      setMessages([...newMessages, { role: 'assistant', content: `連線失敗：${e.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen max-w-4xl mx-auto p-3 sm:p-6 bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between py-3 px-4 border-b border-slate-800 bg-slate-900 rounded-xl mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500">
            <Swords size={22} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              三戰戰略軍師 AI
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                無敵前端版
              </span>
            </h1>
            <p className="text-xs text-slate-400">配將推演 · 核心平替 · 戰法聯動 · 速度加點</p>
          </div>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 text-xs">
        {QUICK_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-full transition flex items-center gap-1.5"
          >
            <Sparkles size={12} className="text-amber-400" />
            {q}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 px-1 py-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
            <ShieldAlert size={36} className="text-slate-600" />
            <p className="text-sm">請輸入你想配將的陣容，或點選上方快捷按鈕測試。</p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 p-4 rounded-xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-amber-500/10 border border-amber-500/20 ml-8 sm:ml-20'
                  : 'bg-slate-900 border border-slate-800 mr-8 sm:mr-20'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {m.role === 'user' ? (
                  <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950 font-bold">
                    <User size={15} />
                  </div>
                ) : (
                  <div className="p-1.5 bg-slate-800 rounded-lg text-amber-400 border border-slate-700">
                    <Swords size={15} />
                  </div>
                )}
              </div>
              <div className="flex-1 whitespace-pre-wrap text-slate-200">
                {m.content}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-amber-400 text-xs px-4 py-2">
            <RefreshCw className="animate-spin" size={14} />
            <span>軍師正在推演戰報與戰法聯動中...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：司馬盾沒有草船和軍民，暫避給了麒麟弓，滿寵曹操該帶什麼？"
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-semibold px-5 py-3 rounded-xl transition flex items-center gap-1.5 shrink-0"
        >
          {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
          <span>發送</span>
        </button>
      </form>
    </main>
  );
}
