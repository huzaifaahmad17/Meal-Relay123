/**
 * Simulated AI helpers used across the platform.
 *
 * In production these would call a vision/LLM service. For the demo we
 * derive deterministic-looking results from string hashes so the same
 * inputs always produce the same outputs (so previews stay stable as
 * the user navigates).
 */

import type { FoodCategory } from './types';

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export interface AiAnalysis {
  freshness: number; // 0–100
  shelfLifeHours: number;
  spoilageRisk: 'low' | 'medium' | 'high';
  detectedCategory: FoodCategory;
  detectedCuisine: string;
  estimatedKg: number;
  estimatedMeals: number;
  co2SavedKg: number;
  confidence: number; // 0–100
  insights: string[];
  matchedNgo?: {
    name: string;
    distanceKm: number;
    capacity: number;
  };
}

const CATEGORY_HINTS: { keywords: string[]; category: FoodCategory; cuisine: string }[] = [
  { keywords: ['biryani', 'curry', 'rice', 'dal', 'sabzi', 'paneer'], category: 'cooked-meals', cuisine: 'Indian' },
  { keywords: ['vegetable', 'fruit', 'produce', 'tomato', 'onion'], category: 'fresh-produce', cuisine: 'Indian' },
  { keywords: ['bread', 'naan', 'roti', 'pastry', 'croissant', 'baked'], category: 'baked-goods', cuisine: 'Continental' },
  { keywords: ['milk', 'cheese', 'yogurt', 'dairy', 'paneer'], category: 'dairy-products', cuisine: 'Indian' },
  { keywords: ['cake', 'sweet', 'gulab', 'rasgulla', 'dessert', 'ice cream'], category: 'desserts', cuisine: 'Indian' },
  { keywords: ['chips', 'biscuit', 'snack', 'namkeen'], category: 'snacks', cuisine: 'Indian' },
  { keywords: ['juice', 'drink', 'beverage', 'coffee', 'tea'], category: 'beverages', cuisine: 'Indian' },
  { keywords: ['cereal', 'wheat', 'flour', 'grain', 'pasta'], category: 'grains-cereals', cuisine: 'Indian' },
  { keywords: ['canned', 'packaged', 'jar', 'sealed'], category: 'packaged-food', cuisine: 'Other' },
];

/**
 * Quick deterministic analysis from a title/description string. Used as a
 * fallback when there's no image yet (or alongside an uploaded image).
 */
export function analyseDescription(text: string, sizeBytes = 0): AiAnalysis {
  const lower = text.toLowerCase();
  const seed = hash(lower + sizeBytes);

  // Try keyword detection first
  let detectedCategory: FoodCategory = 'cooked-meals';
  let detectedCuisine = 'Indian';
  for (const hint of CATEGORY_HINTS) {
    if (hint.keywords.some((k) => lower.includes(k))) {
      detectedCategory = hint.category;
      detectedCuisine = hint.cuisine;
      break;
    }
  }

  const freshness = 78 + (seed % 22); // 78–99
  const shelfLifeHours =
    detectedCategory === 'cooked-meals'
      ? 4 + (seed % 4)
      : detectedCategory === 'fresh-produce'
      ? 24 + (seed % 24)
      : detectedCategory === 'packaged-food'
      ? 24 * 30
      : 12 + (seed % 12);

  const spoilageRisk: AiAnalysis['spoilageRisk'] =
    freshness > 90 ? 'low' : freshness > 80 ? 'medium' : 'high';

  // Estimated kg from text size — more verbose descriptions usually mean bigger orders
  const estimatedKg = Math.max(2, Math.round(((seed % 30) + text.length / 12) * 10) / 10);
  const estimatedMeals = Math.round(estimatedKg * 3);
  const co2SavedKg = Math.round(estimatedKg * 0.7 * 10) / 10;

  const confidence = Math.min(98, 72 + (seed % 26));

  const insights = [
    `Detected ${detectedCategory.replace('-', ' ')} with ${confidence}% confidence`,
    `Estimated shelf life: ${shelfLifeHours} hours at safe temperature`,
    spoilageRisk === 'low'
      ? 'Excellent freshness — safe for longer transit'
      : spoilageRisk === 'medium'
      ? 'Moderate freshness — recommend pickup within 2 hours'
      : 'High spoilage risk — urgent pickup required',
    `≈ ${estimatedMeals} meals · ${co2SavedKg} kg CO₂ saved if rescued`,
  ];

  // Pick a closest "matched" NGO from a stable list
  const ngos = [
    { name: 'Jaipur Food Bank', distanceKm: 1.4, capacity: 1200 },
    { name: 'Annamrita Foundation', distanceKm: 2.2, capacity: 2500 },
    { name: 'Robin Hood Army Delhi', distanceKm: 3.1, capacity: 1800 },
    { name: 'Akshaya Patra Bengaluru', distanceKm: 4.0, capacity: 3500 },
  ];
  const matchedNgo = ngos[seed % ngos.length];

  return {
    freshness,
    shelfLifeHours,
    spoilageRisk,
    detectedCategory,
    detectedCuisine,
    estimatedKg,
    estimatedMeals,
    co2SavedKg,
    confidence,
    insights,
    matchedNgo,
  };
}

