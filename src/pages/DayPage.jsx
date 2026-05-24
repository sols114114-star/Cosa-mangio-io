import { mealTypes } from '../data/constants';
import { todayKey, dateKeyLocal, calcEntry, round1, carbSpeedMeta, foodSourceMeta } from '../utils/helpers';

export default function DayPage({
  selectedDate,
  setSelectedDate,
  calendarMonth,
  moveMonth,
  goToday,
  monthDays,
  monthLabel,
  days,
  selectedMeal,
  setSelectedMeal,
  foods,
  entries,
  mealTargets,
  weeklyIngredientUsage,
  selectedFoodId,
  setSelectedFoodId,
  addGrams,
  setAddGrams,
  addCarbs,
  setAddCarbs,
  addEntry,
  updateEntryGrams,
  deleteEntry,
  setSwapEntry,
  setRecipeViewEntry,
  recipeCircleStyle,
  recipeWarningText,
}) {
  const selectedFood = foods.find((f) => f.id === Number(selectedFoodId));

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="sticky top-0 z-30 bg-white px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="grid grid-cols-[40px_1fr_40px] items-center gap-1 flex-1">
            <button
              onClick={() => moveMonth(-1)}
              className="h-10 rounded-xl bg-slate-100 font-bold text-slate-600"
            >
              ←
            </button>
            <h2 className="text-center text-base font-bold capitalize">{monthLabel}</h2>
            <button
              onClick={() => moveMonth(1)}
              className="h-10 rounded-xl bg-slate-100 font-bold text-slate-600"
            >
              →
            </button>
          </div>
          <button
            onClick={goToday}
            className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Oggi
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl p-3 space-y-4">
        <div className="rounded-2xl bg-white p-3 shadow">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-1">
            {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((d, i) => {
              if (!d) return <div key={i} className="h-10 rounded-xl" />;
              const count = (days[d.key] || []).length;
              const active = selectedDate === d.key;
              const isToday = todayKey() === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDate(d.key)}
                  className={`relative h-10 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-slate-900 text-white'
                      : isToday
                      ? 'border-2 border-blue-500 bg-blue-50 text-blue-700'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  {d.day}
                  {count > 0 && (
                    <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${active ? 'bg-white' : 'bg-green-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <div className="mb-2 text-sm font-semibold text-slate-500">
            {selectedDate === todayKey() ? '📅 Oggi' : `📅 ${selectedDate}`}
          </div>
          <select
            className="mb-2 w-full rounded-xl border bg-slate-50 p-3 font-semibold"
            value={selectedMeal}
            onChange={(e) => setSelectedMeal(e.target.value)}
          >
            {mealTypes.map((meal) => <option key={meal} value={meal}>{meal}</option>)}
          </select>

          <select
            className="w-full rounded-xl border bg-slate-50 p-3"
            value={selectedFoodId}
            onChange={(e) => setSelectedFoodId(e.target.value)}
          >
            {foods.map((f) => {
              const usage = weeklyIngredientUsage[f.id];
              const portions = usage?.portions || 0;
              const mark = portions >= 10 ? '🔴' : portions >= 7 ? '🟠' : portions >= 4 ? '🟢' : '⚪';
              return (
                <option key={f.id} value={f.id}>
                  {mark} {foodSourceMeta(f).icon} {carbSpeedMeta(f.carbSpeed).icon} {f.name}
                  {portions > 0 ? ` (${portions} porz.)` : ''}{f.isRecipe ? ' 🍲' : ''}
                </option>
              );
            })}
          </select>

          {selectedFood?.isRecipe && (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-amber-50 p-2 text-sm">
              <span
                className="inline-block h-6 w-6 shrink-0 rounded-full border-2 border-slate-700"
                style={recipeCircleStyle(selectedFood)}
              />
              <span className="text-amber-800 text-xs">
                Stato ricetta questa settimana
                {recipeWarningText(selectedFood) && (
                  <span className="block text-orange-700">{recipeWarningText(selectedFood)}</span>
                )}
              </span>
            </div>
          )}

          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              className="rounded-xl border p-2"
              type="number"
              placeholder="Grammi"
              value={addGrams}
              onChange={(e) => setAddGrams(e.target.value)}
            />
            <input
              className="rounded-xl border p-2"
              type="number"
              placeholder="Carbo target (g)"
              value={addCarbs}
              onChange={(e) => setAddCarbs(e.target.value)}
            />
          </div>
          <button
            onClick={addEntry}
            className="mt-2 w-full rounded-xl bg-green-600 p-3 font-semibold text-white active:bg-green-700"
          >
            ✅ Aggiungi alla giornata
          </button>
        </div>

        <div className="space-y-3">
          {entries.length === 0 && (
            <div className="py-10 text-center text-slate-400">
              <div className="text-4xl mb-2">🍽️</div>
              Nessun pasto registrato
            </div>
          )}
          {mealTypes.map((meal) => {
            const mealEntries = entries.filter((e) => (e.meal || 'Colazione') === meal);
            const mealCarbs = round1(
              mealEntries.reduce(
                (sum, e) => sum + calcEntry(foods.find((f) => f.id === e.foodId), e.grams).carbs,
                0
              )
            );
            const target = Number(mealTargets[meal]) || 0;
            const diff = round1(target - mealCarbs);
            if (mealEntries.length === 0 && selectedMeal !== meal) return null;
            return (
              <div
                key={meal}
                className={`rounded-2xl border p-4 ${
                  selectedMeal === meal ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white shadow'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="font-bold">{meal}</div>
                  <div className="text-xs text-slate-500">
                    {mealCarbs}g carbo{target > 0 ? ` / ${target}g` : ''}
                    {target > 0 && (
                      <span className={diff >= 0 ? ' text-blue-600' : ' text-orange-600'}>
                        {' '}({diff >= 0 ? `-${diff}g` : `+${Math.abs(diff)}g`})
                      </span>
                    )}
                  </div>
                </div>
                {mealEntries.length === 0 && (
                  <div className="text-sm text-slate-400">Seleziona un cibo e premi ✅</div>
                )}
                <div className="space-y-2">
                  {mealEntries.map((entry) => {
                    const food = foods.find((f) => f.id === entry.foodId);
                    const m = calcEntry(food, entry.grams);
                    return (
                      <div key={entry.id} className="rounded-xl border bg-white p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold truncate">
                              {entry.time} — {food?.name || 'Eliminato'}
                              {food && (
                                <span className={`ml-1 ${carbSpeedMeta(food.carbSpeed).color}`}>
                                  {carbSpeedMeta(food.carbSpeed).icon}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              C:{m.carbs}g · P:{m.protein}g · G:{m.fat}g · {m.kcal}kcal
                            </div>
                          </div>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="shrink-0 rounded-lg bg-red-100 px-2 py-1 text-xs text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                          <input
                            className="rounded-xl border p-2 text-sm"
                            type="number"
                            value={entry.grams}
                            onChange={(e) => updateEntryGrams(entry.id, e.target.value)}
                          />
                          <div className="flex gap-1">
                            {food?.isRecipe && (
                              <button
                                onClick={() => setRecipeViewEntry(entry)}
                                className="rounded-xl bg-amber-500 px-3 text-sm text-white"
                              >
                                🍲
                              </button>
                            )}
                            <button
                              onClick={() => setSwapEntry(entry)}
                              className="rounded-xl bg-blue-600 px-3 text-sm text-white"
                            >
                              Swap
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
