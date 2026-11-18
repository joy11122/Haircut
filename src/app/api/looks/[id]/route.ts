import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { auth } from '../../../../../auth';
import { deleteCloudinaryImage, getSavedLooksCollection } from '@/lib/saved-looks';

type RouteContext = { params: Promise<{ id: string }> };
const favoriteSchema = z.object({ favorite: z.boolean() });

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getOwnedLook(id: string, userId: string) {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const collection = await getSavedLooksCollection();
  return collection.findOne({ _id: new ObjectId(id), userId });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Please sign in to update saved looks.', 401);

  const { id } = await context.params;
  const look = await getOwnedLook(id, session.user.id);
  if (!look) return errorResponse('Saved look not found.', 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body.', 400);
  }
  const parsed = favoriteSchema.safeParse(body);
  if (!parsed.success) return errorResponse('A valid favorite value is required.', 400);

  try {
    const collection = await getSavedLooksCollection();
    await collection.updateOne(
      { _id: look._id, userId: session.user.id },
      { $set: { favorite: parsed.data.favorite } },
    );
    return NextResponse.json({ favorite: parsed.data.favorite }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return errorResponse('Could not update this saved look.', 503);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Please sign in to delete saved looks.', 401);

  const { id } = await context.params;
  try {
    const look = await getOwnedLook(id, session.user.id);
    if (!look) return errorResponse('Saved look not found.', 404);

    await deleteCloudinaryImage(look.cloudinaryPublicId);
    const collection = await getSavedLooksCollection();
    await collection.deleteOne({ _id: look._id, userId: session.user.id });
    return NextResponse.json({ success: true });
  } catch {
    return errorResponse('Could not delete this saved image. Please try again.', 502);
  }
}
