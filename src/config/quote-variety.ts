import { randomInt } from "node:crypto";

export const THEMES = [
  "career and ambition",
  "relationships and connection",
  "creativity and innovation",
  "resilience and perseverance",
  "adventure and exploration",
  "mindfulness and presence",
  "courage and fear",
  "wisdom and learning",
  "health and vitality",
  "change and transformation",
  "purpose and meaning",
  "authenticity and self-expression",
  "leadership and influence",
  "gratitude and appreciation",
  "failure and growth",
  "time and mortality",
  "solitude and reflection",
  "passion and enthusiasm",
  "discipline and consistency",
  "freedom and independence",
] as const;

export const TONES = [
  "powerful and commanding",
  "gentle and nurturing",
  "humorous and playful",
  "philosophical and contemplative",
  "poetic and lyrical",
  "raw and honest",
  "practical and straightforward",
  "provocative and challenging",
  "warm and encouraging",
  "mysterious and enigmatic",
  "rebellious and unconventional",
  "serene and peaceful",
] as const;

export const STYLES = [
  "metaphorical (using nature, journey, or object metaphors)",
  "storytelling (brief narrative or parable)",
  "direct advice (clear actionable wisdom)",
  "question-based (posing thought-provoking questions)",
  "paradoxical (embracing contradictions)",
  "contrarian (challenging common beliefs)",
  "observational (keen insights about human nature)",
  "comparative (contrasting two concepts)",
  "imperative (strong calls to action)",
  "reflective (looking inward)",
] as const;

export const LENGTHS = [
  { name: "brief", range: "20-40 words" },
  { name: "standard", range: "40-70 words" },
  { name: "expansive", range: "70-100 words" },
] as const;

export const getRandomElement = <T>(array: readonly T[]): T => {
  if (array.length === 0) {
    throw new RangeError("getRandomElement requires a non-empty array");
  }

  const element = array[randomInt(array.length)];
  if (element === undefined) {
    throw new RangeError("Failed to retrieve element from array");
  }

  return element;
};

export interface QuoteVariety {
  theme: (typeof THEMES)[number];
  tone: (typeof TONES)[number];
  style: (typeof STYLES)[number];
  length: (typeof LENGTHS)[number];
}

export const generateVariety = (): QuoteVariety => {
  return {
    theme: getRandomElement(THEMES),
    tone: getRandomElement(TONES),
    style: getRandomElement(STYLES),
    length: getRandomElement(LENGTHS),
  };
};
