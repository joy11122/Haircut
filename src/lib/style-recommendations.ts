import type { FaceShape } from './face-analysis';

export const HAIR_TEXTURES = ['Straight', 'Wavy', 'Curly', 'Coily'] as const;
export type HairTexture = (typeof HAIR_TEXTURES)[number];

export const HAIR_LENGTHS = ['Short', 'Medium', 'Long', 'Open to anything'] as const;
export type HairLength = (typeof HAIR_LENGTHS)[number];

export const MAINTENANCE_LEVELS = ['Low', 'Medium', 'High'] as const;
export type MaintenanceLevel = (typeof MAINTENANCE_LEVELS)[number];

export const STYLE_VIBES = ['Classic', 'Modern', 'Bold', 'Natural'] as const;
export type StyleVibe = (typeof STYLE_VIBES)[number];

export const BEARD_PREFERENCES = ['Clean shaven', 'Light stubble', 'Short beard', 'Full beard', 'Recommend for me'] as const;
export type BeardPreference = (typeof BEARD_PREFERENCES)[number];

export type StylePreferences = {
  hairTexture: HairTexture;
  hairLength: HairLength;
  maintenance: MaintenanceLevel;
  vibe: StyleVibe;
  beard: BeardPreference;
};

export type HairRecommendation = {
  id: string;
  name: string;
  description: string;
  faceShapes: readonly FaceShape[];
  textures: readonly HairTexture[];
  lengths: readonly HairLength[];
  maintenance: MaintenanceLevel;
  vibes: readonly StyleVibe[];
  barberNote: string;
  reason: string;
};

export type BeardRecommendation = {
  name: string;
  description: string;
  preferences: readonly BeardPreference[];
  faceShapes: readonly FaceShape[];
  barberNote: string;
  reason: string;
};

export type StyleRecommendations = {
  hair: HairRecommendation[];
  beard: BeardRecommendation;
};

const hairStyles: HairRecommendation[] = [
  { id:'textured-crop', name:'Textured crop', description:'A compact, lived-in top with a soft fringe and clean tapered sides.', faceShapes:['Oval','Round','Square','Diamond'], textures:['Straight','Wavy','Curly'], lengths:['Short','Open to anything'], maintenance:'Low', vibes:['Modern','Natural'], barberNote:'Keep the top around 4–6 cm with point-cut texture; taper the sides softly and avoid an overly high fade.', reason:'Texture adds definition while the controlled fringe keeps the silhouette balanced.' },
  { id:'classic-side-part', name:'Classic side part', description:'A neat side-swept shape with understated volume and a timeless finish.', faceShapes:['Oval','Round','Square','Oblong'], textures:['Straight','Wavy'], lengths:['Short','Medium','Open to anything'], maintenance:'Medium', vibes:['Classic'], barberNote:'Create a natural side part, leave enough length to sweep across, and use a low taper rather than taking the sides too tight.', reason:'The side direction creates structure without making the face look longer.' },
  { id:'low-taper-curls', name:'Low taper with curls', description:'Natural curl definition on top with a subtle, clean taper around the edges.', faceShapes:['Oval','Round','Square','Heart','Diamond'], textures:['Curly','Coily','Wavy'], lengths:['Short','Medium','Open to anything'], maintenance:'Medium', vibes:['Modern','Natural'], barberNote:'Preserve curl length and density on top; use a low temple and nape taper, keeping the outline soft.', reason:'It celebrates natural texture while keeping the overall outline tidy.' },
  { id:'crew-cut', name:'Modern crew cut', description:'A close, athletic cut with a little extra length at the front.', faceShapes:['Oval','Square','Diamond'], textures:['Straight','Wavy','Curly','Coily'], lengths:['Short','Open to anything'], maintenance:'Low', vibes:['Classic','Modern','Bold'], barberNote:'Leave a little more length at the front and blend the sides evenly; avoid an extreme skin fade unless requested.', reason:'A compact silhouette gives strong features a clean, confident finish.' },
  { id:'soft-quiff', name:'Soft quiff', description:'A lifted front with relaxed movement rather than stiff, exaggerated height.', faceShapes:['Oval','Square','Heart'], textures:['Straight','Wavy'], lengths:['Medium','Short','Open to anything'], maintenance:'High', vibes:['Modern','Bold'], barberNote:'Leave 7–9 cm through the front, build a soft graduation, and keep the sides tapered with enough weight for balance.', reason:'The controlled lift adds definition without overwhelming the face.' },
  { id:'curtain-flow', name:'Relaxed curtain flow', description:'A medium-length center or off-center part with natural movement around the temples.', faceShapes:['Oval','Oblong','Heart','Square'], textures:['Straight','Wavy'], lengths:['Medium','Long','Open to anything'], maintenance:'Medium', vibes:['Natural','Classic'], barberNote:'Keep layers around the cheekbone and jaw, with a soft center or off-center part; avoid removing too much weight.', reason:'The side movement softens the outline and adds width where it is useful.' },
  { id:'bro-flow', name:'Bro flow', description:'A longer brushed-back shape with loose layers and an easy, natural finish.', faceShapes:['Oval','Oblong','Square'], textures:['Wavy','Curly'], lengths:['Medium','Long','Open to anything'], maintenance:'Medium', vibes:['Natural','Bold'], barberNote:'Build long, connected layers and preserve the natural wave; shape around the ears without making the sides too narrow.', reason:'Its horizontal movement can balance a longer face shape.' },
  { id:'buzz-cut', name:'Even buzz cut', description:'A minimal, uniform cut that puts the focus on your natural features.', faceShapes:['Oval','Square','Diamond','Round'], textures:['Straight','Wavy','Curly','Coily'], lengths:['Short','Open to anything'], maintenance:'Low', vibes:['Bold','Classic'], barberNote:'Start conservatively with a longer guard, check the shape from all sides, then shorten only if preferred.', reason:'A simple outline creates a confident look with very little daily styling.' },
  { id:'afro-taper', name:'Shape-up afro with taper', description:'A rounded natural shape with a crisp but not overly sharp edge and tapered sides.', faceShapes:['Oval','Round','Square','Diamond'], textures:['Coily','Curly'], lengths:['Short','Medium','Open to anything'], maintenance:'Medium', vibes:['Bold','Natural'], barberNote:'Keep the natural volume balanced, shape the silhouette gradually, and use a low taper with a clean neckline.', reason:'The balanced volume frames the face while keeping natural texture central.' },
  { id:'layered-fringe', name:'Layered fringe', description:'A soft forward fringe with layers that move naturally rather than sitting flat.', faceShapes:['Oblong','Heart','Oval','Square'], textures:['Straight','Wavy','Curly'], lengths:['Medium','Short','Open to anything'], maintenance:'Medium', vibes:['Modern','Natural'], barberNote:'Leave a textured fringe that sits lightly above the brows; layer the top and keep the sides softly connected.', reason:'The fringe visually reduces vertical emphasis and adds softness.' },
  { id:'slick-back-undercut', name:'Relaxed slick back', description:'A brushed-back top with a controlled side silhouette and subtle contrast.', faceShapes:['Oval','Square','Diamond'], textures:['Straight','Wavy'], lengths:['Medium','Long','Open to anything'], maintenance:'High', vibes:['Classic','Bold'], barberNote:'Keep enough length to brush back without pulling tightly; use a low or mid taper and retain some side weight.', reason:'A defined top and structured sides complement balanced or angular proportions.' },
  { id:'long-curly-layers', name:'Long curly layers', description:'Defined, connected layers that let longer curls keep their natural shape.', faceShapes:['Oval','Oblong','Heart','Square'], textures:['Curly','Coily'], lengths:['Medium','Long','Open to anything'], maintenance:'High', vibes:['Natural','Bold'], barberNote:'Cut curls with their natural fall in mind, add long layers for movement, and avoid thinning out the perimeter.', reason:'Layered volume adds movement while preserving the curl pattern.' },
];

