import Link from 'next/link';
import { ArrowUpRight, Menu, Scissors } from 'lucide-react';

export function SiteHeader() {
  return <header className="sticky top-0 z-50 border-b border-[#E5E2D9]/80 bg-[#F5F3ED]/90 backdrop-blur-xl">
    <div className="container flex h-[76px] items-center justify-between">
      <Link href="/" className="flex items-center gap-3" aria-label="Haircut home"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#20231F] text-[#F5F3ED]"><Scissors size={17}/></span><span className="text-[19px] font-semibold tracking-[-.06em]">haircut<span className="text-[#B58B5B]">.</span></span></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-9 md:flex"><Link className="text-[12px] text-[#62645D] transition hover:text-[#20231F]" href="#how-it-works">How it works</Link><Link className="text-[12px] text-[#62645D] transition hover:text-[#20231F]" href="#styles">Explore styles</Link><Link className="text-[12px] text-[#62645D] transition hover:text-[#20231F]" href="#about">Our approach</Link></nav>
      <div className="flex items-center gap-3"><Link href="#try-it" className="hidden items-center gap-2 text-[12px] font-bold sm:inline-flex">Find my style <ArrowUpRight size={14}/></Link><Link href="#try-it" aria-label="Open style finder" className="grid h-10 w-10 place-items-center rounded-full border border-[#D8D5CA] md:hidden"><Menu size={17}/></Link></div>
    </div>
  </header>;
}
