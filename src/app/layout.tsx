import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from './providers';
import { Navbar } from '@/components/Navbar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { OnboardingGuard } from '@/components/OnboardingGuard';
import { Footer } from '@/components/Footer';

import { getCurrentUser } from '@/lib/auth-server';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Kyoty — Community Events Across India',
  description: 'Discover verified communities, join incredible events, and connect with people in your city. Noida, Delhi, Gurgaon, Bangalore.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <Navbar
            initialUserRole={user?.role ?? null}
            initialUserEmail={user?.email ?? null}
            initialUserName={user?.name ?? null}
            initialAvatarUrl={user?.avatar_url ?? null}
            initialUserId={user?.id ?? null}
          />
          <main className="flex-1 pb-24 md:pb-0">
            <OnboardingGuard user={user}>
              {children}
            </OnboardingGuard>
          </main>
          <MobileBottomNav />
          <Footer />
          <Toaster richColors position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
