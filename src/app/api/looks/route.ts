import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { AI_HAIRSTYLES } from '@/lib/ai-hairstyle';
import { getSavedLooksCollection, isStorageConfigured, storeGeneratedImage } from '@/lib/saved-looks';
import { saveLookSchema } from '@/lib/saved-look-validation';

export const runtime = 'nodejs';

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Please sign in to view your saved looks.', 401);

  try {
    const collection = await getSavedLooksCollection();
    const looks = await collection.find(
      { userId: session.user.id },
      { projection: { userId: 0, cloudinaryPublicId: 0 } },
    ).sort({ createdAt: -1 }).limit(50).toArray();

    return NextResponse.json({ looks: looks.map((look) => ({
      id: look._id.toString(),
      styleId: look.styleId,
      styleName: look.styleName,
      imageUrl: '/api/looks/' + look._id.toString() + '/image',
      favorite: look.favorite,
      createdAt: look.createdAt.toISOString(),
    })) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return errorResponse('Saved looks are temporarily unavailable. Check the database configuration.', 503);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Sign in before saving a hairstyle.', 401);
  if (!isStorageConfigured()) return errorResponse('Image storage is not configured yet. Add the Cloudinary server credentials.', 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body.', 400);
  }

  const parsed = saveLookSchema.safeParse(body);
  if (!parsed.success) return errorResponse('Choose a valid hairstyle and generated image.', 400);

  const style = AI_HAIRSTYLES.find((item) => item.id === parsed.data.styleId);
  if (!style) return errorResponse('That hairstyle is not supported.', 400);

  try {
    const collection = await getSavedLooksCollection();
    const count = await collection.countDocuments({ userId: session.user.id });
    if (count >= 50) return errorResponse('Your library is full. Delete a saved look before adding another.', 409);

    const stored = await storeGeneratedImage(parsed.data.imageUrl, style.id);
    const saved = {
      userId: session.user.id,
      styleId: style.id,
      styleName: style.name,
      cloudinaryPublicId: stored.publicId,
      favorite: false,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(saved);
    return NextResponse.json({
      look: {
        id: result.insertedId.toString(),
        styleId: saved.styleId,
        styleName: saved.styleName,
        imageUrl: '/api/looks/' + result.insertedId.toString() + '/image',
        favorite: saved.favorite,
        createdAt: saved.createdAt.toISOString(),
      },
    }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return errorResponse('Could not save this hairstyle. Please try again.', 502);
  }
}
