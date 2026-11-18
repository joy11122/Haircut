export const AI_HAIRSTYLES = [
  { id: 'textured-crop', name: 'Textured crop', prompt: 'a modern textured crop haircut with a short textured top, soft natural fringe and clean low taper' },
  { id: 'soft-quiff', name: 'Soft quiff', prompt: 'a relaxed soft quiff haircut with natural front lift, medium textured volume and softly tapered sides' },
  { id: 'curtain-flow', name: 'Curtain flow', prompt: 'a medium-length curtain haircut with a natural center part, soft layers and movement around the temples' },
  { id: 'modern-crew', name: 'Modern crew cut', prompt: 'a modern crew cut with a slightly longer textured front and clean, natural tapered sides' },
  { id: 'low-taper-curls', name: 'Low taper curls', prompt: 'a low taper haircut that preserves defined natural curls and realistic curl texture on top' },
  { id: 'classic-side-part', name: 'Classic side part', prompt: 'a timeless classic side-part haircut with a natural side sweep, subtle volume and a low taper' },
  { id: 'buzz-cut', name: 'Even buzz cut', prompt: 'an even, neat buzz cut with a natural hairline and consistent short length' },
  { id: 'layered-fringe', name: 'Layered fringe', prompt: 'a soft layered fringe haircut with natural movement and softly connected sides' },
] as const;

export type AiHairstyleId = (typeof AI_HAIRSTYLES)[number]['id'];

export function buildHairstylePrompt(styleId: string): string | null {
  const style = AI_HAIRSTYLES.find((item) => item.id === styleId);
  if (!style) return null;

  return [
    'Edit the supplied portrait photo to show the same adult person with this haircut:',
    style.prompt + '.',
    'CRITICAL IDENTITY AND COMPOSITION RULES: preserve the person’s exact facial identity, face shape, eyes, nose, mouth, ears, skin tone, expression, age appearance, head angle, pose, clothing, background, camera perspective and lighting.',
    'Only change the hair on the scalp and the haircut silhouette. Do not change facial hair, eyebrows, skin, facial structure or any other part of the image.',
    'Make the result a highly photorealistic professional barbershop hairstyle preview. Hair must have realistic individual strands, natural hairline transitions, believable density, texture and shadows. Keep the result anatomically plausible and consistent with the original photograph.',
    'Do not add text, logos, watermarks, accessories, extra people or graphic elements. Return one edited photograph, not a collage or before-and-after layout.',
  ].join(' ');
}
