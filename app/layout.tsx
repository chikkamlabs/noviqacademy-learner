import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Noviq Academy Learner',
  description: 'Noviq Academy Learner platform.',
  openGraph: {
    title: 'Noviq Academy Learner',
    description: 'Noviq Academy Learner platform.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noviq Academy Learner',
    description: 'Noviq Academy Learner platform.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
