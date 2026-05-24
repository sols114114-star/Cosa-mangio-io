import React, { useEffect, useMemo, useState } from 'react';
import {
  STORAGE_KEY,
  mealTypes,
  defaultMealTargets,
  defaultDailyTargets,
  defaultMacroPercents,
  carbSpeedOptions,
  foodGroups,
} from './data/constants';
import { publicFoods, defaultFoods } from './data/foods';
import {
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
  portionLevel,
} from './utils/helpers';

import BottomNav from './components/BottomNav';
import QuickAddModal from './components/QuickAddModal';
import HomePage from './pages/HomePage';
import HealthPage from './pages/HealthPage';
import CibiPage from './pages/CibiPage';
import SettingsPage from './pages/SettingsPage';

export default function MacroFoodCalendarApp() {
  const [activePage, setActivePage] = useState('home');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const [foods, setFoods] = useState(defaultFoods);
  const [days, setDays] = useState({});
  const [healthDays, setHealthDays] = useState({});
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [calendarMonth, setCalendarMonth] = useState(monthKeyLocal());
  const [search, setSearch] = useState('');
  const [publicSearch, setPublicSearch] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState(1);
  const [addGrams, setAddGrams] = useState('100');
  const [addCarbs, setAddCarbs] = useState('');
  const [addNote, setAddNote] = useState('');
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [swapEntry, setSwapEntry] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState('Colazione');
  const [mealTargets, setMealTargets] = useState(defaultMealTargets);
  const [dailyTargets, setDailyTargets] = useState(defaultDailyTargets);
  const [dailyTargetAuto, setDailyTargetAuto] = useState(true);
  const [macroPercents, setMacroPercents] = useState(defaultMacroPercents);
  const [foodForm, setFoodForm] = useState({ name: '', carbs: '', protein: '', fat: '', kcal: '', carbSpeed: 'medium', portionSize: '', group: 'other' });
  const [showRecipeCreator, setShowRecipeCreator] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [recipeName, setRecipeName] = useState('');
  const [recipeSpeed, setRecipeSpeed] = useState('medium');
  const [recipeRows, setRecipeRows] = useState([{ id: uid(), foodId: 1, grams: '' }]);
  const [recipeIngredientSearch, setRecipeIngredientSearch] = useState('');
  const [recipeViewEntry, setRecipeViewEntry] = useState(null);
  const [storageLoaded, setStorageLoaded] = useState(false);

  const saveData = (overrides = {}) => {
    const data = {
      foods, days, healthDays, selectedDate, calendarMonth,
      mealTargets, dailyTargets, dailyTargetAuto, macroPercents,
      ...overrides,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  useEffect(() => {
    document.title = '🍝 Cosa mangio';
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.foods) setFoods(saved.foods);
      if (saved?.days) setDays(saved.days);
      if (saved?.healthDays) setHealthDays(saved.healthDays);
      if (saved?.selectedDate) setSelectedDate(saved.selectedDate);
      if (saved?.calendarMonth) setCalendarMonth(saved.calendarMonth);
      if (saved?.mealTargets) setMealTargets({ ...defaultMealTargets, ...saved.mealTargets });
      if (saved?.dailyTargets) setDailyTargets({ ...defaultDailyTargets, ...saved.dailyTargets });
      if (typeof saved?.dailyTargetAuto === 'boolean') setDailyTargetAuto(saved.dailyTargetAuto);
      if (saved?.macroPercents) setMacroPercents({ ...defaultMacroPercents, ...saved.macroPercents });
    } catch {}
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    saveData();
  }, [storageLoaded, foods, days, healthDays, selectedDate, calendarMonth, mealTargets, dailyTargets, dailyTargetAuto, macroPercents]);

  useEffect(() => {
    const saveNow = () => { if (storageLoaded) saveData(); };
    window.addEventListener('beforeunload', saveNow);
    document.addEventListener('visibilitychange', saveNow);
    return () => {
      window.removeEventListener('beforeunload', saveNow);
      document.removeEventListener('visibilitychange', saveNow);
    };
  }, [storageLoaded, foods, days, healthDays, selectedDate, calendarMonth, mealTargets, dailyTargets, dailyTargetAuto, macroPercents]);

  const entries = days[selectedDate] || [];
  const filteredFoods = foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPublicFoods = publicFoods.filter((f) => f.name.toLowerCase().includes(publicSearch.toLowerCase()));

  const weeklyIngredientUsage = useMemo(() => {
    const { start, end } = getWeekRange(selectedDate);
    const gramsByFood = {};
    Object.entries(days).forEach(([date, dayEntries]) => {
      if (date < start || date > end) return;
      dayEntries.forEach((entry) => {
        const food = foods.find((f) => f.id === entry.foodId);
        if (!food) return;
        if (food.isRecipe && Array.isArray(food.ingredients)) {
          const factor = (Number(entry.grams) || 0) / (food.recipeTotalWeight || 100);
          food.ingredients.forEach((ing) => {
            gramsByFood[ing.foodId] = (gramsByFood[ing.foodId] || 0) + ing.grams * factor;
          });
        } else {
          gramsByFood[food.id] = (gramsByFood[food.id] || 0) + (Number(entry.grams) || 0);
        }
      });
    });
    const result = {};
    foods.forEach((food) => {
      const grams = gramsByFood[food.id] || 0;
      const portionSize = Number(food.portionSize) || 100;
      const portions = round1(grams / portionSize);
      result[food.id] = { grams: round1(grams), portions, level: portionLevel(portions) };
    });
    return result;
  }, [days, foods, selectedDate]);

  const monthDays = useMemo(() => {
    const [year, month] = calendarMonth.split('-').map(Number);
    const y = year, m = month - 1;
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startOffset = (first.getDay() + 6) % 7;
    const arr = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= last.getDate(); d++) arr.push({ day: d, key: dateKeyLocal(new Date(y, m, d)) });
    while (arr.length < 42) arr.push(null);
    return arr.slice(0, 42);
  }, [calendarMonth]);

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        const food = foods.find((f) => f.id === entry.foodId);
        const m = calcEntry(food, entry.grams);
        acc.carbs += m.carbs; acc.protein += m.protein; acc.fat += m.fat; acc.kcal += m.kcal;
        return acc;
      },
      { carbs: 0, protein: 0, fat: 0, kcal: 0 }
    );
  }, [entries, foods]);

  const total = { carbs: round1(totals.carbs), protein: round1(totals.protein), fat: round1(totals.fat), kcal: round1(totals.kcal) };
  const macroCalories = { carbs: total.carbs * 4, protein: total.protein * 4, fat: total.fat * 9 };
  const macroTotalCalories = macroCalories.carbs + macroCalories.protein + macroCalories.fat;
  const macroPerc = {
    carbs: macroTotalCalories ? Math.round((macroCalories.carbs * 100) / macroTotalCalories) : 0,
    protein: macroTotalCalories ? Math.round((macroCalories.protein * 100) / macroTotalCalories) : 0,
    fat: macroTotalCalories ? Math.round((macroCalories.fat * 100) / macroTotalCalories) : 0,
  };
  const pieData = [
    { name: 'Carboidrati', value: macroPerc.carbs, color: '#22c55e' },
    { name: 'Proteine', value: macroPerc.protein, color: '#3b82f6' },
    { name: 'Grassi', value: macroPerc.fat, color: '#f97316' },
  ].filter((item) => item.value > 0);

  const autoCarbsTarget = round1(mealTypes.reduce((sum, meal) => sum + (Number(mealTargets[meal]) || 0), 0));
  const autoCaloriesTarget = macroPercents.carbs > 0 ? round1((autoCarbsTarget * 4 * 100) / macroPercents.carbs) : 0;
  const effectiveDailyTargets = dailyTargetAuto
    ? {
        carbs: autoCarbsTarget,
        protein: round1((autoCaloriesTarget * (Number(macroPercents.protein) || 0)) / 100 / 4),
        fat: round1((autoCaloriesTarget * (Number(macroPercents.fat) || 0)) / 100 / 9),
        kcal: autoCaloriesTarget,
      }
    : dailyTargets;

  function targetInfo(current, target) {
    const t = Number(target) || 0, c = Number(current) || 0;
    if (!t) return { text: 'Obiettivo non impostato', percent: 0, done: false };
    const diff = round1(t - c);
    return { text: diff >= 0 ? `Mancano ${diff}` : `Superato di ${Math.abs(diff)}`, percent: Math.min(100, Math.round((c * 100) / t)), done: c >= t };
  }

  function moveMonth(delta) {
    const [year, month] = calendarMonth.split('-').map(Number);
    const next = new Date(year, month - 1 + delta, 1);
    setCalendarMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  }

  function goToday() {
    setSelectedDate(todayKey());
    setCalendarMonth(monthKeyLocal());
  }

  function saveFood() {
    if (!foodForm.name.trim()) return;
    const data = {
      name: foodForm.name.trim(),
      carbs: Number(foodForm.carbs) || 0,
      protein: Number(foodForm.protein) || 0,
      fat: Number(foodForm.fat) || 0,
      carbSpeed: foodForm.carbSpeed || 'medium',
      source: 'manual',
      kcal: Number(foodForm.kcal) || round1((Number(foodForm.carbs)||0)*4 + (Number(foodForm.protein)||0)*4 + (Number(foodForm.fat)||0)*9),
      portionSize: Number(foodForm.portionSize) || 100,
      group: foodForm.group || 'other',
    };
    if (editingFoodId) {
      setFoods((prev) => prev.map((f) => (f.id === editingFoodId ? { ...f, ...data } : f)));
      setEditingFoodId(null);
    } else {
      const newFood = { id: uid(), ...data };
      setFoods((prev) => [...prev, newFood]);
      setSelectedFoodId(newFood.id);
    }
    setFoodForm({ name: '', carbs: '', protein: '', fat: '', kcal: '', carbSpeed: 'medium', portionSize: '', group: 'other' });
  }

  function importPublicFood(food) {
    const exists = foods.some((f) => f.publicId === food.id || f.name.toLowerCase() === food.name.toLowerCase());
    if (exists) return;
    const newFood = { ...food, id: uid(), publicId: food.id, group: food.group || 'other', carbSpeed: food.carbSpeed || 'medium', portionSize: food.portionSize || 100 };
    setFoods((prev) => [...prev, newFood]);
    setSelectedFoodId(newFood.id);
  }

  function editFood(food) {
    setEditingFoodId(food.id);
    setFoodForm({ name: food.name, carbs: food.carbs, protein: food.protein, fat: food.fat, kcal: food.kcal, carbSpeed: food.carbSpeed || 'medium', portionSize: food.portionSize || 100, group: food.group || 'other' });
  }

  function openRecipeEditor(recipe) {
    setEditingRecipeId(recipe.id);
    setRecipeName(recipe.name);
    setRecipeSpeed(recipe.carbSpeed || 'medium');
    setRecipeRows((recipe.ingredients || []).map((ing) => ({ id: uid(), foodId: ing.foodId, grams: ing.grams })));
    setShowRecipeCreator(true);
  }

  function createRecipe() {
    if (!recipeName.trim()) return;
    const validRows = recipeRows
      .map((row) => ({ ...row, food: foods.find((f) => f.id === Number(row.foodId)), grams: Number(row.grams) || 0 }))
      .filter((row) => row.food && row.grams > 0);
    const totalWeight = validRows.reduce((sum, row) => sum + row.grams, 0);
    if (totalWeight <= 0) return;
    const totalsR = validRows.reduce((acc, row) => {
      const m = calcEntry(row.food, row.grams);
      acc.carbs += m.carbs; acc.protein += m.protein; acc.fat += m.fat; acc.kcal += m.kcal;
      return acc;
    }, { carbs: 0, protein: 0, fat: 0, kcal: 0 });
    const newRecipe = {
      id: editingRecipeId || uid(),
      name: recipeName.trim(),
      carbs: round1((totalsR.carbs * 100) / totalWeight),
      protein: round1((totalsR.protein * 100) / totalWeight),
      fat: round1((totalsR.fat * 100) / totalWeight),
      kcal: round1((totalsR.kcal * 100) / totalWeight),
      carbSpeed: recipeSpeed,
      source: 'recipe',
      isRecipe: true,
      recipeTotalWeight: round1(totalWeight),
      ingredients: validRows.map((row) => ({ foodId: row.food.id, name: row.food.name, grams: row.grams })),
    };
    if (editingRecipeId) setFoods((prev) => prev.map((f) => (f.id === editingRecipeId ? newRecipe : f)));
    else setFoods((prev) => [...prev, newRecipe]);
    setSelectedFoodId(newRecipe.id);
    setEditingRecipeId(null);
    setRecipeName('');
    setRecipeSpeed('medium');
    setRecipeRows([{ id: uid(), foodId: foods[0]?.id || 1, grams: '' }]);
    setRecipeIngredientSearch('');
    setShowRecipeCreator(false);
  }

  function deleteFood(id) {
    setFoods((prev) => prev.filter((f) => f.id !== id));
    setDays((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((date) => { copy[date] = copy[date].filter((e) => e.foodId !== id); });
      return copy;
    });
  }

  function addEntry() {
    const selectedFood = foods.find((f) => f.id === Number(selectedFoodId));
    if (!selectedFood) return;
    let grams = Number(addGrams) || 0;
    const targetCarbs = Number(addCarbs) || 0;
    if (targetCarbs > 0 && selectedFood.carbs > 0) grams = (targetCarbs / selectedFood.carbs) * 100;
    if (grams <= 0) return;
    const entry = {
      id: uid(),
      foodId: selectedFood.id,
      grams: round1(grams),
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      meal: selectedMeal,
      note: addNote.trim() || '',
    };
    setDays((prev) => ({ ...prev, [selectedDate]: [...(prev[selectedDate] || []), entry] }));
    setAddCarbs('');
    setAddNote('');
  }

  function updateEntryGrams(entryId, grams) {
    setDays((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).map((e) => (e.id === entryId ? { ...e, grams: Number(grams) || 0 } : e)),
    }));
  }

  function updateEntryNote(entryId, note) {
    setDays((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).map((e) => (e.id === entryId ? { ...e, note } : e)),
    }));
  }

  function deleteEntry(entryId) {
    setDays((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter((e) => e.id !== entryId),
    }));
  }

  function addInsulin(date, entry) {
    setHealthDays((prev) => ({
      ...prev,
      [date]: { ...prev[date], insulin: [...(prev[date]?.insulin || []), entry] },
    }));
  }

  function deleteInsulin(date, id) {
    setHealthDays((prev) => ({
      ...prev,
      [date]: { ...prev[date], insulin: (prev[date]?.insulin || []).filter((e) => e.id !== id) },
    }));
  }

  function updateInsulinNote(date, id, note) {
    setHealthDays((prev) => ({
      ...prev,
      [date]: { ...prev[date], insulin: (prev[date]?.insulin || []).map((e) => e.id === id ? { ...e, note } : e) },
    }));
  }

  function addGlucose(date, entry) {
    setHealthDays((prev) => ({
      ...prev,
      [date]: { ...prev[date], glucose: [...(prev[date]?.glucose || []), entry] },
    }));
  }

  function deleteGlucose(date, id) {
    setHealthDays((prev) => ({
      ...prev,
      [date]: { ...prev[date], glucose: (prev[date]?.glucose || []).filter((e) => e.id !== id) },
    }));
  }

  function updateGlucoseNote(date, id, note) {
    setHealthDays((prev) => ({
      ...prev,
      [date]: { ...prev[date], glucose: (prev[date]?.glucose || []).map((e) => e.id === id ? { ...e, note } : e) },
    }));
  }

  function updateInsulinEntry(date, id, data) {
    setHealthDays((prev) => ({
      ...prev,
      [date]: { ...prev[date], insulin: (prev[date]?.insulin || []).map((e) => e.id === id ? { ...e, ...data } : e) },
    }));
  }

  function updateGlucoseEntry(date, id, data) {
    setHealthDays((prev) => ({
      ...prev,
      [date]: { ...prev[date], glucose: (prev[date]?.glucose || []).map((e) => e.id === id ? { ...e, ...data } : e) },
    }));
  }

  function changePage(page) {
    setActivePage(page);
    setSearch('');
    setPublicSearch('');
  }

  const swapOptions = useMemo(() => {
    if (!swapEntry) return [];
    const currentFood = foods.find((f) => f.id === swapEntry.foodId);
    const targetCarbs = calcEntry(currentFood, swapEntry.grams).carbs;
    return foods
      .filter((f) => f.id !== swapEntry.foodId && f.carbs > 0)
      .map((f) => {
        const neededGrams = round1((targetCarbs / f.carbs) * 100);
        return { ...f, neededGrams, macros: calcEntry(f, neededGrams) };
      })
      .sort((a, b) => a.neededGrams - b.neededGrams);
  }, [swapEntry, foods]);

  function applySwap(food) {
    if (!swapEntry) return;
    setDays((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).map((e) =>
        e.id === swapEntry.id ? { ...e, foodId: food.id, grams: food.neededGrams } : e
      ),
    }));
    setSwapEntry(null);
  }

  function exportBackup() {
    const data = { foods, days, healthDays, mealTargets, dailyTargets, dailyTargetAuto, macroPercents };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosa-mangio-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function shareBackup() {
    const data = { foods, days, healthDays, mealTargets, dailyTargets, dailyTargetAuto, macroPercents };
    const fileName = `cosa-mangio-backup-${todayKey()}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Cosa mangio — backup',
          text: `Backup dati ${todayKey()}`,
        });
      } catch (err) {
        if (err.name !== 'AbortError') alert('Condivisione non riuscita.');
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      alert('Condivisione non supportata su questo browser.\nFile scaricato come alternativa.');
    }
  }

  function importBackup(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.foods) setFoods(data.foods);
        if (data.days) setDays(data.days);
        if (data.healthDays) setHealthDays(data.healthDays);
        if (data.mealTargets) setMealTargets({ ...defaultMealTargets, ...data.mealTargets });
        if (data.dailyTargets) setDailyTargets({ ...defaultDailyTargets, ...data.dailyTargets });
        if (typeof data.dailyTargetAuto === 'boolean') setDailyTargetAuto(data.dailyTargetAuto);
        if (data.macroPercents) setMacroPercents({ ...defaultMacroPercents, ...data.macroPercents });
        alert('✅ Backup importato con successo!');
      } catch { alert('❌ File non valido.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function mergeBackup(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const theirFoods = data.foods || [];
        const theirDays = data.days || {};
        const theirHealthDays = data.healthDays || {};
        const foodIdMap = {};
        const newFoodsToAdd = [];
        theirFoods.forEach((tf) => {
          const nameLower = tf.name.trim().toLowerCase();
          const existing = foods.find((f) => f.name.trim().toLowerCase() === nameLower);
          if (existing) { foodIdMap[tf.id] = existing.id; }
          else { const newId = uid(); foodIdMap[tf.id] = newId; newFoodsToAdd.push({ ...tf, id: newId }); }
        });
        setFoods((prev) => [...prev, ...newFoodsToAdd]);
        setDays((prevDays) => {
          const merged = { ...prevDays };
          Object.entries(theirDays).forEach(([date, theirEntries]) => {
            const localEntries = merged[date] || [];
            const toAdd = [];
            theirEntries.forEach((te) => {
              const mappedFoodId = foodIdMap[te.foodId];
              if (!mappedFoodId) return;
              const alreadyExists = localEntries.some((le) => le.foodId === mappedFoodId && le.meal === te.meal);
              if (!alreadyExists) toAdd.push({ ...te, id: uid(), foodId: mappedFoodId });
            });
            if (toAdd.length > 0) merged[date] = [...localEntries, ...toAdd];
          });
          return merged;
        });
        setHealthDays((prevH) => {
          const merged = { ...prevH };
          Object.entries(theirHealthDays).forEach(([date, h]) => {
            const loc = merged[date] || { insulin: [], glucose: [] };
            const newInsulin = (h.insulin || []).filter((ti) => !loc.insulin?.some((li) => li.time === ti.time && li.dose === ti.dose));
            const newGlucose = (h.glucose || []).filter((tg) => !loc.glucose?.some((lg) => lg.time === tg.time && lg.value === tg.value));
            if (newInsulin.length > 0 || newGlucose.length > 0) {
              merged[date] = {
                insulin: [...(loc.insulin || []), ...newInsulin.map((e) => ({ ...e, id: uid() }))],
                glucose: [...(loc.glucose || []), ...newGlucose.map((e) => ({ ...e, id: uid() }))],
              };
            }
          });
          return merged;
        });
        alert(`✅ Merge completato!\n+${newFoodsToAdd.length} nuovi alimenti aggiunti.`);
      } catch { alert('❌ File non valido.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const monthLabel = new Date(`${calendarMonth}-01`).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  function recipeCircleStyle(recipe) {
    if (!recipe?.isRecipe || !Array.isArray(recipe.ingredients)) return {};
    const totalRecipeWeight = recipe.recipeTotalWeight || recipe.ingredients.reduce((s, i) => s + (Number(i.grams) || 0), 0) || 1;
    const parts = [];
    recipe.ingredients.forEach((ing) => {
      const grams = Number(ing.grams) || 0;
      const share = Math.max(0, Math.min(100, (grams / totalRecipeWeight) * 100));
      const usage = weeklyIngredientUsage[ing.foodId];
      const color = usage?.level?.color || '#ffffff';
      if (share > 0) parts.push({ share, color });
    });
    let start = 0;
    const segs = parts.map((p) => { const end = start + p.share; const s = `${p.color} ${start}% ${end}%`; start = end; return s; });
    if (start < 100) segs.push(`#ffffff ${start}% 100%`);
    return { background: `conic-gradient(${segs.join(', ')})`, boxShadow: '0 0 0 2px white, 0 0 0 3px #334155' };
  }

  function recipeWarningText(recipe) {
    if (!recipe?.isRecipe || !Array.isArray(recipe.ingredients)) return '';
    const risky = recipe.ingredients.map((ing) => {
      const usage = weeklyIngredientUsage[ing.foodId];
      if (!usage || usage.portions < 4) return null;
      return `${ing.name}: ${usage.portions} porz.`;
    }).filter(Boolean);
    return risky.length ? risky.join(' · ') : '';
  }

  const sharedRecipeProps = { recipeCircleStyle, recipeWarningText, weeklyIngredientUsage };
  const calendarProps = { selectedDate, setSelectedDate, calendarMonth, monthLabel, monthDays, moveMonth, goToday, days };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {activePage === 'home' && (
        <HomePage
          {...calendarProps}
          foods={foods}
          entries={entries}
          mealTargets={mealTargets}
          total={total}
          effectiveDailyTargets={effectiveDailyTargets}
          macroPerc={macroPerc}
          pieData={pieData}
          weeklyIngredientUsage={weeklyIngredientUsage}
          targetInfo={targetInfo}
          updateEntryGrams={updateEntryGrams}
          deleteEntry={deleteEntry}
          updateEntryNote={updateEntryNote}
          setSwapEntry={setSwapEntry}
          setRecipeViewEntry={setRecipeViewEntry}
          setActivePage={changePage}
          {...sharedRecipeProps}
        />
      )}

      {activePage === 'health' && (
        <HealthPage
          {...calendarProps}
          healthDays={healthDays}
          addInsulin={addInsulin}
          updateInsulinEntry={updateInsulinEntry}
          deleteInsulin={deleteInsulin}
          addGlucose={addGlucose}
          updateGlucoseEntry={updateGlucoseEntry}
          deleteGlucose={deleteGlucose}
          updateInsulinNote={updateInsulinNote}
          updateGlucoseNote={updateGlucoseNote}
        />
      )}

      {activePage === 'cibi' && (
        <CibiPage
          foods={foods}
          search={search}
          setSearch={setSearch}
          publicSearch={publicSearch}
          setPublicSearch={setPublicSearch}
          filteredFoods={filteredFoods}
          filteredPublicFoods={filteredPublicFoods}
          foodForm={foodForm}
          setFoodForm={setFoodForm}
          saveFood={saveFood}
          importPublicFood={importPublicFood}
          editFood={editFood}
          deleteFood={deleteFood}
          editingFoodId={editingFoodId}
          setEditingFoodId={setEditingFoodId}
          weeklyIngredientUsage={weeklyIngredientUsage}
          setShowRecipeCreator={setShowRecipeCreator}
          openRecipeEditor={openRecipeEditor}
          {...sharedRecipeProps}
        />
      )}

      {activePage === 'settings' && (
        <SettingsPage
          exportBackup={exportBackup}
          shareBackup={shareBackup}
          importBackup={importBackup}
          mergeBackup={mergeBackup}
          mealTargets={mealTargets}
          setMealTargets={setMealTargets}
          dailyTargets={dailyTargets}
          setDailyTargets={setDailyTargets}
          dailyTargetAuto={dailyTargetAuto}
          setDailyTargetAuto={setDailyTargetAuto}
          macroPercents={macroPercents}
          setMacroPercents={setMacroPercents}
          effectiveDailyTargets={effectiveDailyTargets}
          autoCarbsTarget={autoCarbsTarget}
          autoCaloriesTarget={autoCaloriesTarget}
        />
      )}

      <BottomNav
        activePage={activePage}
        setActivePage={changePage}
        onAdd={() => setShowQuickAdd(true)}
      />

      {showQuickAdd && (
        <QuickAddModal
          foods={foods}
          weeklyIngredientUsage={weeklyIngredientUsage}
          selectedMeal={selectedMeal}
          setSelectedMeal={setSelectedMeal}
          selectedFoodId={selectedFoodId}
          setSelectedFoodId={setSelectedFoodId}
          addGrams={addGrams}
          setAddGrams={setAddGrams}
          addCarbs={addCarbs}
          setAddCarbs={setAddCarbs}
          addNote={addNote}
          setAddNote={setAddNote}
          addEntry={addEntry}
          onClose={() => setShowQuickAdd(false)}
        />
      )}

      {showRecipeCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingRecipeId ? 'Modifica ricetta' : 'Crea ricetta'}</h3>
              <button onClick={() => { setShowRecipeCreator(false); setEditingRecipeId(null); setRecipeIngredientSearch(''); }} className="rounded-xl bg-slate-200 px-3 py-2">Chiudi</button>
            </div>
            <input className="mb-2 w-full rounded-xl border p-3" placeholder="Nome ricetta" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} />
            <select className="mb-3 w-full rounded-xl border p-3" value={recipeSpeed} onChange={(e) => setRecipeSpeed(e.target.value)}>
              {carbSpeedOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>)}
            </select>
            <input
              className="mb-3 w-full rounded-xl border p-3 text-sm"
              placeholder="🔍 Cerca ingrediente per ricetta"
              value={recipeIngredientSearch}
              onChange={(e) => setRecipeIngredientSearch(e.target.value)}
            />
            <div className="space-y-2">
              {recipeRows.map((row) => (
                <div key={row.id} className="grid grid-cols-[1fr_90px_36px] gap-2">
                  <select className="rounded-xl border p-2" value={row.foodId}
                    onChange={(e) => setRecipeRows((prev) => prev.map((r) => r.id === row.id ? { ...r, foodId: Number(e.target.value) } : r))}>
                    {foodGroups.map((group) => {
                      const gf = foods.filter((f) => !f.isRecipe && (f.group || 'other') === group.id)
                        .filter((f) => !recipeIngredientSearch.trim() || f.name.toLowerCase().includes(recipeIngredientSearch.trim().toLowerCase()));
                      if (gf.length === 0) return null;
                      return (
                        <optgroup key={group.id} label={group.label}>
                          {gf.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </optgroup>
                      );
                    })}
                  </select>
                  <input className="rounded-xl border p-2" type="number" placeholder="grammi" value={row.grams}
                    onChange={(e) => setRecipeRows((prev) => prev.map((r) => r.id === row.id ? { ...r, grams: e.target.value } : r))} />
                  <button className="rounded-xl bg-red-100 text-red-700"
                    onClick={() => setRecipeRows((prev) => prev.filter((r) => r.id !== row.id))}>X</button>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full rounded-xl bg-slate-200 p-3 font-semibold"
              onClick={() => setRecipeRows((prev) => [...prev, { id: uid(), foodId: foods.find((f) => !f.isRecipe)?.id || 1, grams: '' }])}>
              + Aggiungi ingrediente
            </button>
            <button className="mt-2 w-full rounded-xl bg-amber-500 p-3 font-semibold text-white" onClick={createRecipe}>
              {editingRecipeId ? 'Salva modifica ricetta' : 'Crea ricetta'}
            </button>
          </div>
        </div>
      )}

      {recipeViewEntry && (() => {
        const food = foods.find((f) => f.id === recipeViewEntry.foodId);
        const scaled = scaleRecipeIngredients(food, recipeViewEntry.grams);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-bold">Ingredienti ricetta</h3>
                <button onClick={() => setRecipeViewEntry(null)} className="rounded-xl bg-slate-200 px-3 py-2">Chiudi</button>
              </div>
              <div className="mb-3 text-sm text-slate-500">Per {recipeViewEntry.grams}g di {food?.name}</div>
              <div className="space-y-2">
                {scaled.map((ing) => (
                  <div key={`${ing.foodId}-${ing.name}`} className="rounded-xl border p-3"><b>{ing.name}</b>: {ing.scaledGrams}g</div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {swapEntry && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-bold">Sostituisci per stessi carboidrati</h3>
              <button onClick={() => setSwapEntry(null)} className="rounded-xl bg-slate-200 px-3 py-2">Chiudi</button>
            </div>
            <div className="space-y-2">
              {swapOptions.map((food) => (
                <button key={food.id} onClick={() => applySwap(food)} className="w-full rounded-2xl border p-3 text-left hover:bg-slate-100">
                  <div className="font-bold">
                    {foodSourceMeta(food).icon} {food.name} → {food.neededGrams}g{' '}
                    <span className={carbSpeedMeta(food.carbSpeed).color}>{carbSpeedMeta(food.carbSpeed).icon}</span>
                  </div>
                  <div className="text-sm text-slate-500">C:{food.macros.carbs}g · P:{food.macros.protein}g · G:{food.macros.fat}g · {food.macros.kcal}kcal</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
