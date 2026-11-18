import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
export default function NotFound(){return <main className="grid min-h-[70vh] place-items-center px-6 text-center"><div><p className="eyebrow">404 / Page not found</p><h1 className="display mt-5 text-7xl">Lost your <i>way?</i></h1><p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-[#77796F]">This page may have moved, or the link may be out of date.</p><Link href="/" className="btn-primary mt-8"><ArrowLeft size={15}/> Back to home</Link></div></main>}
