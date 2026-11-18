import { z } from 'zod';
import { AI_HAIRSTYLES } from './ai-hairstyle';

const supportedStyleIds = AI_HAIRSTYLES.map((style) => style.id) as [string, ...string[]];

export const saveLookSchema = z.object({
  styleId: z.enum(supportedStyleIds),
  imageUrl: z.string().url().max(2048).refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' &&
        (url.hostname === 'replicate.delivery' || url.hostname.endsWith('.replicate.delivery'));
    } catch {
      return false;
    }
  }, 'Image must come from the trusted AI image provider.'),
});
