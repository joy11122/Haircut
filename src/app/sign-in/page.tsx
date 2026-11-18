'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { ArrowLeft, Scissors, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const requestedCallback = searchParams.get('callbackUrl') || '/looks';
  const callbackUrl = requestedCallback.startsWith('/') && !requestedCallback.startsWith('//') && !requestedCallback.includes('\\')
    ? requestedCallback
    : '/looks';

  return <main className="container flex min-h-[calc(100vh-76px)] items-center justify-center py-16">
    <section className="soft-card w-full max-w-[460px] p-7 text-center sm:p-10">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#20231F] text-[#F5F3ED]"><Scissors size={21}/></span>
      <span className="eyebrow mt-7 block">Your personal style library</span>
      <h1 className="display mt-3 text-[42px] leading-tight">Keep the looks <i>you love.</i></h1>
      <p className="mx-auto mt-4 max-w-[320px] text-[12px] leading-6 text-[#77796F]">Sign in to save AI hairstyle previews, build your favorites and revisit your grooming ideas.</p>
      <button type="button" onClick={() => signIn('google', { callbackUrl })} className="btn-primary mt-8 w-full">Continue with Google</button>
      <p className="mt-5 flex items-center justify-center gap-2 text-[10px] text-[#85867D]"><ShieldCheck size={13}/> Your saved looks are private to your account.</p>
      <Link href="/" className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold text-[#68745B]"><ArrowLeft size={13}/> Back to Haircut</Link>
    </section>
  </main>;
}

export default function SignInPage() {
  return <Suspense fallback={<main className="container py-24 text-center text-sm text-[#77796F]">Loading sign-in…</main>}><SignInContent/></Suspense>;
}
