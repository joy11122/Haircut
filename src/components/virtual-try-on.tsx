'use client';

import { useMemo, useState } from 'react';
import { Eye, RotateCcw, Sparkles } from 'lucide-react';

type HairOption = {
  id: string;
  name: string;
  description: string;
  silhouette: 'crop' | 'quiff' | 'curtain' | 'buzz' | 'curls';
};

const OPTIONS: HairOption[] = [
  { id: 'textured-crop', name: 'Textured crop', description: 'A compact fringe with a softly textured top.', silhouette: 'crop' },
  { id: 'soft-quiff', name: 'Soft quiff', description: 'A little lift at the front with relaxed volume.', silhouette: 'quiff' },
  { id: 'curtain-flow', name: 'Curtain flow', description: 'A center-parted shape with movement at the temples.', silhouette: 'curtain' },
  { id: 'crew-cut', name: 'Modern crew cut', description: 'A close, clean outline with a subtle front ridge.', silhouette: 'buzz' },
  { id: 'low-taper-curls', name: 'Low taper curls', description: 'Defined natural-looking volume over a neat outline.', silhouette: 'curls' },
];

function HairSilhouette({ type, opacity }: { type: HairOption['silhouette']; opacity: number }) {
  const paths: Record<HairOption['silhouette'], string> = {
    crop: 'M17 47 C17 21 34 8 50 8 C68 8 83 22 83 47 C76 40 70 38 63 39 C53 42 44 38 35 42 C28 45 23 48 17 47 Z',
    quiff: 'M16 49 C12 29 22 14 39 10 C47 1 66 5 72 19 C84 25 87 39 82 50 C74 39 67 36 59 39 C47 42 37 37 29 43 C23 47 20 49 16 49 Z',
    curtain: 'M15 48 C12 22 29 7 49 8 C69 7 87 23 85 49 C75 36 68 27 54 29 C52 39 50 42 48 46 C45 38 43 32 40 29 C29 29 22 38 15 48 Z',
    buzz: 'M20 45 C19 24 31 13 50 13 C69 13 81 24 80 45 C68 37 61 35 50 35 C39 35 30 38 20 45 Z',
    curls: 'M17 49 C10 40 14 27 22 23 C18 13 30 7 38 13 C44 3 58 5 62 13 C73 8 84 18 79 27 C89 34 86 46 81 51 C69 41 62 39 51 42 C38 38 27 43 17 49 Z',
  };

  return (
    <svg viewBox="0 0 100 62" role="img" aria-label="Illustrative hairstyle silhouette" className="h-full w-full" style={{ opacity }}>
      <defs>
        <linearGradient id="hair-shade" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#51463A" />
          <stop offset="100%" stopColor="#171915" />
        </linearGradient>
      </defs>
      <path d={paths[type]} fill="url(#hair-shade)" stroke="#171915" strokeWidth="1.4" strokeLinejoin="round" />
      {type !== 'buzz' && <path d="M25 35 Q34 18 49 17 Q66 15 76 35" fill="none" stroke="#B9A58A" strokeOpacity=".34" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

export function VirtualTryOn({ imageUrl }: { imageUrl: string }) {
  const [selected, setSelected] = useState(OPTIONS[0].id);
  const [scale, setScale] = useState(100);
  const [vertical, setVertical] = useState(0);
  const [opacity, setOpacity] = useState(88);
  const [showOverlay, setShowOverlay] = useState(true);
  const option = useMemo(() => OPTIONS.find(item => item.id === selected) ?? OPTIONS[0], [selected]);

  function resetAdjustments() {
    setScale(100);
    setVertical(0);
    setOpacity(88);
    setShowOverlay(true);
  }

  return (
    <section className="mt-9 border-t border-[#E5E2D9] pt-8" aria-labelledby="try-on-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Step 03 / Style preview</span>
          <h3 id="try-on-title" className="display mt-2 text-[32px] leading-none">Try a new <i>silhouette.</i></h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF0E8] px-3 py-1.5 text-[10px] font-semibold text-[#68745B]"><Sparkles size={12}/> Interactive concept preview</span>
      </div>
      <p className="mt-3 max-w-xl text-[12px] leading-6 text-[#77796F]">Compare a few haircut silhouettes over your portrait and adjust their placement. This is an illustrative overlay, not a photorealistic AI transformation.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[4px] border border-[#E5E2D9] bg-[#EAE9E1]">
          {/* Local object URL only: the portrait is never uploaded by this component. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Your portrait for hairstyle preview" className="block max-h-[520px] min-h-[300px] w-full object-contain" />
          {showOverlay && (
            <div
              className="pointer-events-none absolute left-1/2 top-[5%] h-[23%] w-[62%] -translate-x-1/2 transition-all duration-200"
              style={{ transform: `translate(-50%, ${vertical}px) scale(${scale / 100})`, transformOrigin: 'center top' }}
            >
              <HairSilhouette type={option.silhouette} opacity={opacity / 100} />
            </div>
          )}
          <div className="absolute bottom-3 left-3 rounded-full bg-[#20231F]/85 px-3 py-1.5 text-[9px] font-semibold text-white">{option.name}</div>
          <button type="button" onClick={() => setShowOverlay(value => !value)} aria-pressed={showOverlay} className="absolute right-3 top-3 inline-flex min-h-9 items-center gap-2 rounded-full bg-white/90 px-3 text-[10px] font-semibold text-[#20231F] shadow-sm">
            <Eye size={13}/>{showOverlay ? 'Hide preview' : 'Show preview'}
          </button>
        </div>

        <div className="flex flex-col">
          <div>
            <p className="eyebrow">Choose a silhouette</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {OPTIONS.map(item => (
                <button key={item.id} type="button" onClick={() => setSelected(item.id)} aria-pressed={selected === item.id} className={`min-h-[76px] rounded-[4px] border p-3 text-left transition-colors ${selected === item.id ? 'border-[#68745B] bg-[#EEF0E8]' : 'border-[#E5E2D9] bg-white hover:border-[#B9BBAF]'}`}>
                  <span className="block text-[11px] font-semibold text-[#20231F]">{item.name}</span>
                  <span className="mt-1 block text-[10px] leading-4 text-[#85867D]">{item.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-5 rounded-[4px] bg-[#F5F3ED] p-4">
            <label className="block text-[10px] font-semibold uppercase tracking-[.12em] text-[#77796F]">Size <span className="float-right tabular-nums">{scale}%</span>
              <input aria-label="Hairstyle overlay size" type="range" min="70" max="135" value={scale} onChange={event => setScale(Number(event.target.value))} className="mt-3 block w-full accent-[#68745B]" />
            </label>
            <label className="block text-[10px] font-semibold uppercase tracking-[.12em] text-[#77796F]">Vertical position <span className="float-right tabular-nums">{vertical}px</span>
              <input aria-label="Hairstyle overlay vertical position" type="range" min="-35" max="55" value={vertical} onChange={event => setVertical(Number(event.target.value))} className="mt-3 block w-full accent-[#68745B]" />
            </label>
            <label className="block text-[10px] font-semibold uppercase tracking-[.12em] text-[#77796F]">Overlay opacity <span className="float-right tabular-nums">{opacity}%</span>
              <input aria-label="Hairstyle overlay opacity" type="range" min="35" max="100" value={opacity} onChange={event => setOpacity(Number(event.target.value))} className="mt-3 block w-full accent-[#68745B]" />
            </label>
            <button type="button" onClick={resetAdjustments} className="inline-flex min-h-10 items-center gap-2 text-[10px] font-semibold text-[#68745B]"><RotateCcw size={13}/> Reset preview adjustments</button>
          </div>
          <p className="mt-4 text-[10px] leading-5 text-[#92938B]">Use this preview to discuss a direction with your barber. Hairline, curl pattern, density and lighting are not reconstructed by this overlay.</p>
        </div>
      </div>
    </section>
  );
}
