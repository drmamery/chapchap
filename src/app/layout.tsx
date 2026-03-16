import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import { NotificationProvider } from '@/components/providers/NotificationProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: {
    default: "ChapChap — Marketplace de Bouaké, Côte d'Ivoire",
    template: '%s | ChapChap',
  },
  description: "La première marketplace multi-vendeur de Bouaké. Paiement Mobile Money, Orange Money, MTN MoMo, Wave.",
  keywords: ['marketplace', 'Bouaké', "Côte d'Ivoire", 'achat en ligne', 'chapchap', 'mobile money'],
  authors: [{ name: 'ChapChap CI' }],
  manifest: '/manifest.json',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FF6B2C' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1A2E' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                <NotificationProvider>
                  {children}
                  <Toaster
                    position="top-right"
                    gutter={8}
                    toastOptions={{
                      duration: 4000,
                      style: { borderRadius: '12px', fontSize: '14px', fontWeight: '500' },
                      success: { style: { background: '#10B981', color: '#fff' } },
                      error: { style: { background: '#EF4444', color: '#fff' } },
                    }}
                  />
                </NotificationProvider>
              </CartProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
