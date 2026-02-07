import { redirect } from 'next/navigation';
import { auth } from '@/core/auth/auth';
import { SessionProvider } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Sidebar } from '@/components/layout/sidebar';
import { Fab } from '@/components/layout/fab';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Header />
        <main className="pb-20 lg:pb-0 lg:pl-60">
          <div className="mx-auto max-w-5xl p-4">{children}</div>
        </main>
        <BottomNav />
        <Fab />
      </div>
    </SessionProvider>
  );
}
