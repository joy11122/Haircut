import { ObjectId } from 'mongodb';
import { getDatabase } from './mongodb';

const DAILY_FREE_GENERATIONS = 3;
const RATE_LIMIT_WINDOW_SECONDS = 600;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return { count, ttl }
`;

export function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function parseRateLimitResult(value: unknown): { count: number; resetInSeconds: number } | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const count = Number(value[0]);
  const resetInSeconds = Number(value[1]);
  if (!Number.isFinite(count) || !Number.isFinite(resetInSeconds) || count < 1 || resetInSeconds < 0) return null;
  return { count, resetInSeconds };
}

export async function checkSharedRateLimit(userId: string, maxRequests = RATE_LIMIT_MAX_REQUESTS, bucket = 'generate') {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return process.env.NODE_ENV === 'production'
      ? { allowed: false, configured: false, remaining: 0, resetInSeconds: 0 }
      : { allowed: true, configured: false, remaining: maxRequests, resetInSeconds: 0 };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { allowed: false, configured: true, remaining: 0, resetInSeconds: 0 };
  }
  if (parsedUrl.protocol !== 'https:') {
    return { allowed: false, configured: true, remaining: 0, resetInSeconds: 0 };
  }

  try {
    const response = await fetch(parsedUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        'EVAL',
        RATE_LIMIT_SCRIPT,
        '1',
        `haircut:${bucket}:${userId}`,
        String(RATE_LIMIT_WINDOW_SECONDS),
      ]),
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return { allowed: false, configured: true, remaining: 0, resetInSeconds: 0 };
    const payload = await response.json() as { result?: unknown; error?: string };
    const result = parseRateLimitResult(payload.result);
    if (!result || payload.error) return { allowed: false, configured: true, remaining: 0, resetInSeconds: 0 };
    return {
      allowed: result.count <= maxRequests,
      configured: true,
      remaining: Math.max(0, maxRequests - result.count),
      resetInSeconds: result.resetInSeconds,
    };
  } catch {
    return { allowed: false, configured: true, remaining: 0, resetInSeconds: 0 };
  }
}

export async function reserveDailyGeneration(userId: string) {
  const database = await getDatabase();
  const day = utcDayKey();
  const id = `${userId}:${day}`;
  const collection = database.collection<{ _id: string; userId: string; day: string; count: number; updatedAt: Date }>('ai_daily_usage');
  let reserved = false;

  try {
    const result = await collection.updateOne(
      { _id: id, count: { $lt: DAILY_FREE_GENERATIONS } },
      {
        $inc: { count: 1 },
        $set: { updatedAt: new Date() },
        $setOnInsert: { userId, day },
      },
      { upsert: true },
    );
    reserved = result.modifiedCount === 1 || result.upsertedCount === 1;
  } catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 11000)) throw error;
  }

  const usage = await collection.findOne({ _id: id });
  const count = usage?.count ?? 0;
  return {
    allowed: reserved,
    used: count,
    limit: DAILY_FREE_GENERATIONS,
    remaining: Math.max(0, DAILY_FREE_GENERATIONS - count),
    day,
  };
}

export async function createGenerationEvent(userId: string) {
  const database = await getDatabase();
  const result = await database.collection('ai_generation_events').insertOne({
    userId,
    provider: 'replicate',
    model: 'google/gemini-2.5-flash-image',
    status: 'starting',
    createdAt: new Date(),
  });
  return result.insertedId;
}

export async function updateGenerationEvent(
  id: ObjectId,
  update: { status: 'submitted' | 'failed'; predictionId?: string },
) {
  const database = await getDatabase();
  await database.collection('ai_generation_events').updateOne(
    { _id: id },
    { $set: { ...update, updatedAt: new Date() } },
  );
}

export async function findOwnedGenerationEvent(userId: string, predictionId: string) {
  const database = await getDatabase();
  return database.collection('ai_generation_events').findOne({
    userId,
    predictionId,
    status: 'submitted',
  });
}

export async function getDailyUsage(userId: string) {
  const database = await getDatabase();
  const day = utcDayKey();
  const usage = await database.collection<{ _id: string; count: number }>('ai_daily_usage').findOne({
    _id: `${userId}:${day}`,
  });
  const used = usage?.count ?? 0;
  return { used, limit: DAILY_FREE_GENERATIONS, remaining: Math.max(0, DAILY_FREE_GENERATIONS - used), day };
}
