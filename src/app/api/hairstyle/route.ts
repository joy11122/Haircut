import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '../../../../auth';
import { buildHairstylePrompt } from '@/lib/ai-hairstyle';
import {
  checkSharedRateLimit,
  createGenerationEvent,
  findOwnedGenerationEvent,
  reserveDailyGeneration,
  updateGenerationEvent,
} from '@/lib/usage-controls';

export const runtime = 'nodejs';
export const maxDuration = 60;

const REPLICATE_API = 'https://api.replicate.com/v1';
const MAX_IMAGE_BYTES = 240_000;
const PREDICTION_ID_PATTERN = /^[a-z0-9]{20,40}$/i;
type ReplicatePrediction = {
  id?: string;
  status?: string;
  output?: string | string[] | null;
  error?: string | null;
};

function jsonError(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

function safeOutput(output: ReplicatePrediction['output']): string | null {
  const candidate = Array.isArray(output) ? output[0] : output;
  if (typeof candidate !== 'string') return null;
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' && (url.hostname === 'replicate.delivery' || url.hostname.endsWith('.replicate.delivery')) ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return jsonError('Sign in to generate and track your AI hairstyle previews.', 401);

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return jsonError('AI hairstyle preview is not configured yet. Add REPLICATE_API_TOKEN to the server environment.', 503);

  const rate = await checkSharedRateLimit(userId);
  if (!rate.allowed) {
    if (!rate.configured) return jsonError('AI generation is temporarily unavailable because shared rate limiting is not configured.', 503);
    return jsonError('You are generating previews too quickly. Please wait before trying again.', 429, {
      'Retry-After': String(Math.max(1, rate.resetInSeconds)),
    });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 380_000) return jsonError('The optimized portrait request is too large.', 413);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid request body.', 400);
  }

  if (!body || typeof body !== 'object') return jsonError('Invalid request body.', 400);
  const payload = body as { image?: unknown; styleId?: unknown; consent?: unknown };
  if (payload.consent !== true) return jsonError('Please consent to sending this photo to our AI image provider.', 400);
  if (typeof payload.styleId !== 'string') return jsonError('Choose a supported hairstyle.', 400);

  const prompt = buildHairstylePrompt(payload.styleId);
  if (!prompt) return jsonError('That hairstyle is not supported.', 400);
  if (typeof payload.image !== 'string') return jsonError('A portrait image is required.', 400);

  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(payload.image);
  if (!match) return jsonError('Use a valid JPEG, PNG or WebP portrait.', 400);

  const base64 = match[2];
  const imageBytes = Math.floor((base64.length * 3) / 4) - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
  if (imageBytes < 1 || imageBytes > MAX_IMAGE_BYTES) {
    return jsonError('The optimized portrait must be smaller than 240 KB. Please choose another photo.', 413);
  }

  let usage;
  try {
    usage = await reserveDailyGeneration(userId);
  } catch {
    return jsonError('Usage controls are temporarily unavailable. Please try again later.', 503);
  }
  if (!usage.allowed) {
    return jsonError(`You have used all ${usage.limit} free AI previews for today. Try again tomorrow.`, 429, {
      'X-AI-Usage-Limit': String(usage.limit),
      'X-AI-Usage-Remaining': '0',
    });
  }

  let eventId: ObjectId;
  try {
    eventId = await createGenerationEvent(userId);
  } catch {
    return jsonError('Could not record this generation request. Please try again.', 503);
  }

  try {
    const response = await fetch(`${REPLICATE_API}/models/google/gemini-2.5-flash-image/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=5',
        'Cancel-After': '90s',
      },
      body: JSON.stringify({
        input: {
          prompt,
          image_input: [payload.image],
          aspect_ratio: 'match_input_image',
          output_format: 'jpg',
        },
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      await updateGenerationEvent(eventId, { status: 'failed' }).catch(() => undefined);
      if (response.status === 429) return jsonError('The AI provider is busy. Please wait a moment and try again.', 429);
      if (response.status === 401 || response.status === 403) {
        return jsonError('The AI provider rejected the server credentials. Check REPLICATE_API_TOKEN.', 503);
      }
      return jsonError('The AI provider could not start this hairstyle preview. Please try again later.', 502);
    }

    const prediction = (await response.json()) as ReplicatePrediction;
    if (!prediction.id || !PREDICTION_ID_PATTERN.test(prediction.id)) {
      await updateGenerationEvent(eventId, { status: 'failed' }).catch(() => undefined);
      return jsonError('The AI provider returned an invalid prediction response.', 502);
    }

    const finalStatus = prediction.status === 'succeeded' ? 'completed' : prediction.status === 'failed' || prediction.status === 'canceled' ? 'failed' : 'submitted';
    await updateGenerationEvent(eventId, { status: finalStatus, predictionId: prediction.id });
    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      return jsonError('The AI could not complete this hairstyle preview. Please try another photo or style.', 502);
    }
    if (prediction.status === 'succeeded' && !safeOutput(prediction.output)) {
      await updateGenerationEvent(eventId, { status: 'failed' });
      return jsonError('The AI provider did not return a valid image.', 502);
    }
    return NextResponse.json({
      id: prediction.id,
      status: prediction.status ?? 'starting',
      imageUrl: prediction.status === 'succeeded' ? safeOutput(prediction.output) : null,
      usage: { used: usage.used, limit: usage.limit, remaining: usage.remaining },
    }, { status: 202, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    await updateGenerationEvent(eventId, { status: 'failed' }).catch(() => undefined);
    return jsonError('Could not reach the AI image provider. Please try again.', 502);
  }
}

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return jsonError('Sign in to check your AI hairstyle preview.', 401);

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return jsonError('AI hairstyle preview is not configured.', 503);

  const id = new URL(request.url).searchParams.get('id');
  if (!id || !PREDICTION_ID_PATTERN.test(id)) return jsonError('A valid prediction ID is required.', 400);

  const rate = await checkSharedRateLimit(userId, 60, 'poll');
  if (!rate.allowed) {
    if (!rate.configured) return jsonError('AI preview status is temporarily unavailable because shared rate limiting is not configured.', 503);
    return jsonError('Too many status checks. Please wait a moment.', 429, {
      'Retry-After': String(Math.max(1, rate.resetInSeconds)),
    });
  }

  try {
    const event = await findOwnedGenerationEvent(userId, id);
    if (!event) return jsonError('This hairstyle preview could not be found.', 404);

    const response = await fetch(`${REPLICATE_API}/predictions/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      if (response.status === 404) return jsonError('This hairstyle preview could not be found.', 404);
      return jsonError('Could not check the AI preview status. Please try again.', 502);
    }

    const prediction = (await response.json()) as ReplicatePrediction;
    const imageUrl = prediction.status === 'succeeded' ? safeOutput(prediction.output) : null;
    if (prediction.status === 'succeeded' && !imageUrl) {
      return jsonError('The AI provider did not return a valid image.', 502);
    }

    if (prediction.status === 'succeeded') await updateGenerationEvent(event._id as ObjectId, { status: 'completed' });
    if (prediction.status === 'failed' || prediction.status === 'canceled') await updateGenerationEvent(event._id as ObjectId, { status: 'failed' });

    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
      imageUrl,
      error: prediction.status === 'failed' || prediction.status === 'canceled'
        ? 'The AI could not complete this hairstyle preview. Please try another photo or style.'
        : null,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return jsonError('Could not check the AI preview status. Please try again.', 502);
  }
}
