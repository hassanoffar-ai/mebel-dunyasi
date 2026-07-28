import '../../style.css';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mebel Dünyası — Hesab Yaradın',
  description: 'Mebel Dünyası istifadəçi qeydiyyatı səhifəsi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az">
      <body>{children}</body>
    </html>
  );
}
