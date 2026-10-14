import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TTMS - VJTI Timetable Management System',
  description:
    'Automated Platform for Institutional Timetable Generation, Scheduling and Conflict Management - VJTI Mumbai Department of Computer Engineering & Information Technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

