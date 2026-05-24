const STORAGE_KEY = 'macro-food-calendar-v4';

const mealTypes = ['Colazione', 'Merenda mattina', 'Pranzo', 'Merenda pomeriggio', 'Cena', 'Merenda bonus'];

const defaultMealTargets = {
  Colazione: 0,
  'Merenda mattina': 0,
  Pranzo: 0,
  'Merenda pomeriggio': 0,
  Cena: 0,
  'Merenda bonus': 0,
};

const defaultDailyTargets = { carbs: 0, protein: 0, fat: 0, kcal: 0 };
const defaultMacroPercents = { carbs: 50, protein: 20, fat: 30 };

const carbSpeedOptions = [
  { value: 'slow', label: 'Lento', icon: '↘', color: 'text-green-600' },
  { value: 'medium', label: 'Medio', icon: '↘↘', color: 'text-orange-500' },
  { value: 'fast', label: 'Veloce', icon: '↘↘↘', color: 'text-red-600' },
];

const sourceMeta = {
  manual: { icon: '✍️', label: 'Manuale', color: 'bg-slate-100 text-slate-700' },
  recipe: { icon: '🍲', label: 'Ricetta', color: 'bg-amber-100 text-amber-800' },
  publicVerified: { icon: '🏛️', label: 'Database pubblico verificato', color: 'bg-green-100 text-green-800' },
  publicCheck: { icon: '🌍⚠️', label: 'Pubblico: verifica etichetta', color: 'bg-yellow-100 text-yellow-800' },
};

const foodGroups = [
  { id: 'carbs',      label: '🍞 Carboidrati' },
  { id: 'sugars',     label: '🍬 Zuccheri' },
  { id: 'meat',       label: '🥩 Carne' },
  { id: 'fish',       label: '🐟 Pesce' },
  { id: 'eggs',       label: '🥚 Uova' },
  { id: 'dairy',      label: '🥛 Latticini' },
  { id: 'legumes',    label: '🫘 Legumi' },
  { id: 'fats',       label: '🧈 Grassi e oli' },
  { id: 'vegetables', label: '🥦 Verdura' },
  { id: 'fruit',      label: '🍎 Frutta' },
  { id: 'nuts',       label: '🌰 Frutta secca' },
  { id: 'snacks',     label: '🍰 Dolci e snack' },
  { id: 'drinks',     label: '🥤 Bevande' },
  { id: 'grains',     label: '🌾 Cereali e farine' },
  { id: 'other',      label: '📦 Altro' },
];

export {
  STORAGE_KEY,
  mealTypes,
  defaultMealTargets,
  defaultDailyTargets,
  defaultMacroPercents,
  carbSpeedOptions,
  sourceMeta,
  foodGroups,
};
