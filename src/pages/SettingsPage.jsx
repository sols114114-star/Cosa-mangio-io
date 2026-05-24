import { mealTypes } from '../data/constants';

export default function SettingsPage({
  exportBackup,
  shareBackup,
  importBackup,
  mergeBackup,
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
}) {
  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="sticky top-0 z-30 bg-white px-4 pt-4 pb-3 shadow-sm">
        <h1 className="text-xl font-bold">⚙️ Impostazioni</h1>
        <p className="text-sm text-slate-500">Backup, obiettivi e preferenze</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-3 font-bold">💾 Backup dati</h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={exportBackup}
              className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200"
            >
              <span className="text-xl">💾</span>
              <div className="text-left">
                <div className="text-sm font-bold">Esporta backup JSON</div>
                <div className="text-xs text-slate-500">Scarica tutti i tuoi dati</div>
              </div>
            </button>
            <button
              onClick={shareBackup}
              className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 font-semibold text-green-800 hover:bg-green-100"
            >
              <span className="text-xl">📤</span>
              <div className="text-left">
                <div className="text-sm font-bold">Condividi backup</div>
                <div className="text-xs text-green-600">WhatsApp, Telegram, email…</div>
              </div>
            </button>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200">
              <span className="text-xl">📂</span>
              <div className="text-left">
                <div className="text-sm font-bold">Importa backup</div>
                <div className="text-xs text-red-500">⚠️ Sovrascrive tutti i dati attuali</div>
              </div>
              <input type="file" accept=".json" className="hidden" onChange={importBackup} />
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-700 hover:bg-blue-100">
              <span className="text-xl">🔀</span>
              <div className="text-left">
                <div className="text-sm font-bold">Merge (unisci backup)</div>
                <div className="text-xs text-blue-500">Non sovrascrive, aggiunge i dati mancanti</div>
              </div>
              <input type="file" accept=".json" className="hidden" onChange={mergeBackup} />
            </label>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-bold">🎯 Obiettivo giornaliero</h2>
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input type="checkbox" checked={dailyTargetAuto} onChange={(e) => setDailyTargetAuto(e.target.checked)} />
              Auto
            </label>
          </div>
          <div className="mb-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            <b>Automatico</b>: carboidrati = somma obiettivi pasti. Proteine/grassi/kcal calcolati dalle % macro.
          </div>
          {dailyTargetAuto && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              <label className="text-sm font-semibold">% Carbo
                <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number"
                  value={macroPercents.carbs}
                  onChange={(e) => setMacroPercents((p) => ({ ...p, carbs: Number(e.target.value) || 0 }))} />
              </label>
              <label className="text-sm font-semibold">% Prot.
                <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number"
                  value={macroPercents.protein}
                  onChange={(e) => setMacroPercents((p) => ({ ...p, protein: Number(e.target.value) || 0 }))} />
              </label>
              <label className="text-sm font-semibold">% Grassi
                <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number"
                  value={macroPercents.fat}
                  onChange={(e) => setMacroPercents((p) => ({ ...p, fat: Number(e.target.value) || 0 }))} />
              </label>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Carboidrati (g)', 'carbs'],
              ['Proteine (g)', 'protein'],
              ['Grassi (g)', 'fat'],
              ['Kcal', 'kcal'],
            ].map(([label, key]) => (
              <label key={key} className="text-sm font-semibold">
                {label}
                <input
                  className="mt-1 w-full rounded-xl border p-2 font-normal disabled:bg-slate-100"
                  type="number"
                  disabled={dailyTargetAuto}
                  value={dailyTargetAuto ? effectiveDailyTargets[key] : (dailyTargets[key] || '')}
                  onChange={(e) => setDailyTargets((p) => ({ ...p, [key]: Number(e.target.value) || 0 }))}
                />
              </label>
            ))}
          </div>
          {dailyTargetAuto && effectiveDailyTargets.kcal > 0 && (
            <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
              Calcolato: <b>{effectiveDailyTargets.carbs}g</b> carbo · <b>{effectiveDailyTargets.protein}g</b> prot · <b>{effectiveDailyTargets.fat}g</b> grassi · <b>{effectiveDailyTargets.kcal}</b> kcal
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-3 font-bold">🍽️ Carboidrati per pasto</h2>
          <div className="space-y-3">
            {mealTypes.map((meal) => (
              <label key={meal} className="block text-sm font-semibold">
                {meal}
                <input
                  className="mt-1 w-full rounded-xl border p-2 font-normal"
                  type="number"
                  placeholder="Carboidrati target (g)"
                  value={mealTargets[meal] || ''}
                  onChange={(e) => setMealTargets((p) => ({ ...p, [meal]: Number(e.target.value) || 0 }))}
                />
              </label>
            ))}
          </div>
          {autoCarbsTarget > 0 && (
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              Totale dai pasti: <b>{autoCarbsTarget}g</b> carboidrati
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
