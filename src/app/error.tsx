'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
export default function ErrorPage({error,reset}:{error:Error & {digest?:string};reset:()=>void}){useEffect(()=>{console.error('Application error:',error)},[error]);return <main className="grid min-h-[70vh] place-items-center px-6 text-center"><div><p className="eyebrow">Something unexpected</p><h1 className="display mt-5 text-6xl">Let’s try <i>again.</i></h1><p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-[#77796F]">We couldn’t load this page. Your work may still be safe.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={reset} className="btn-primary"><RefreshCw size={15}/> Try again</button><Link href="/" className="btn-secondary">Go home</Link></div></div></main>}