const beardStyles: BeardRecommendation[] = [
  { name:'Clean, defined shave', description:'A smooth finish that keeps the jawline completely open.', preferences:['Clean shaven'], faceShapes:['Oval','Round','Square','Heart','Oblong','Diamond'], barberNote:'Use a clean shave with a gentle skin-care finish; keep sideburn transitions natural.', reason:'A clean outline keeps the focus on your haircut and natural jawline.' },
  { name:'Soft designer stubble', description:'Short, even stubble with a tidy neckline and cheek line.', preferences:['Light stubble','Recommend for me'], faceShapes:['Oval','Round','Square','Heart','Oblong','Diamond'], barberNote:'Keep the stubble even and short; define the neckline just above the natural crease and avoid an overly high cheek line.', reason:'Light definition adds contrast without adding much visual weight.' },
  { name:'Short boxed beard', description:'A close, structured beard with clean cheek and neckline detailing.', preferences:['Short beard','Recommend for me'], faceShapes:['Oval','Round','Square','Heart','Diamond'], barberNote:'Keep the sides compact and the chin slightly fuller; blend the sideburns smoothly into the haircut.', reason:'A neat outline adds definition while keeping the proportions controlled.' },
  { name:'Balanced full beard', description:'A fuller beard shaped to follow the natural jaw and chin.', preferences:['Full beard','Recommend for me'], faceShapes:['Oval','Oblong','Heart','Square'], barberNote:'Keep the cheek area natural, taper the side bulk, and shape the chin to suit the natural jaw rather than adding unnecessary length.', reason:'Controlled fullness can complement the lower face without dominating it.' },
  { name:'Rounded short beard', description:'A softly rounded short beard with a little fullness through the sides.', preferences:['Short beard','Full beard','Recommend for me'], faceShapes:['Oblong','Diamond','Heart'], barberNote:'Keep a little width through the sides and avoid extending the chin too far downward.', reason:'A touch of side fullness can balance a narrower or longer lower outline.' },
];

export function getStyleRecommendations(shape: FaceShape, preferences: StylePreferences): StyleRecommendations {
  const scored = hairStyles.map(style => {
    let score = style.faceShapes.includes(shape) ? 4 : 0;
    if (style.textures.includes(preferences.hairTexture)) score += 3;
    if (style.lengths.includes(preferences.hairLength)) score += 2;
    if (style.maintenance === preferences.maintenance) score += 2;
    if (style.vibes.includes(preferences.vibe)) score += 2;
    return { style, score };
  }).sort((a, b) => b.score - a.score || a.style.name.localeCompare(b.style.name));

  const hair = scored.slice(0, 3).map(({ style }) => style);
  const beardPool = beardStyles.filter(style => style.preferences.includes(preferences.beard) && style.faceShapes.includes(shape));
  const beard = beardPool[0] ?? beardStyles.find(style => style.preferences.includes(preferences.beard)) ?? beardStyles[0];

  return {
    hair: hair.map(style => ({
      ...style,
      reason: style.reason + (style.faceShapes.includes(shape) ? ' It is also a good match for your selected face shape.' : ' Treat this as an alternative and ask your barber to adapt the proportions.'),
    })),
    beard: {
      ...beard,
      reason: beard.reason + (beard.faceShapes.includes(shape) ? ' Its outline is compatible with your selected face shape.' : ''),
    },
  };
}
