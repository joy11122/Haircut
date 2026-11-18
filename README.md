# Haircut — AI Grooming Studio

An AI-assisted personal grooming experience that helps people explore hairstyles and beard styles based on their face shape, hair characteristics, and preferences.

## Product direction

- Guided photo upload with clear consent and privacy controls.
- Face-shape and facial-landmark analysis with transparent confidence and user correction.
- Hairstyle and beard recommendations with practical barber-ready descriptions.
- Virtual try-on workflow designed to preserve the user's identity.
- Responsive, accessible experience with secure server-side AI integrations.

## Current capabilities

- Premium, responsive landing experience and grooming-style showcase.
- Local photo selection, preview, drag-and-drop, MIME and file-size validation.
- On-device face landmark detection with MediaPipe Tasks Vision.
- Explainable heuristic face-shape classification (oval, round, square, heart, oblong, diamond), confidence indicator, and user correction.
- Preference-aware top-three haircut shortlist based on face shape, hair texture, preferred length, maintenance, and style direction.
- Beard recommendations for clean-shaven, stubble, short-beard, and full-beard preferences, with barber-ready instructions.
- Interactive, browser-only hairstyle silhouette preview with five selectable looks and adjustable size, placement, and opacity. This is an illustrative overlay, not a photorealistic AI hairstyle transfer.
- Consent-based photorealistic hairstyle editing through the server-side Replicate API using Google Gemini 2.5 Flash Image, with eight allowlisted styles, identity-preservation instructions, async status polling, result preview, and download.
- AI image requests are made only after a separate consent checkbox; the original photo is resized and compressed locally before being sent as a temporary data URL. The app does not persist the portrait.
- AI provider tokens remain server-side in `REPLICATE_API_TOKEN`; the API rejects arbitrary prompts, unsupported styles, invalid image types, oversized image payloads, and untrusted output URLs.
- Face-shape analysis still runs in the browser; AI hairstyle generation is a separate opt-in provider request.

## Development

The product is being delivered in phases. Authentication, saved looks, shared production rate limiting, and managed image storage remain separate upcoming phases. AI hairstyle generation requires a Replicate account and server-side API token. Hairstyle and beard suggestions are currently rule-based, explainable guidance rather than model-generated predictions. The face-shape output is an approximate style aid, not a medical or biometric identity assessment.

Copy `.env.example` to `.env.local` and set `REPLICATE_API_TOKEN` from your Replicate account before using AI hairstyle generation. Keep this value server-only and never expose it with a `NEXT_PUBLIC_` prefix. Run `npm install`, then `npm run dev`. Validate with `npm run typecheck`, `npm run test`, `npm run lint`, and `npm run build`.
