import { mealTypes } from '../data/constants';

export default function TargetsPage({
  mealTargets,
  setMealTargets,
  dailyTargets,
  setDailyTargets,
  dailyTargetAuto,
  setDailyTargetAuto,
  macroPercents,
  setMacroPercents,
  effectiveDailyTargets,
  autoCarbsTarget,
  autoCaloriesTarget,
}) {
  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="sticky top-0 z-30 bg-white px-4 pt-4 pb-3 shadow-sm">
        <h1 className="text-xl font-bold">🎯 Obiettivi</h1>
        <p className="text-sm text-slate-500">Macro e carboidrati per pasto</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="rounded-2xl bg-white p-4 shadow">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="font-bold">Totale giornaliero</div>
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={dailyTargetAuto}
                onChange={(e) => setDailyTargetAuto(e.target.checked)}
              />
              Automatico
            </label>
          </div>

          <div className="mb-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            <b>Automatico</b>: i carboidrati vengono calcolati dalla somma degli obiettivi dei pasti.
            Proteine, grassi e kcal si calcolano dalle percentuali macro impostate.
          </div>

          {dailyTargetAuto && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              <label className="text-sm font-semibold">
                % Carbo
                <input
                  className="mt-1 w-full rounded-xl border p-2 font-normal"
                  type="number"
                  value={macroPercents.carbs}
                  onChange={(e) => setMacroPercents((prev) => ({ ...prev, carbs: Number(e.target.value) || 0 }))}
                />
              </label>
              <label className="text-sm font-semibold">
                % Proteine
                <input
                  className="mt-1 w-full rounded-xl border p-2 font-normal"
                  type="number"
                  value={macroPercents.protein}
                  onChange={(e) => setMacroPercents((prev) => ({ ...prev, protein: Number(e.target.value) || 0 }))}
                />
              </label>
              <label className="text-sm font-semibold">
                % Grassi
                <input
                  className="mt-1 w-full rounded-xl border p-2 font-normal"
                  type="number"
                  value={macroPercents.fat}
                  onChange={(e) => setMacroPercents((prev) => ({ ...prev, fat: Number(e.target.value) || 0 }))}
                />
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm font-semibold">
              Carboidrati (g)
              <input
                className="mt-1 w-full rounded-xl border p-2 font-normal disabled:bg-slate-100"
                type="number"
                disabled={dailyTargetAuto}
                value={dailyTargetAuto ? effectiveDailyTargets.carbs : (dailyTargets.carbs || '')}
                onChange={(e) => setDailyTargets((prev) => ({ ...prev, carbs: Number(e.target.value) || 0 }))}
              />
            </label>
            <label className="text-sm font-semibold">
              Proteine (g)
              <input
                className="mt-1 w-full rounded-xl border p-2 font-normal disabled:bg-slate-100"
                type="number"
                disabled={dailyTargetAuto}
                value={dailyTargetAuto ? effectiveDailyTargets.protein : (dailyTargets.protein || '')}
                onChange={(e) => setDailyTargets((prev) => ({ ...prev, protein: Number(e.target.value) || 0 }))}
              />
            </label>
            <label className="text-sm font-semibold">
              Grassi (g)
              <input
                className="mt-1 w-full rounded-xl border p-2 font-normal disabled:bg-slate-100"
                type="number"
                disabled={dailyTargetAuto}
                value={dailyTargetAuto ? effectiveDailyTargets.fat : (dailyTargets.fat || '')}
                onChange={(e) => setDailyTargets((prev) => ({ ...prev, fat: Number(e.target.value) || 0 }))}
              />
            </label>
            <label className="text-sm font-semibold">
              Kcal
              <input
                className="mt-1 w-full rounded-xl border p-2 font-normal disabled:bg-slate-100"
                type="number"
                disabled={dailyTargetAuto}
                value={dailyTargetAuto ? effectiveDailyTargets.kcal : (dailyTargets.kcal || '')}
                onChange={(e) => setDailyTargets((prev) => ({ ...prev, kcal: Number(e.target.value) || 0 }))}
              />
            </label>
          </div>

          {dailyTargetAuto && (
            <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
              Calcolato automaticamente: <b>{effectiveDailyTargets.carbs}g</b> carbo ·{' '}
              <b>{effectiveDailyTargets.protein}g</b> prot · <b>{effectiveDailyTargets.fat}g</b> grassi ·{' '}
              <b>{effectiveDailyTargets.kcal}</b> kcal
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <div className="mb-3 font-bold">Carboidrati per pasto</div>
          <div className="space-y-3">
            {mealTypes.map((meal) => (
              <label key={meal} className="block text-sm font-semibold">
                {meal}
                <input
                  className="mt-1 w-full rounded-xl border p-2 font-normal"
                  type="number"
                  placeholder="Carboidrati target (g)"
                  value={mealTargets[meal] || ''}
                  onChange={(e) => setMealTargets((prev) => ({ ...prev, [meal]: Number(e.target.value) || 0 }))}
                />
              </label>
            ))}
          </div>
          {autoCarbsTarget > 0 && (
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              Totale carboidrati dai pasti: <b>{autoCarbsTarget}g</b>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
