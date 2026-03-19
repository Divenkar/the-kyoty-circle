import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './providers';
import { Navbar } from '@/components/Navbar';
import { OnboardingGuard } from '@/components/OnboardingGuard';

import { getCurrentUser } from '@/lib/auth-server';

export const metadata: Metadata = {
  title: 'Kyoty — Community Events Across India',
  description: 'Discover verified communities, join incredible events, and connect with people in your city. Mumbai, Delhi, Bangalore, Hyderabad, Pune.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main>
            <OnboardingGuard user={user}>
              {children}
            </OnboardingGuard>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
