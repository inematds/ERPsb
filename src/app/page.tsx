import { redirect } from 'next/navigation';
import { auth } from '@/core/auth/auth';

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  redirect('/financeiro');
}
