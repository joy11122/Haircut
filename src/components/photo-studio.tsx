'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ImagePlus, RefreshCw, ShieldCheck, Sparkles, UploadCloud, X } from 'lucide-react';

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function PhotoStudio() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState<'idle' | 'ready'>('idle');

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError('');
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) { setError('Please choose a JPG, PNG or WebP image.'); event.target.value = ''; return; }
    if (file.size > MAX_FILE_SIZE) { setError('Your photo must be smaller than 8 MB.'); event.target.value = ''; return; }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setStage('ready');
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null); setFileName(''); setStage('idle'); setError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return <section id="try-it" className="scroll-mt-24">
    <div className="soft-card overflow-hidden">
      <div className="grid lg:grid-cols-[.9fr_1.1fr]">
        <div className="flex flex-col justify-between bg-[#20231F] p-7 text-[#F5F3ED] sm:p-10 lg:p-12">
          <div><span className="eyebrow !text-[#C7B18D]">Your personal style session</span><h2 className="display mt-5 text-[42px] leading-[1.05] sm:text-[50px]">A better cut<br/>starts with <i>you.</i></h2><p className="mt-5 max-w-sm text-[13px] leading-7 text-white/60">Share a clear photo. We’ll use your features and preferences to help you explore looks that feel natural, considered and unmistakably yours.</p></div>
          <div className="mt-12 flex items-center gap-3 border-t border-white/15 pt-5 text-[11px] leading-5 text-white/55"><ShieldCheck size={17} className="shrink-0 text-[#C7B18D]"/>Your photo stays yours. You choose what to share and when.</div>
        </div>
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="flex items-center justify-between"><div><span className="eyebrow">Step 01 / Photo</span><h3 className="mt-2 text-[20px] font-semibold tracking-[-.04em]">Add your portrait</h3></div><span className="rounded-full bg-[#F1F0EA] px-3 py-1.5 text-[10px] font-semibold text-[#68745B]">JPG · PNG · WEBP</span></div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="sr-only" aria-label="Upload a portrait photo" />
          <div className="mt-7 flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-[4px] border border-dashed border-[#C9C7BD] bg-[#F8F7F3] p-5 text-center">
            {preview ? <div className="relative w-full"><img src={preview} alt="Your uploaded portrait preview" className="mx-auto max-h-[320px] max-w-full rounded object-contain"/><button onClick={reset} type="button" aria-label="Remove uploaded photo" className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-full bg-[#20231F] text-white"><X size={16}/></button><p className="mt-3 truncate text-[11px] text-[#77796F]">{fileName}</p></div> : <><span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#E9EAE2] text-[#68745B]"><ImagePlus size={23}/></span><p className="text-[14px] font-semibold">Drop your photo here</p><p className="mt-2 text-[11px] text-[#888980]">or browse from your device · up to 8 MB</p><button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary mt-6"><UploadCloud size={15}/> Choose a photo</button></>}
          </div>
          {error && <p role="alert" className="mt-3 text-[12px] text-red-700">{error}</p>}
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-[11px] leading-5 text-[#77796F]"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-[#68745B]"/><span>I agree to use this photo for a personalized style experience. I understand I can remove it at any time.</span></label>
          <button type="button" disabled={!preview || !consent} onClick={() => setError('Photo preview is ready. AI analysis will be enabled after the secure analysis service is configured.')} className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40">{stage === 'ready' ? 'Continue to style analysis' : 'Start my style session'} <ArrowRight size={15}/></button>
          <p className="mt-3 text-center text-[10px] text-[#9A9B93]">No public sharing. No photo is uploaded to a server in this preview.</p>
        </div>
      </div>
    </div>
  </section>;
}
