import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Guestbook',
  description: '포트폴리오용 방명록 웹 앱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
