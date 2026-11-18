import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import { getDatabase } from '@/lib/mongodb';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type SavedLook = {
  _id: ObjectId;
  userId: string;
  styleId: string;
  styleName: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  favorite: boolean;
  createdAt: Date;
};

export function isStorageConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  );
}

export async function getSavedLooksCollection() {
  const db = await getDatabase();
  const collection = db.collection<SavedLook>('savedLooks');
  await collection.createIndex({ userId: 1, createdAt: -1 });
  await collection.createIndex({ userId: 1, favorite: 1, createdAt: -1 });
  return collection;
}

export async function deleteCloudinaryImage(publicId: string) {
  if (!isStorageConfigured()) throw new Error('Image storage is not configured.');
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error('Could not remove the saved image from storage.');
  }
}

export async function storeGeneratedImage(imageUrl: string, styleId: string) {
  if (!isStorageConfigured()) throw new Error('Image storage is not configured.');
  const url = new URL(imageUrl);
  if (
    url.protocol !== 'https:' ||
    !(url.hostname === 'replicate.delivery' || url.hostname.endsWith('.replicate.delivery'))
  ) {
    throw new Error('The generated image source is not trusted.');
  }

  const upload = await cloudinary.uploader.upload(url.toString(), {
    folder: 'haircut/saved-looks',
    public_id: `${styleId}-${new ObjectId().toString()}`,
    resource_type: 'image',
    overwrite: false,
    unique_filename: false,
  });

  return { secureUrl: upload.secure_url, publicId: upload.public_id };
}
