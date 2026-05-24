import { carbSpeedOptions, sourceMeta } from '../data/constants';

const dateKeyLocal = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
const monthKeyLocal = (date = new Date()) => dateKeyLocal(date).slice(0, 7);
const todayKey = () => dateKeyLocal(new Date());
const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;
const uid = () => Date.now() + Math.floor(Math.random() * 10000);

function calcEntry(food, grams) {
  const g = Number(grams) || 0;
  if (!food) return { carbs: 0, protein: 0, fat: 0, kcal: 0 };
  return {
    carbs: round1((food.carbs * g) / 100),
    protein: round1((food.protein * g) / 100),
    fat: round1((food.fat * g) / 100),
    kcal: round1((food.kcal * g) / 100),
  };
}

function carbSpeedMeta(speed) {
  return carbSpeedOptions.find((x) => x.value === speed) || carbSpeedOptions[1];
}

function foodSourceMeta(food) {
  if (food?.isRecipe) return sourceMeta.recipe;
  return sourceMeta[food?.source || 'manual'] || sourceMeta.manual;
}

function scaleRecipeIngredients(food, grams) {
  if (!food?.isRecipe || !Array.isArray(food.ingredients)) return [];
  const factor = (Number(grams) || 0) / (food.recipeTotalWeight || 100);
  return food.ingredients.map((ing) => ({ ...ing, scaledGrams: round1(ing.grams * factor) }));
}

function getWeekRange(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: dateKeyLocal(monday),
    end: dateKeyLocal(sunday),
  };
}

function getUsageColor(count) {
  if (count >= 11) return 'bg-red-200';
  if (count >= 8) return 'bg-orange-200';
  if (count >= 5) return 'bg-green-200';
  return 'bg-white';
}

function portionLevel(portions) {
  if (portions >= 10) return { label: 'rosso', bg: 'bg-red-200', text: 'text-red-900', color: '#ef4444' };
  if (portions >= 7) return { label: 'arancio', bg: 'bg-orange-200', text: 'text-orange-900', color: '#f97316' };
  if (portions >= 4) return { label: 'verde', bg: 'bg-green-200', text: 'text-green-900', color: '#22c55e' };
  return { label: 'bianco', bg: 'bg-white', text: 'text-slate-700', color: '#ffffff' };
}

export {
  dateKeyLocal,
  monthKeyLocal,
  todayKey,
  round1,
  uid,
  calcEntry,
  carbSpeedMeta,
  foodSourceMeta,
  scaleRecipeIngredients,
  getWeekRange,
  getUsageColor,
  portionLevel,
};
