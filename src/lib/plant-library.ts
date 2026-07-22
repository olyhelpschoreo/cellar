// A small, curated houseplant care library. This is the free, offline stand-in
// for AI plant-ID: it powers species autocomplete + care autofill in the add
// flow and a care-guide card on the detail page. Care values are sensible
// houseplant norms, not medical/authoritative guidance.

import type { LightLevel } from "./types";

export type Difficulty = "easy" | "moderate" | "fussy";

export interface PlantSpecies {
  /** Common name — what users search by. */
  common: string;
  scientific: string;
  waterEveryDays: number;
  light: LightLevel;
  difficulty: Difficulty;
  /** Whether it's non-toxic to cats & dogs (best-effort general guidance). */
  petSafe: boolean;
  /** One-line care tip. */
  tips: string;
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy-going",
  moderate: "Moderate",
  fussy: "Fussy",
};

export const PLANT_LIBRARY: PlantSpecies[] = [
  {
    common: "Snake Plant",
    scientific: "Dracaena trifasciata",
    waterEveryDays: 21,
    light: "low",
    difficulty: "easy",
    petSafe: false,
    tips: "Let the soil dry out completely — overwatering is the only real risk.",
  },
  {
    common: "Monstera Deliciosa",
    scientific: "Monstera deliciosa",
    waterEveryDays: 9,
    light: "bright",
    difficulty: "easy",
    petSafe: false,
    tips: "Loves bright indirect light and a moss pole to climb.",
  },
  {
    common: "Golden Pothos",
    scientific: "Epipremnum aureum",
    waterEveryDays: 7,
    light: "medium",
    difficulty: "easy",
    petSafe: false,
    tips: "Nearly unkillable trailer — pinch tips to keep it bushy.",
  },
  {
    common: "ZZ Plant",
    scientific: "Zamioculcas zamiifolia",
    waterEveryDays: 18,
    light: "low",
    difficulty: "easy",
    petSafe: false,
    tips: "Thrives on neglect and low light. Water sparingly.",
  },
  {
    common: "Peace Lily",
    scientific: "Spathiphyllum wallisii",
    waterEveryDays: 6,
    light: "medium",
    difficulty: "moderate",
    petSafe: false,
    tips: "Droops dramatically when thirsty, then perks right back up.",
  },
  {
    common: "Spider Plant",
    scientific: "Chlorophytum comosum",
    waterEveryDays: 7,
    light: "medium",
    difficulty: "easy",
    petSafe: true,
    tips: "Pet-safe and prolific — sends out baby plantlets you can pot.",
  },
  {
    common: "Boston Fern",
    scientific: "Nephrolepis exaltata",
    waterEveryDays: 4,
    light: "medium",
    difficulty: "moderate",
    petSafe: true,
    tips: "Wants humidity and consistently moist soil — mist often.",
  },
  {
    common: "Fiddle Leaf Fig",
    scientific: "Ficus lyrata",
    waterEveryDays: 10,
    light: "bright",
    difficulty: "fussy",
    petSafe: false,
    tips: "Hates being moved. Pick one bright spot and leave it.",
  },
  {
    common: "Rubber Plant",
    scientific: "Ficus elastica",
    waterEveryDays: 10,
    light: "bright",
    difficulty: "easy",
    petSafe: false,
    tips: "Wipe the big glossy leaves to keep them dust-free.",
  },
  {
    common: "Chinese Money Plant",
    scientific: "Pilea peperomioides",
    waterEveryDays: 8,
    light: "bright",
    difficulty: "easy",
    petSafe: true,
    tips: "Rotate weekly so it grows evenly toward the light.",
  },
  {
    common: "Aloe Vera",
    scientific: "Aloe barbadensis miller",
    waterEveryDays: 18,
    light: "bright",
    difficulty: "easy",
    petSafe: false,
    tips: "A succulent — deep but infrequent watering, gritty soil.",
  },
  {
    common: "Jade Plant",
    scientific: "Crassula ovata",
    waterEveryDays: 16,
    light: "bright",
    difficulty: "easy",
    petSafe: false,
    tips: "Let it dry between drinks; wrinkled leaves mean thirsty.",
  },
  {
    common: "Echeveria",
    scientific: "Echeveria elegans",
    waterEveryDays: 14,
    light: "bright",
    difficulty: "moderate",
    petSafe: true,
    tips: "Water the soil, never the rosette. Loves the sunniest sill.",
  },
  {
    common: "String of Pearls",
    scientific: "Curio rowleyanus",
    waterEveryDays: 14,
    light: "bright",
    difficulty: "fussy",
    petSafe: false,
    tips: "Shallow pot, gritty mix — pearls shrivel when underwatered.",
  },
  {
    common: "Philodendron Heartleaf",
    scientific: "Philodendron hederaceum",
    waterEveryDays: 8,
    light: "medium",
    difficulty: "easy",
    petSafe: false,
    tips: "Forgiving trailer; happy in medium light and averagely moist soil.",
  },
  {
    common: "Calathea Orbifolia",
    scientific: "Goeppertia orbifolia",
    waterEveryDays: 5,
    light: "medium",
    difficulty: "fussy",
    petSafe: true,
    tips: "Craves humidity and filtered water — sensitive to tap minerals.",
  },
  {
    common: "Prayer Plant",
    scientific: "Maranta leuconeura",
    waterEveryDays: 5,
    light: "medium",
    difficulty: "moderate",
    petSafe: true,
    tips: "Folds its leaves up at night. Keep soil lightly moist.",
  },
  {
    common: "Bird of Paradise",
    scientific: "Strelitzia nicolai",
    waterEveryDays: 8,
    light: "bright",
    difficulty: "moderate",
    petSafe: false,
    tips: "Wants the brightest room you have to grow those big paddles.",
  },
  {
    common: "Areca Palm",
    scientific: "Dypsis lutescens",
    waterEveryDays: 6,
    light: "bright",
    difficulty: "moderate",
    petSafe: true,
    tips: "Pet-safe palm; keep evenly moist and out of cold drafts.",
  },
  {
    common: "Parlor Palm",
    scientific: "Chamaedorea elegans",
    waterEveryDays: 8,
    light: "low",
    difficulty: "easy",
    petSafe: true,
    tips: "Tolerates low light and is safe around pets.",
  },
  {
    common: "English Ivy",
    scientific: "Hedera helix",
    waterEveryDays: 6,
    light: "medium",
    difficulty: "moderate",
    petSafe: false,
    tips: "Likes cool, bright spots and regular trims to stay full.",
  },
  {
    common: "Croton",
    scientific: "Codiaeum variegatum",
    waterEveryDays: 6,
    light: "bright",
    difficulty: "fussy",
    petSafe: false,
    tips: "The more light, the bolder the colors. Hates being moved.",
  },
  {
    common: "Dieffenbachia",
    scientific: "Dieffenbachia seguine",
    waterEveryDays: 8,
    light: "medium",
    difficulty: "easy",
    petSafe: false,
    tips: "Big tropical leaves; let the top inch of soil dry first.",
  },
  {
    common: "Anthurium",
    scientific: "Anthurium andraeanum",
    waterEveryDays: 7,
    light: "bright",
    difficulty: "moderate",
    petSafe: false,
    tips: "Blooms best in bright indirect light with airy soil.",
  },
  {
    common: "Christmas Cactus",
    scientific: "Schlumbergera bridgesii",
    waterEveryDays: 12,
    light: "medium",
    difficulty: "easy",
    petSafe: true,
    tips: "A jungle cactus — more water than desert ones; blooms mid-winter.",
  },
  {
    common: "African Violet",
    scientific: "Saintpaulia ionantha",
    waterEveryDays: 7,
    light: "medium",
    difficulty: "moderate",
    petSafe: true,
    tips: "Water from the bottom; keep water off the fuzzy leaves.",
  },
  {
    common: "Orchid (Moth)",
    scientific: "Phalaenopsis",
    waterEveryDays: 7,
    light: "medium",
    difficulty: "moderate",
    petSafe: true,
    tips: "Grow in bark, not soil. A few ice cubes or a weekly soak.",
  },
  {
    common: "Succulent (Haworthia)",
    scientific: "Haworthiopsis attenuata",
    waterEveryDays: 16,
    light: "medium",
    difficulty: "easy",
    petSafe: true,
    tips: "Pet-safe little rosette; tolerates lower light than most succulents.",
  },
  {
    common: "Cast Iron Plant",
    scientific: "Aspidistra elatior",
    waterEveryDays: 12,
    light: "low",
    difficulty: "easy",
    petSafe: true,
    tips: "Almost impossible to kill — low light, infrequent water, pet-safe.",
  },
  {
    common: "Dracaena Marginata",
    scientific: "Dracaena marginata",
    waterEveryDays: 12,
    light: "medium",
    difficulty: "easy",
    petSafe: false,
    tips: "Sensitive to fluoride — use filtered water if tips brown.",
  },
  {
    common: "Nerve Plant",
    scientific: "Fittonia albivenis",
    waterEveryDays: 4,
    light: "medium",
    difficulty: "fussy",
    petSafe: true,
    tips: "The drama queen — faints when dry, revives when watered.",
  },
  {
    common: "Peperomia",
    scientific: "Peperomia obtusifolia",
    waterEveryDays: 10,
    light: "medium",
    difficulty: "easy",
    petSafe: true,
    tips: "Semi-succulent leaves store water — let it dry between drinks.",
  },
  {
    common: "Hoya",
    scientific: "Hoya carnosa",
    waterEveryDays: 12,
    light: "bright",
    difficulty: "easy",
    petSafe: true,
    tips: "Waxy trailer; let it get root-bound to encourage the fragrant blooms.",
  },
  {
    common: "Air Plant",
    scientific: "Tillandsia",
    waterEveryDays: 5,
    light: "bright",
    difficulty: "moderate",
    petSafe: true,
    tips: "No soil — soak in water for 20 min, then dry upside down.",
  },
  {
    common: "Aglaonema",
    scientific: "Aglaonema commutatum",
    waterEveryDays: 9,
    light: "low",
    difficulty: "easy",
    petSafe: false,
    tips: "Chinese Evergreen — colorful, tough, and low-light tolerant.",
  },
  {
    common: "Ponytail Palm",
    scientific: "Beaucarnea recurvata",
    waterEveryDays: 18,
    light: "bright",
    difficulty: "easy",
    petSafe: true,
    tips: "Stores water in its bulb-like base — treat it like a succulent.",
  },
];

/** Case-insensitive lookup by common or scientific name. */
export function findSpecies(query: string): PlantSpecies | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return PLANT_LIBRARY.find(
    (p) => p.common.toLowerCase() === q || p.scientific.toLowerCase() === q,
  );
}

/** Ranked suggestions for a partial query (prefix matches first). */
export function searchSpecies(query: string, limit = 6): PlantSpecies[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = PLANT_LIBRARY.map((p) => {
    const common = p.common.toLowerCase();
    const sci = p.scientific.toLowerCase();
    let score = -1;
    if (common.startsWith(q)) score = 0;
    else if (sci.startsWith(q)) score = 1;
    else if (common.includes(q)) score = 2;
    else if (sci.includes(q)) score = 3;
    return { p, score };
  })
    .filter((s) => s.score >= 0)
    .sort((a, b) => a.score - b.score || a.p.common.localeCompare(b.p.common));
  return scored.slice(0, limit).map((s) => s.p);
}
