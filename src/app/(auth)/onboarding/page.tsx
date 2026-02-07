import { redirect } from 'next/navigation';
import { auth } from '@/core/auth/auth';
import { basePrisma } from '@/lib/prisma';
import { OnboardingWizard } from './onboarding-wizard';

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Check if user already has an active tenant with completed onboarding
  const activeTenant = await basePrisma.userTenant.findFirst({
    where: { userId: session.user.id, isActive: true },
    include: { tenant: { select: { onboardingCompleted: true } } },
  });

  if (activeTenant?.tenant.onboardingCompleted) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px]">
        <OnboardingWizard />
      </div>
    </div>
  );
}
