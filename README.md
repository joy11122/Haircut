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
- AI provider tokens remain server-side in `REPLICATE_API_TOKEN`; the API rejects arbitrary prompts, unsupported styles, invalid image types, oversized image payloads, and untrusted output URLs. AI generation requires a signed-in account, applies a shared Upstash Redis rate limit (5 starts per 10 minutes per account), and enforces three free generation starts per UTC day per account. Production fails closed when shared Redis rate limiting is not configured or unavailable.
- AI usage is recorded in MongoDB (`ai_daily_usage` and `ai_generation_events`) for private daily allowance reporting and future provider-cost operations. Provider charges are not estimated or displayed until verified pricing data is integrated.
- Face-shape analysis still runs in the browser; AI hairstyle generation is a separate opt-in provider request.
- Google sign-in with Auth.js and database-backed sessions.
- Private saved-look library with favorites, history, per-user access checks, a 50-look limit, and image deletion.
- Generated images are copied to Cloudinary only after a separate save consent; only generated results are stored, not the original portrait.
- MongoDB stores account-linked saved-look metadata; ownership is enforced in every read, update and delete query.
- A public privacy page explains browser analysis, AI-provider processing, account storage and deletion.

## Development

The product is being delivered in phases. Paid usage tiers, payments, verified provider-cost attribution, alert delivery, and a privileged operations dashboard remain follow-up work. Do not enable paid usage until provider pricing, retention, and payment eligibility are reviewed. Account and saved-look features require Google OAuth, MongoDB, and Cloudinary configuration. Hairstyle and beard suggestions are currently rule-based, explainable guidance rather than model-generated predictions. The face-shape output is an approximate style aid, not a medical or biometric identity assessment.

Copy `.env.example` to `.env.local`. Configure `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `MONGODB_URI`, `MONGODB_DB_NAME`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `REPLICATE_API_TOKEN`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` in your local and Vercel server environments. The Upstash URL must use HTTPS. Production AI generation is blocked if either Upstash setting is missing or the shared limiter cannot be reached. The signed-in user can read their private daily allowance from `GET /api/usage`. Register the Google OAuth callback as `https://YOUR_DOMAIN/api/auth/callback/google`. Keep every credential server-only and never expose it with a `NEXT_PUBLIC_` prefix. Without these credentials, sign-in, persistence, image storage, or AI generation will remain unavailable. Run `npm install`, then `npm run dev`. Validate with `npm run typecheck`, `npm run test`, `npm run lint`, and `npm run build`.
