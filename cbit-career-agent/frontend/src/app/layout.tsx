import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/auth-context';
import { QueryProvider } from '@/contexts/query-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CBIT Personal AI Career Agent',
  description: 'AI-powered career assistance for CBIT students - job hunting, internships, hackathons, and career development',
  keywords: ['career', 'AI', 'job hunting', 'internships', 'hackathons', 'CBIT', 'students'],
  authors: [{ name: 'CBIT Career Agent Team' }],
  creator: 'CBIT Career Agent Team',
  publisher: 'CBIT Career Agent',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cbit-career-agent.com',
    title: 'CBIT Personal AI Career Agent',
    description: 'AI-powered career assistance for CBIT students',
    siteName: 'CBIT Career Agent',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CBIT Personal AI Career Agent',
    description: 'AI-powered career assistance for CBIT students',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background font-sans antialiased">
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                    },
                  }}
                />
              </div>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}