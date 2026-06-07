import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/navbar';

export default async function FeedbackWallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <>
      <Navbar user={session.user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}
