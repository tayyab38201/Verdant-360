import './globals.css';

export const metadata = {
  title: 'VERDANT 360 | Hyperlocal Eco-Intelligence',
  description: 'Elite Urban Climate Resilience Platform by FortyGuard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F2F9F5] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}