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
- Interactive, browser-only hairstyle silhouette preview with selectable styles and adjustable size, vertical placement, and opacity. The preview is an illustrative overlay, not a photorealistic AI-generated hairstyle transfer.
- Face analysis runs in the browser; the portrait is not sent to the application server.

## Development

The product is being delivered in phases. Photorealistic AI hairstyle transfer, authentication, saved looks, and production image storage remain separate upcoming phases. Hairstyle and beard suggestions are currently rule-based, explainable guidance rather than model-generated predictions. The face-shape output is an approximate style aid, not a medical or biometric identity assessment.

Run `npm install`, then `npm run dev`. Validate with `npm run typecheck`, `npm run test`, `npm run lint`, and `npm run build`.
