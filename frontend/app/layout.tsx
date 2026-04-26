import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskHive - Task Management System',
  description: 'A beautiful, secure task management system for personal productivity. Track your tasks, meet deadlines, and achieve your goals.',
  keywords: 'task management, productivity, todo list, project management, personal productivity, task tracker',
  authors: [{ name: 'TaskHive' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/logo_TaskHive.jpg',
    apple: '/logo_TaskHive.jpg',
  },
  openGraph: {
    title: 'TaskHive - Task Management System',
    description: 'Organize your tasks efficiently with TaskHive',
    images: ['/logo_TaskHive.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaskHive - Task Management System',
    description: 'Track your tasks, meet deadlines, and achieve your goals',
    images: ['/logo_TaskHive.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo_TaskHive.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo_TaskHive.jpg" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}