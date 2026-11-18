'use client';

/* eslint-disable @next/next/no-img-element -- saved images use per-user Cloudinary URLs. */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Heart, LoaderCircle, Scissors, Trash2 } from 'lucide-react';

type Look = {
  id: string;
  styleId: string;
  styleName: string;
  imageUrl: string;
  favorite: boolean;
  createdAt: string;
};

export function SavedLooks({ userName }: { userName: string }) {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/looks', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json() as { looks?: Look[]; error?: string };
        if (!response.ok) throw new Error(data.error || 'Could not load your saved looks.');
        if (active) setLooks(data.looks ?? []);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Could not load your saved looks.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function toggleFavorite(look: Look) {
    setBusyId(look.id);
    setError('');
    try {
      const response = await fetch('/api/looks/' + look.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: !look.favorite }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not update favorite.');
      setLooks((current) => current.map((item) => item.id === look.id ? { ...item, favorite: !item.favorite } : item));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update favorite.');
    } finally {
      setBusyId('');
    }
  }

  async function removeLook(look: Look) {
    if (!window.confirm('Delete this saved hairstyle? This also removes its stored image.')) return;
    setBusyId(look.id);
    setError('');
    try {
      const response = await fetch('/api/looks/' + look.id, { method: 'DELETE' });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not delete this saved look.');
      setLooks((current) => current.filter((item) => item.id !== look.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete this saved look.');
    } finally {
      setBusyId('');
    }
  }

  const favorites = looks.filter((look) => look.favorite);

  return <main className="container min-h-[70vh] py-14 sm:py-20">
    <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#E5E2D9] pb-7">
      <div><span className="eyebrow">Your private collection</span><h1 className="display mt-3 text-[46px] leading-none">Saved <i>looks.</i></h1><p className="mt-3 text-[12px] text-[#77796F]">Welcome back{userName ? ', ' + userName : ''}. Your style ideas, all in one place.</p></div>
      <Link href="/#try-it" className="btn-primary">Create a new look <ArrowUpRight size={14}/></Link>
    </div>
    <div className="mt-8 flex flex-wrap gap-5 text-[11px] text-[#77796F]"><span>{looks.length} / 50 saved</span><span>{favorites.length} favorites</span></div>
    {error && <p role="alert" className="mt-6 rounded border border-red-200 bg-red-50 p-3 text-[12px] text-red-700">{error}</p>}
    {loading ? <div className="flex min-h-[280px] items-center justify-center gap-3 text-[12px] text-[#77796F]"><LoaderCircle size={17} className="animate-spin"/> Loading your looks…</div> : looks.length === 0 ? (
      <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded border border-dashed border-[#C9C7BD] bg-[#F8F7F3] px-5 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#E9EAE2] text-[#68745B]"><Scissors size={20}/></span>
        <h2 className="display mt-5 text-[30px]">Your collection starts here.</h2>
        <p className="mt-2 max-w-sm text-[11px] leading-6 text-[#85867D]">Generate a hairstyle preview and save the looks you want to show your barber.</p>
        <Link href="/#try-it" className="btn-primary mt-5">Explore hairstyles</Link>
      </div>
    ) : (
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {looks.map((look) => <article key={look.id} className="overflow-hidden rounded border border-[#E5E2D9] bg-white">
          <div className="relative aspect-[4/5] bg-[#F1F0EA]"><img src={look.imageUrl} alt={look.styleName + ' saved hairstyle'} className="h-full w-full object-cover"/><span className="absolute left-3 top-3 rounded-full bg-[#20231F]/85 px-3 py-1.5 text-[9px] font-semibold text-white">AI preview</span></div>
          <div className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-[14px] font-semibold">{look.styleName}</h2><p className="mt-1 text-[10px] text-[#85867D]">{new Date(look.createdAt).toLocaleDateString()}</p></div><button type="button" disabled={busyId === look.id} onClick={() => void toggleFavorite(look)} aria-label={look.favorite ? 'Remove from favorites' : 'Add to favorites'} className={'grid h-9 w-9 shrink-0 place-items-center rounded-full border ' + (look.favorite ? 'border-[#68745B] bg-[#EEF0E8] text-[#68745B]' : 'border-[#E5E2D9] text-[#85867D]')}><Heart size={15} fill={look.favorite ? 'currentColor' : 'none'}/></button></div>
            <button type="button" disabled={busyId === look.id} onClick={() => void removeLook(look)} className="mt-4 inline-flex min-h-9 items-center gap-2 text-[10px] font-semibold text-[#8A625A] disabled:opacity-50"><Trash2 size={13}/> Delete saved look</button>
          </div>
        </article>)}
      </div>
    )}
  </main>;
}
