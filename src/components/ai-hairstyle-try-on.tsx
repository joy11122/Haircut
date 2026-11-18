'use client';

/* eslint-disable @next/next/no-img-element -- local blob and temporary provider output URLs are rendered directly. */

import { useState } from 'react';
import { AlertCircle, Download, LoaderCircle, Sparkles } from 'lucide-react';
import { AI_HAIRSTYLES, type AiHairstyleId } from '@/lib/ai-hairstyle';

type Props = { imageUrl: string };
type PreviewState = 'idle' | 'preparing' | 'generating' | 'polling' | 'done' | 'error';

async function optimizePortrait(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Could not read your selected portrait.');
  const source = await createImageBitmap(await response.blob());
  try {
    const scale = Math.min(1, 768 / Math.max(source.width, source.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(source.width * scale));
    canvas.height = Math.max(1, Math.round(source.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser cannot prepare this photo.');
    context.drawImage(source, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const encoded = dataUrl.split(',')[1] ?? '';
      if (Math.floor(encoded.length * 0.75) <= 225_000) return dataUrl;
    }
    throw new Error('This photo could not be compressed enough. Please choose a smaller image.');
  } finally {
    source.close();
  }
}

export function AiHairstyleTryOn({ imageUrl }: Props) {
  const [styleId, setStyleId] = useState<AiHairstyleId>(AI_HAIRSTYLES[0].id);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<PreviewState>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const selected = AI_HAIRSTYLES.find((style) => style.id === styleId) ?? AI_HAIRSTYLES[0];
  const busy = state === 'preparing' || state === 'generating' || state === 'polling';

  async function generate() {
    if (!consent || busy) return;
    setError('');
    setResultUrl(null);
    setState('preparing');

    try {
      const image = await optimizePortrait(imageUrl);
      setState('generating');
      const startResponse = await fetch('/api/hairstyle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, styleId, consent: true }),
      });
      const started = await startResponse.json() as { id?: string; status?: string; imageUrl?: string | null; error?: string };
      if (!startResponse.ok || !started.id) throw new Error(started.error || 'Could not start the AI preview.');

      if (started.imageUrl) {
        setResultUrl(started.imageUrl);
        setState('done');
        return;
      }

      setState('polling');
      for (let attempt = 0; attempt < 40; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 2500));
        const statusResponse = await fetch('/api/hairstyle?id=' + encodeURIComponent(started.id as string), { cache: 'no-store' });
        const status = await statusResponse.json() as { status?: string; imageUrl?: string | null; error?: string };
        if (!statusResponse.ok) throw new Error(status.error || 'Could not check the AI preview.');
        if (status.status === 'succeeded' && status.imageUrl) {
          setResultUrl(status.imageUrl);
          setState('done');
          return;
        }
        if (status.status === 'failed' || status.status === 'canceled') {
          throw new Error(status.error || 'The AI preview could not be completed.');
        }
      }
      throw new Error('This preview is taking longer than expected. Please try again in a moment.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.');
      setState('error');
    }
  }

  async function downloadResult() {
    if (!resultUrl) return;
    try {
      const response = await fetch(resultUrl);
      if (!response.ok) throw new Error('Download failed.');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = 'haircut-' + styleId + '.jpg';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setError('Could not download the image. You can open the result in a new tab instead.');
    }
  }

  return (
    <section className="mt-10 border-t border-[#E5E2D9] pt-8" aria-labelledby="ai-try-on-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Step 04 / AI transformation</span>
          <h3 id="ai-try-on-title" className="display mt-2 text-[32px] leading-none">See the cut, <i>for real.</i></h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF0E8] px-3 py-1.5 text-[10px] font-semibold text-[#68745B]"><Sparkles size={12}/> AI-generated preview</span>
      </div>
      <p className="mt-3 max-w-xl text-[12px] leading-6 text-[#77796F]">Generate a realistic hairstyle edit from your portrait. We send an optimized copy to our image-generation provider only after you give separate consent.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
        <div className="rounded-[4px] border border-[#E5E2D9] bg-white p-5">
          <label htmlFor="ai-hairstyle-choice" className="eyebrow">Choose your haircut</label>
          <select id="ai-hairstyle-choice" value={styleId} onChange={(event) => { setStyleId(event.target.value as AiHairstyleId); setResultUrl(null); setState('idle'); setError(''); }} disabled={busy} className="mt-3 min-h-12 w-full rounded border border-[#D5D6CC] bg-white px-3 text-[12px] text-[#20231F] focus:border-[#68745B] focus:outline-none focus:ring-2 focus:ring-[#68745B]/20">
            {AI_HAIRSTYLES.map((style) => <option key={style.id} value={style.id}>{style.name}</option>)}
          </select>
          <p className="mt-3 text-[11px] leading-5 text-[#77796F]">{selected.name} · AI will preserve your face and change the hairstyle only, as closely as the model allows.</p>

          <label className="mt-5 flex cursor-pointer items-start gap-3 text-[11px] leading-5 text-[#77796F]">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={busy} className="mt-1 h-4 w-4 accent-[#68745B]" />
            <span>I agree to send this optimized portrait to Replicate and Google’s Gemini image model to generate my hairstyle preview. I understand the result is AI-generated and may not perfectly preserve my appearance.</span>
          </label>

          <button type="button" onClick={generate} disabled={!consent || busy} className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? <><LoaderCircle size={15} className="animate-spin"/>{state === 'preparing' ? 'Preparing photo…' : state === 'generating' ? 'Starting AI…' : 'Creating your look…'}</> : <><Sparkles size={15}/> Generate realistic preview</>}
          </button>
          <p className="mt-3 text-[10px] leading-5 text-[#92938B]">Each generation has a provider charge. Do not generate unless you are happy to proceed. The app does not store your original portrait.</p>
          {error && <p role="alert" className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-red-700"><AlertCircle size={14} className="mt-0.5 shrink-0"/>{error}</p>}
        </div>

        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[4px] border border-dashed border-[#C9C7BD] bg-[#F8F7F3] p-5 text-center">
          {resultUrl ? (
            <>
              <div className="grid w-full gap-3 sm:grid-cols-2">
                <div><p className="mb-2 text-[9px] font-bold uppercase tracking-[.14em] text-[#85867D]">Original</p><img src={imageUrl} alt="Original portrait" className="max-h-[340px] w-full rounded object-contain"/></div>
                <div><p className="mb-2 text-[9px] font-bold uppercase tracking-[.14em] text-[#68745B]">AI result · {selected.name}</p><img src={resultUrl} alt={'AI-generated ' + selected.name + ' hairstyle preview'} className="max-h-[340px] w-full rounded object-contain"/></div>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={downloadResult} className="btn-primary"><Download size={14}/> Download result</button>
                <a href={resultUrl} target="_blank" rel="noreferrer" className="btn-secondary">Open full image</a>
              </div>
              <p className="mt-3 text-[9px] text-[#92938B]">AI-generated preview · Not a guarantee of the final haircut.</p>
            </>
          ) : (
            <>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#E9EAE2] text-[#68745B]"><Sparkles size={20}/></span>
              <p className="mt-4 text-[13px] font-semibold text-[#20231F]">Your AI hairstyle preview will appear here</p>
              <p className="mt-2 max-w-xs text-[11px] leading-5 text-[#85867D]">Choose a style, give consent, and generate your first realistic look.</p>
              {busy && <p aria-live="polite" className="mt-4 text-[10px] font-semibold text-[#68745B]">{state === 'preparing' ? 'Optimizing your photo locally' : state === 'generating' ? 'Sending a secure request to the AI provider' : 'Waiting for the generated image'}</p>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
