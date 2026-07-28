import '../../style.css';
import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Mebel Dünyası — Premium Mebellər',
  description: 'Müasir və minimalist mebel kolleksiyası.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
