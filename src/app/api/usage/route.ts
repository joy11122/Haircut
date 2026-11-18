import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getDailyUsage } from '@/lib/usage-controls';

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to view your AI preview allowance.' }, { status: 401 });
  }

  try {
    const usage = await getDailyUsage(session.user.id);
    return NextResponse.json(usage, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Your AI usage is temporarily unavailable.' }, { status: 503 });
  }
}
