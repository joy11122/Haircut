import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '../../../../../../auth';
import { getPrivateImageDeliveryUrl, getSavedLooksCollection } from '@/lib/saved-looks';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to view this saved image.' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ error: 'Saved image not found.' }, { status: 404 });
  }

  try {
    const collection = await getSavedLooksCollection();
    const look = await collection.findOne({ _id: new ObjectId(id), userId: session.user.id });
    if (!look) return NextResponse.json({ error: 'Saved image not found.' }, { status: 404 });

    const deliveryUrl = getPrivateImageDeliveryUrl(look.cloudinaryPublicId);
    const image = await fetch(deliveryUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
    if (!image.ok) {
      return NextResponse.json({ error: 'Saved image is temporarily unavailable.' }, { status: 502 });
    }

    const contentType = image.headers.get('content-type') || '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType.split(';')[0])) {
      return NextResponse.json({ error: 'Stored file is not a supported image.' }, { status: 502 });
    }

    const bytes = await image.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > 12 * 1024 * 1024) {
      return NextResponse.json({ error: 'Stored image has an invalid size.' }, { status: 502 });
    }

    return new NextResponse(bytes, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(bytes.byteLength),
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Could not load this saved image.' }, { status: 503 });
  }
}
