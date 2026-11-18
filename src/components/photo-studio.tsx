'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Check, ImagePlus, LoaderCircle, RefreshCw, ShieldCheck,
  UploadCloud, X,
} from 'lucide-react';
import { analyzeFaceShape, FACE_SHAPES, type FaceAnalysis, type FaceShape } from '@/lib/face-analysis';
import {
  BEARD_PREFERENCES, HAIR_LENGTHS, HAIR_TEXTURES, MAINTENANCE_LEVELS, STYLE_VIBES,
  getStyleRecommendations,
  type BeardPreference, type HairLength, type HairTexture, type MaintenanceLevel, type StyleVibe,
} from '@/lib/style-recommendations';

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type StudioStage = 'idle' | 'ready' | 'analyzing' | 'analyzed';

export function PhotoStudio() {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState<StudioStage>('idle');
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
  const [selectedShape, setSelectedShape] = useState<FaceShape | ''>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);
  const [hairTexture, setHairTexture] = useState<HairTexture>('Wavy');
  const [hairLength, setHairLength] = useState<HairLength>('Short');
  const [maintenance, setMaintenance] = useState<MaintenanceLevel>('Low');
  const [vibe, setVibe] = useState<StyleVibe>('Modern');
  const [beardPreference, setBeardPreference] = useState<BeardPreference>('Recommend for me');

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function acceptFile(file?: File) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please choose a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Your photo must be smaller than 8 MB.');
      return;
    }
    setError('');
    setAnalysis(null);
    setSelectedShape('');
    setIsImageReady(false);
    setConsent(false);
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setStage('ready');
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0]);
    event.target.value = '';
  }

  function reset() {
    setPreview(null);
    setFileName('');
    setStage('idle');
    setAnalysis(null);
    setSelectedShape('');
    setIsImageReady(false);
    setError('');
    setConsent(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function runAnalysis() {
    if (!imageRef.current || !preview || !consent || !isImageReady) return;
    setError('');
    setStage('analyzing');
    try {
      const result = await analyzeFaceShape(imageRef.current);
      setAnalysis(result);
      setSelectedShape(result.shape);
      setStage('analyzed');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Face analysis could not be completed. Please try again.';
      setError(message);
      setStage('ready');
    }
  }

  const shape = selectedShape || analysis?.shape || '';
  const recommendations = analysis ? getStyleRecommendations(shape as FaceShape, {
    hairTexture, hairLength, maintenance, vibe, beard: beardPreference,
  }) : null;

  return <section id="try-it" className="scroll-mt-24">
    <div className="soft-card overflow-hidden">
      <div className="grid lg:grid-cols-[.9fr_1.1fr]">
        <div className="flex flex-col justify-between bg-[#20231F] p-7 text-[#F5F3ED] sm:p-10 lg:p-12">
          <div>
            <span className="eyebrow !text-[#C7B18D]">Your personal style session</span>
            <h2 className="display mt-5 text-[42px] leading-[1.05] sm:text-[50px]">A better cut<br/>starts with <i>you.</i></h2>
            <p className="mt-5 max-w-sm text-[13px] leading-7 text-white/60">Start with a private, on-device face-shape reading. Your portrait stays in this browser while you explore your proportions.</p>
          </div>
          <div className="mt-12 flex items-center gap-3 border-t border-white/15 pt-5 text-[11px] leading-5 text-white/55">
            <ShieldCheck size={17} className="shrink-0 text-[#C7B18D]"/>
            Your photo is processed locally and is not sent to our server.
          </div>
        </div>
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="flex items-center justify-between gap-3">
            <div><span className="eyebrow">Step 01 / Photo analysis</span><h3 className="mt-2 text-[20px] font-semibold tracking-[-.04em]">Add your portrait</h3></div>
            <span className="rounded-full bg-[#F1F0EA] px-3 py-1.5 text-[10px] font-semibold text-[#68745B]">JPG · PNG · WEBP</span>
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="sr-only" aria-label="Upload a portrait photo"/>
          <div
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => { event.preventDefault(); setIsDragging(false); acceptFile(event.dataTransfer.files?.[0]); }}
            className={`mt-7 flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-[4px] border border-dashed p-5 text-center transition-colors ${isDragging ? 'border-[#68745B] bg-[#EEF0E8]' : 'border-[#C9C7BD] bg-[#F8F7F3]'}`}
          >
            {preview ? (
              <div className="relative w-full">
                {/* A blob URL is intentionally rendered locally; it is not a remote image source. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={imageRef} src={preview} alt="Your uploaded portrait preview" onLoad={(event) => {
                  const image = event.currentTarget;
                  if (image.naturalWidth * image.naturalHeight > 24000000) {
                    setIsImageReady(false);
                    setError('This photo has very high resolution. Please choose an image under 24 megapixels.');
                    return;
                  }
                  setIsImageReady(true);
                  setError('');
                }} onError={() => { setIsImageReady(false); setError('This image could not be previewed. Please choose another photo.'); }} className="mx-auto max-h-[320px] max-w-full rounded object-contain"/>
                <button onClick={reset} type="button" aria-label="Remove uploaded photo" className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-full bg-[#20231F] text-white"><X size={16}/></button>
                <p className="mt-3 truncate text-[11px] text-[#77796F]">{fileName}</p>
                <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 text-[11px] font-semibold text-[#68745B] underline underline-offset-4">Choose a different photo</button>
              </div>
            ) : (
              <>
                <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#E9EAE2] text-[#68745B]"><ImagePlus size={23}/></span>
                <p className="text-[14px] font-semibold">Drop your photo here</p>
                <p className="mt-2 text-[11px] text-[#888980]">or browse from your device · up to 8 MB</p>
                <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary mt-6"><UploadCloud size={15}/> Choose a photo</button>
              </>
            )}
          </div>
          {error && <p role="alert" className="mt-3 text-[12px] text-red-700">{error}</p>}
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-[11px] leading-5 text-[#77796F]">
            <input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 h-4 w-4 accent-[#68745B]"/>
            <span>I agree to analyze this photo locally in my browser. It will not be uploaded for face-shape analysis.</span>
          </label>
          <button type="button" disabled={!preview || !consent || !isImageReady || stage === 'analyzing'} onClick={runAnalysis} className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40">
            {stage === 'analyzing' ? <><LoaderCircle size={15} className="animate-spin"/> Reading facial landmarks…</> : <>{stage === 'analyzed' ? 'Analyze again' : 'Analyze my face shape'} <ArrowRight size={15}/></>}
          </button>
          <p className="mt-3 text-center text-[10px] text-[#9A9B93]">Best results: one front-facing face, even lighting, no heavy filters.</p>

          {analysis && (
            <div aria-live="polite" className="mt-7 rounded-[4px] border border-[#DDE0D5] bg-[#F5F6F1] p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="eyebrow">Your face-shape reading</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#68745B]"><Check size={13}/> Analysis complete</span>
              </div>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div><p className="display text-[38px] leading-none">{shape}</p><p className="mt-2 text-[11px] text-[#77796F]">Detected: {analysis.shape}</p></div>
                <div className="text-right"><p className="text-[23px] font-semibold tracking-[-.05em]">{analysis.confidence}%</p><p className="text-[9px] uppercase tracking-[.14em] text-[#85867D]">Heuristic fit</p></div>
              </div>
              <p className="mt-4 text-[12px] leading-6 text-[#686B61]">{analysis.explanation}</p>
              <label className="mt-5 block text-[10px] font-semibold uppercase tracking-[.12em] text-[#77796F]" htmlFor="face-shape-correction">Does this look right?</label>
              <select id="face-shape-correction" value={shape} onChange={event => setSelectedShape(event.target.value as FaceShape)} className="mt-2 min-h-11 w-full rounded border border-[#D5D6CC] bg-white px-3 text-[12px] text-[#20231F] focus:border-[#68745B] focus:outline-none focus:ring-2 focus:ring-[#68745B]/20">
                {FACE_SHAPES.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              {shape !== analysis.shape && <p className="mt-2 text-[10px] text-[#68745B]">Your correction will guide the next recommendation step.</p>}
              <div className="mt-5 flex items-center justify-between border-t border-[#DDE0D5] pt-4">
                <span className="text-[10px] text-[#85867D]">Approximate ratios · not a biometric measurement</span>
                <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#68745B]"><RefreshCw size={12}/> Clear photo</button>
              </div>
            </div>
          )}
          
            {recommendations && (
              <section aria-live="polite" className="mt-8 border-t border-[#E5E2D9] pt-7">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div><span className="eyebrow">Step 02 / Your style edit</span><h3 className="display mt-2 text-[32px] leading-none">Looks picked for <i>you.</i></h3></div>
                  <span className="rounded-full bg-[#E9EAE2] px-3 py-1.5 text-[10px] font-semibold text-[#68745B]">{shape} face shape</span>
                </div>
                <p className="mt-3 text-[12px] leading-6 text-[#77796F]">Fine-tune your preferences. Your recommendations update instantly and stay on this device.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#77796F]">Hair texture
                    <select value={hairTexture} onChange={event => setHairTexture(event.target.value as HairTexture)} className="mt-2 min-h-11 w-full rounded border border-[#D5D6CC] bg-white px-3 text-[12px] normal-case tracking-normal text-[#20231F] focus:border-[#68745B] focus:outline-none focus:ring-2 focus:ring-[#68745B]/20">
                      {HAIR_TEXTURES.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#77796F]">Preferred length
                    <select value={hairLength} onChange={event => setHairLength(event.target.value as HairLength)} className="mt-2 min-h-11 w-full rounded border border-[#D5D6CC] bg-white px-3 text-[12px] normal-case tracking-normal text-[#20231F] focus:border-[#68745B] focus:outline-none focus:ring-2 focus:ring-[#68745B]/20">
                      {HAIR_LENGTHS.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#77796F]">Daily maintenance
                    <select value={maintenance} onChange={event => setMaintenance(event.target.value as MaintenanceLevel)} className="mt-2 min-h-11 w-full rounded border border-[#D5D6CC] bg-white px-3 text-[12px] normal-case tracking-normal text-[#20231F] focus:border-[#68745B] focus:outline-none focus:ring-2 focus:ring-[#68745B]/20">
                      {MAINTENANCE_LEVELS.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#77796F]">Style direction
                    <select value={vibe} onChange={event => setVibe(event.target.value as StyleVibe)} className="mt-2 min-h-11 w-full rounded border border-[#D5D6CC] bg-white px-3 text-[12px] normal-case tracking-normal text-[#20231F] focus:border-[#68745B] focus:outline-none focus:ring-2 focus:ring-[#68745B]/20">
                      {STYLE_VIBES.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#77796F] sm:col-span-2">Beard preference
                    <select value={beardPreference} onChange={event => setBeardPreference(event.target.value as BeardPreference)} className="mt-2 min-h-11 w-full rounded border border-[#D5D6CC] bg-white px-3 text-[12px] normal-case tracking-normal text-[#20231F] focus:border-[#68745B] focus:outline-none focus:ring-2 focus:ring-[#68745B]/20">
                      {BEARD_PREFERENCES.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                </div>

                <div className="mt-8 flex items-center justify-between gap-3">
                  <h4 className="text-[14px] font-semibold tracking-[-.03em]">Your top 3 haircuts</h4>
                  <span className="text-[9px] uppercase tracking-[.14em] text-[#85867D]">Personalized shortlist</span>
                </div>
                <div className="mt-4 grid gap-3">
                  {recommendations.hair.map((style, index) => (
                    <article key={style.id} className="rounded-[4px] border border-[#E5E2D9] bg-white p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        <span className="display text-[25px] leading-none text-[#B58B5B]">0{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h5 className="text-[14px] font-semibold">{style.name}</h5>
                            <span className="rounded-full bg-[#EEF0E8] px-2.5 py-1 text-[9px] font-semibold text-[#68745B]">{style.maintenance} upkeep</span>
                          </div>
                          <p className="mt-2 text-[11px] leading-6 text-[#77796F]">{style.description}</p>
                          <p className="mt-3 text-[11px] leading-5 text-[#55574F]"><span className="font-semibold">Why it fits: </span>{style.reason}</p>
                          <div className="mt-3 border-t border-[#EAE9E1] pt-3"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#68745B]">Tell your barber</p><p className="mt-1 text-[11px] leading-5 text-[#77796F]">{style.barberNote}</p></div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-7 rounded-[4px] bg-[#20231F] p-5 text-[#F5F3ED] sm:p-6">
                  <div className="flex items-center justify-between gap-3"><span className="eyebrow !text-[#C7B18D]">Complete the look</span><span className="text-[9px] uppercase tracking-[.14em] text-white/45">Beard edit</span></div>
                  <h4 className="display mt-3 text-[29px]">{recommendations.beard.name}</h4>
                  <p className="mt-2 text-[11px] leading-6 text-white/65">{recommendations.beard.description}</p>
                  <p className="mt-3 text-[11px] leading-5 text-white/75"><span className="font-semibold text-[#C7B18D]">Why it fits: </span>{recommendations.beard.reason}</p>
                  <div className="mt-4 border-t border-white/15 pt-4"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#C7B18D]">Barber / barber-stylist note</p><p className="mt-1 text-[11px] leading-5 text-white/65">{recommendations.beard.barberNote}</p></div>
                </div>
                <p className="mt-4 text-[10px] leading-5 text-[#92938B]">Style suggestions are educational starting points, not guaranteed outcomes. Hair density, growth pattern, lifestyle and your barber’s assessment also matter.</p>
              </section>
            )}

        </div>
      </div>
    </div>
  </section>;
}
