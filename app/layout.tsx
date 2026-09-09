import type {Metadata} from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Festival Teater Modern Pelajar SMA/SMK/MA XXVI',
  description: 'Portal Pendaftaran Online, Unduhan Naskah, Publikasi Informasi, & Tiketing Online Festival Teater Modern Pelajar Jatim/NTB 2026',
  icons: {
    icon: '/ftmp.png',
    shortcut: '/ftmp.png',
    apple: '/ftmp.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href="/ftmp.png" />
        <link rel="shortcut icon" href="/ftmp.png" />
        <link rel="apple-touch-icon" href="/ftmp.png" />
      </head>
      <body className="font-sans antialiased text-slate-100 bg-slate-950" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
