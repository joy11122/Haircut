export const FACE_SHAPES = ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'] as const;
export type FaceShape = (typeof FACE_SHAPES)[number];

export type FaceAnalysis = {
  shape: FaceShape;
  confidence: number;
  explanation: string;
  proportions: {
    lengthToWidth: number;
    foreheadToCheek: number;
    jawToCheek: number;
  };
};

export type FaceLandmarkPoint = { x: number; y: number; z?: number };

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm';

function distance(a: FaceLandmarkPoint, b: FaceLandmarkPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function ratio(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}

export function classifyFaceLandmarks(points: FaceLandmarkPoint[]): FaceAnalysis {
  // MediaPipe Face Mesh landmark positions: forehead, chin, cheekbones,
  // temples and jaw corners. Ratios are approximate visual heuristics.
  const foreheadWidth = distance(points[127], points[356]);
  const cheekWidth = distance(points[234], points[454]);
  const jawWidth = distance(points[172], points[397]);
  const faceLength = distance(points[10], points[152]);

  if (![foreheadWidth, cheekWidth, jawWidth, faceLength].every(Number.isFinite) ||
      Math.min(foreheadWidth, cheekWidth, jawWidth, faceLength) < 0.001) {
    throw new Error('We could not read enough facial detail. Try a clear, front-facing photo.');
  }

  const lengthToWidth = ratio(faceLength, cheekWidth);
  const foreheadToCheek = ratio(foreheadWidth, cheekWidth);
  const jawToCheek = ratio(jawWidth, cheekWidth);

  let shape: FaceShape = 'Oval';
  let confidence = 64;
  let explanation = 'Your overall proportions appear relatively balanced, with a softly tapered jaw.';

  if (lengthToWidth >= 1.48) {
    shape = 'Oblong';
    confidence = Math.min(88, 68 + Math.round((lengthToWidth - 1.48) * 35));
    explanation = 'Your face appears noticeably longer than it is wide, with a more elongated outline.';
  } else if (foreheadToCheek >= 1.04 && jawToCheek <= 0.76) {
    shape = 'Heart';
    confidence = 74;
    explanation = 'Your upper face appears broader than your jaw, creating a tapered lower outline.';
  } else if (cheekWidth > foreheadWidth * 1.08 && cheekWidth > jawWidth * 1.12) {
    shape = 'Diamond';
    confidence = 72;
    explanation = 'Your cheek area appears widest, while the forehead and jaw taper inward.';
  } else if (jawToCheek >= 0.84 && foreheadToCheek >= 0.82 && lengthToWidth < 1.48) {
    shape = 'Square';
    confidence = 73;
    explanation = 'Your forehead, cheek area and jaw appear similarly broad, with a stronger jaw outline.';
  } else if (lengthToWidth <= 1.28 && jawToCheek >= 0.76) {
    shape = 'Round';
    confidence = 71;
    explanation = 'Your face appears relatively short compared with its width, with softer jaw proportions.';
  }

  return {
    shape,
    confidence,
    explanation,
    proportions: {
      lengthToWidth: Number(lengthToWidth.toFixed(2)),
      foreheadToCheek: Number(foreheadToCheek.toFixed(2)),
      jawToCheek: Number(jawToCheek.toFixed(2)),
    },
  };
}

export async function analyzeFaceShape(image: HTMLImageElement): Promise<FaceAnalysis> {
  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);
  const landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
    runningMode: 'IMAGE',
    numFaces: 2,
  });

  try {
    const result = landmarker.detect(image);
    const faces = result.faceLandmarks ?? [];
    if (faces.length === 0) {
      throw new Error('No face found. Use a well-lit, front-facing portrait with your face clearly visible.');
    }
    if (faces.length > 1) {
      throw new Error('More than one face was found. Please upload a photo with only you in it.');
    }
    const points = faces[0] as FaceLandmarkPoint[];
    if (points.length < 455) {
      throw new Error('The face landmarks were incomplete. Please try another photo.');
    }
    return classifyFaceLandmarks(points);
  } finally {
    landmarker.close();
  }
}
