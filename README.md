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
- AI provider tokens remain server-side in `REPLICATE_API_TOKEN`; the API rejects arbitrary prompts, unsupported styles, invalid image types, oversized image payloads, and untrusted output URLs. A per-instance burst guard is included, but a shared distributed rate limiter and authenticated quotas are still required before a public paid launch.
- Face-shape analysis still runs in the browser; AI hairstyle generation is a separate opt-in provider request.
- Google sign-in with Auth.js and database-backed sessions.
- Private saved-look library with favorites, history, per-user access checks, a 50-look limit, and image deletion.
- Generated images are copied to Cloudinary only after a separate save consent; only generated results are stored, not the original portrait.
- MongoDB stores account-linked saved-look metadata; ownership is enforced in every read, update and delete query.
- A public privacy page explains browser analysis, AI-provider processing, account storage and deletion.

## Development

The product is being delivered in phases. Shared distributed rate limiting, paid usage quotas, billing, and operational monitoring remain production follow-ups. Account and saved-look features require Google OAuth, MongoDB, and Cloudinary configuration. Hairstyle and beard suggestions are currently rule-based, explainable guidance rather than model-generated predictions. The face-shape output is an approximate style aid, not a medical or biometric identity assessment.

Copy `.env.example` to `.env.local`. Configure `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `MONGODB_URI`, `MONGODB_DB_NAME`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `REPLICATE_API_TOKEN` in your local and Vercel server environments. Register the Google OAuth callback as `https://YOUR_DOMAIN/api/auth/callback/google`. Keep every credential server-only and never expose it with a `NEXT_PUBLIC_` prefix. Without these credentials, sign-in, persistence, image storage, or AI generation will remain unavailable. Run `npm install`, then `npm run dev`. Validate with `npm run typecheck`, `npm run test`, `npm run lint`, and `npm run build`.
