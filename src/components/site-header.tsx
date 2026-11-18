'use client';

import Link from 'next/link';
import { ArrowUpRight, LogOut, Menu, Scissors, UserRound } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

export function SiteHeader() {
  const { data: session, status } = useSession();

  return <header className="sticky top-0 z-50 border-b border-[#E5E2D9]/80 bg-[#F5F3ED]/90 backdrop-blur-xl">
    <div className="container flex h-[76px] items-center justify-between gap-3">
      <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Haircut home"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#20231F] text-[#F5F3ED]"><Scissors size={17}/></span><span className="text-[19px] font-semibold tracking-[-.06em]">haircut<span className="text-[#B58B5B]">.</span></span></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex"><Link className="text-[12px] text-[#62645D] transition hover:text-[#20231F]" href="/#how-it-works">How it works</Link><Link className="text-[12px] text-[#62645D] transition hover:text-[#20231F]" href="/#styles">Explore styles</Link><Link className="text-[12px] text-[#62645D] transition hover:text-[#20231F]" href="/#about">Our approach</Link><Link className="text-[12px] text-[#62645D] transition hover:text-[#20231F]" href="/privacy">Privacy</Link>{session?.user && <Link className="text-[12px] font-semibold text-[#68745B]" href="/looks">My saved looks</Link>}</nav>
      <div className="flex shrink-0 items-center gap-2">
        {status === 'loading' ? <span className="h-9 w-20 animate-pulse rounded bg-[#EAE9E1]" aria-label="Loading account"/> : session?.user ? <>
          <Link href="/looks" aria-label="My saved looks" title="My saved looks" className="grid h-9 w-9 place-items-center rounded border border-[#D8D5CA] text-[11px] font-semibold sm:flex sm:h-auto sm:w-auto sm:gap-2 sm:px-3 sm:py-2"><UserRound size={14}/><span className="hidden sm:inline">{session.user.name?.split(' ')[0] || 'My looks'}</span></Link>
          <button type="button" onClick={() => signOut({ callbackUrl: '/' })} aria-label="Sign out" title="Sign out" className="grid h-9 w-9 place-items-center rounded-full border border-[#D8D5CA] text-[#62645D] hover:bg-white"><LogOut size={15}/></button>
        </> : <Link href="/sign-in" className="inline-flex min-h-10 items-center gap-2 rounded border border-[#D8D5CA] px-3 text-[11px] font-semibold hover:bg-white">Sign in <ArrowUpRight size={13}/></Link>}
        <Link href="/#try-it" aria-label="Open style finder" className="grid h-10 w-10 place-items-center rounded-full border border-[#D8D5CA] md:hidden"><Menu size={17}/></Link>
      </div>
    </div>
  </header>;
}
