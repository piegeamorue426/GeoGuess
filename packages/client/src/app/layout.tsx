import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GeoGuess - Explore the World',
  description: 'A geography guessing game where you explore the world through panoramic imagery',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