/**
 * Simulate an async vision call (e.g. uploading an image to a model).
 */
export async function analyseImage(file: File, hint?: string): Promise<AiAnalysis> {
  // Simulate latency for the demo
  await new Promise((r) => setTimeout(r, 1100));
  const seed = `${file.name}|${file.size}|${hint || ''}`;
  return analyseDescription(seed, file.size);
}

/**
 * Read a File into a data URL so it can be displayed inline + persisted to
 * the demo store without needing real upload infrastructure.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * AI-flavored "smart insights" panel content for dashboards.
 */
export interface SmartInsight {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'neutral' | 'warning';
  action?: { label: string; href: string };
}

export function getSmartInsights(role: 'donor' | 'ngo' | 'volunteer' | 'admin'): SmartInsight[] {
  const common: SmartInsight[] = [
    {
      id: 'i1',
      title: 'Predicted demand spike tomorrow',
      description:
        'Based on weather + festival data, NGOs in Jaipur will need ~28% more meals tomorrow. Stock up your kitchens.',
      tone: 'warning',
      action: { label: 'View forecast', href: '/analytics' },
    },
    {
      id: 'i2',
      title: 'Optimal pickup window detected',
      description:
        'Volunteers in your area are most available between 7–9 PM. Schedule donations in that window for fastest pickup.',
      tone: 'positive',
    },
    {
      id: 'i3',
      title: 'Carbon savings milestone',
      description:
        'You\'ve crossed 1 ton of CO₂ saved this quarter — equivalent to taking a car off the road for 4 months.',
      tone: 'positive',
      action: { label: 'See impact', href: '/analytics' },
    },
  ];

  if (role === 'donor') {
    return [
      common[1],
      common[2],
      {
        id: 'd1',
        title: 'You\'re in the top 5% of donors',
        description:
          'AI ranks you above 95% of donors in your city. Keep going to unlock the Champion badge at 150 donations.',
        tone: 'positive',
      },
    ];
  }
  if (role === 'ngo') {
    return [
      common[0],
      {
        id: 'n1',
        title: 'Capacity recommendation',
        description:
          'Based on tomorrow\'s forecast, raise your daily intake target by 20%. We\'ve queued 4 standby volunteers.',
        tone: 'warning',
      },
      common[1],
    ];
  }
  if (role === 'volunteer') {
    return [
      {
        id: 'v1',
        title: 'Smart route ready',
        description:
          'AI routed your 4 pickups in the most efficient order — saves you 22 minutes vs. manual sequencing.',
        tone: 'positive',
        action: { label: 'Open route', href: '/map' },
      },
      common[1],
      common[2],
    ];
  }
  return [
    {
      id: 'a1',
      title: 'Anomaly detected · Pune cluster',
      description:
        '3 donations cancelled within 30 minutes in Pune. Likely cause: volunteer outage. Auto-paged backup team.',
      tone: 'warning',
    },
    common[0],
    common[2],
  ];
}
