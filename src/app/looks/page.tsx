import { redirect } from 'next/navigation';
import { auth } from '../../../auth';
import { SavedLooks } from '@/components/saved-looks';

export const dynamic = 'force-dynamic';

export default async function SavedLooksPage() {
  const session = await auth();
  if (!session?.user) redirect('/sign-in?callbackUrl=/looks');

  return <SavedLooks userName={session.user.name || ''}/>;
}
