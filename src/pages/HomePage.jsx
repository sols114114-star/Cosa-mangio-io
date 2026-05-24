import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { mealTypes } from '../data/constants';
import { todayKey, calcEntry, round1, carbSpeedMeta } from '../utils/helpers';

export default function HomePage({
  selectedDate, setSelectedDate,
  calendarMonth, monthLabel, monthDays, moveMonth, goToday,
  days, foods, entries, mealTargets,
  total, effectiveDailyTargets, macroPerc, pieData,
  weeklyIngredientUsage, targetInfo,
  updateEntryGrams, deleteEntry, updateEntryNote,
  setSwapEntry, setRecipeViewEntry,
  setActivePage,
}) {
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  function openNote(entry) {
    setEditingNoteId(entry.id);
    setNoteText(entry.note || '');
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="sticky top-0 z-30 bg-white px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">🍝 Cosa mangio</h1>
            <div className="text-sm text-slate-500">
              {selectedDate === todayKey() ? 'Oggi · ' : ''}{selectedDate}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-[36px_1fr_36px] items-center gap-1">
              <button onClick={() => moveMonth(-1)} className="h-9 rounded-xl bg-slate-100 text-slate-600 font-bold">←</button>
              <span className="text-center text-xs font-bold capitalize whitespace-nowrap">{monthLabel}</span>
              <button onClick={() => moveMonth(1)} className="h-9 rounded-xl bg-slate-100 text-slate-600 font-bold">→</button>
            </div>
            <button onClick={goToday} className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-xs text-white font-semibold">Oggi</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-3 p-3">
        <div className="rounded-2xl bg-white p-3 shadow">
          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-slate-400 pb-1">
            {['L','M','M','G','V','S','D'].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {monthDays.map((d, i) => {
              if (!d) return <div key={i} className="h-8 rounded-lg" />;
              const count = (days[d.key] || []).length;
              const active = selectedDate === d.key;
              const isToday = todayKey() === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDate(d.key)}
                  className={`relative h-8 rounded-lg text-xs font-semibold transition-colors ${
                    active ? 'bg-slate-900 text-white'
                    : isToday ? 'border border-blue-500 bg-blue-50 text-blue-700'
                    : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  {d.day}
                  {count > 0 && (
                    <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${active ? 'bg-green-400' : 'bg-green-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { v: total.carbs, u: 'g', label: 'Carbo', color: 'text-green-600' },
            { v: total.protein, u: 'g', label: 'Prot.', color: 'text-blue-600' },
            { v: total.fat, u: 'g', label: 'Grassi', color: 'text-orange-500' },
            { v: total.kcal, u: '', label: 'Kcal', color: 'text-slate-700' },
          ].map(({ v, u, label, color }) => (
            <div key={label} className="rounded-2xl bg-white p-3 text-center shadow">
              <b className={`block text-lg ${color}`}>{v}{u}</b>
              <span className="text-[11px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Obiettivi</h2>
            <button onClick={() => setActivePage('settings')} className="text-xs text-slate-400 underline">modifica ⚙️</button>
          </div>
          <div className="space-y-3">
            {[
              ['Carbo', total.carbs, effectiveDailyTargets.carbs, 'g', '#22c55e'],
              ['Prot.', total.protein, effectiveDailyTargets.protein, 'g', '#3b82f6'],
              ['Grassi', total.fat, effectiveDailyTargets.fat, 'g', '#f97316'],
              ['Kcal', total.kcal, effectiveDailyTargets.kcal, '', '#8b5cf6'],
            ].map(([label, cur, tgt, unit, color]) => {
              const info = targetInfo(cur, tgt);
              const missing = tgt ? round1(tgt - cur) : null;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">{label}</span>
                    <div className="flex items-center gap-2">
                      {missing !== null && (
                        <span className={`text-xs font-bold ${missing < 0 ? 'text-red-600' : 'text-black'}`}>
                          {missing < 0 ? `+${Math.abs(missing)}` : missing}{unit}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {cur}{unit} / {tgt || '—'}{tgt ? unit : ''}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${info.percent}%`, backgroundColor: info.done ? '#22c55e' : color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {pieData.length > 0 && (
          <div className="rounded-2xl bg-white p-4 shadow">
            <h2 className="mb-2 font-bold">Distribuzione macro</h2>
            <div className="flex items-center gap-3">
              <div className="h-[120px] w-[120px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={28} outerRadius={55} paddingAngle={2}>
                      {pieData.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {[
                  ['Carboidrati', macroPerc.carbs, 'bg-green-50 text-green-700'],
                  ['Proteine', macroPerc.protein, 'bg-blue-50 text-blue-700'],
                  ['Grassi', macroPerc.fat, 'bg-orange-50 text-orange-700'],
                ].map(([label, perc, cls]) => (
                  <div key={label} className={`flex items-center justify-between rounded-xl px-3 py-1.5 ${cls}`}>
                    <span className="text-xs font-semibold">{label}</span>
                    <span className="font-bold">{perc}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {foods.filter((f) => !f.isRecipe && (weeklyIngredientUsage[f.id]?.portions || 0) >= 7).length > 0 && (
          <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4 shadow">
            <h2 className="mb-2 font-bold text-orange-800">⚠️ Varietà settimana</h2>
            <div className="space-y-1">
              {foods
                .filter((f) => !f.isRecipe && (weeklyIngredientUsage[f.id]?.portions || 0) >= 7)
                .map((food) => {
                  const usage = weeklyIngredientUsage[food.id];
                  return (
                    <div key={food.id} className={`text-sm ${usage.level.text}`}>
                      Molto usato: <b>{food.name}</b> — {usage.portions} porzioni
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="px-1 font-bold text-slate-700">Pasti del giorno</h2>
          {entries.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              <div className="text-3xl mb-2">🍽️</div>
              Premi ➕ per aggiungere un pasto
            </div>
          )}
          {mealTypes.map((meal) => {
            const mealEntries = entries.filter((e) => (e.meal || 'Colazione') === meal);
            const mealCarbs = round1(mealEntries.reduce((sum, e) => {
              const food = foods.find((f) => f.id === e.foodId);
              return sum + calcEntry(food, e.grams).carbs;
            }, 0));
            const target = Number(mealTargets[meal]) || 0;
            const diff = round1(target - mealCarbs);
            if (mealEntries.length === 0) return null;
            return (
              <div key={meal} className="rounded-2xl bg-white p-4 shadow">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold">{meal}</span>
                  <span className="text-xs text-slate-500">
                    {mealCarbs}g carbo{target > 0 ? ` / ${target}g` : ''}
                    {target > 0 && (
                      <span className={diff >= 0 ? ' text-blue-600' : ' text-orange-600'}>
                        {' '}({diff >= 0 ? `-${diff}` : `+${Math.abs(diff)}`}g)
                      </span>
                    )}
                  </span>
                </div>
                <div className="space-y-2">
                  {mealEntries.map((entry) => {
                    const food = foods.find((f) => f.id === entry.foodId);
                    const m = calcEntry(food, entry.grams);
                    return (
                      <div key={entry.id} className="rounded-xl border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold truncate text-sm">
                              {entry.time} — {food?.name || 'Eliminato'}
                              {food && (
                                <span className={`ml-1 ${carbSpeedMeta(food.carbSpeed).color}`}>
                                  {carbSpeedMeta(food.carbSpeed).icon}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              C:{m.carbs}g · P:{m.protein}g · G:{m.fat}g · {m.kcal}kcal
                            </div>
                            {entry.note && (
                              <div className="mt-0.5 text-xs text-slate-400 italic">📝 {entry.note}</div>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <button
                              onClick={() => openNote(entry)}
                              className="rounded-lg bg-slate-100 px-2 py-1 text-sm"
                              title="Nota"
                            >📝</button>
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              className="rounded-lg bg-red-100 px-2 py-1 text-xs text-red-700"
                            >✕</button>
                          </div>
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
                              >🍲</button>
                            )}
                            <button
                              onClick={() => setSwapEntry(entry)}
                              className="rounded-xl bg-blue-600 px-3 text-sm text-white"
                            >Swap</button>
                          </div>
                        </div>
                        {editingNoteId === entry.id && (
                          <div className="mt-2">
                            <input
                              className="w-full rounded-xl border p-2 text-sm"
                              placeholder="Nota..."
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                            />
                            <div className="mt-1 flex gap-2">
                              <button
                                onClick={() => { updateEntryNote(entry.id, noteText); setEditingNoteId(null); }}
                                className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white"
                              >Salva</button>
                              <button
                                onClick={() => setEditingNoteId(null)}
                                className="rounded-lg bg-slate-200 px-3 py-1 text-xs"
                              >Annulla</button>
                            </div>
                          </div>
                        )}
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
