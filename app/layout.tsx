export const runtime = 'edge';

export const metadata = {
  title: '三國志·戰略版 軍師 AI',
  description: '配將推演與戰法平替助手',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
