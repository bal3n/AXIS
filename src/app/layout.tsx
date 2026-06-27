import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Axis Robotics Weekly Reports',
  description: 'Weekly robotics team reports with progress summaries and robot demo references.',
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
