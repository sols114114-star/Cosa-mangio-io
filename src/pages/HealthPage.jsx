import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine,
} from 'recharts';
import { mealTypes } from '../data/constants';
import { todayKey, uid, round1 } from '../utils/helpers';

function timeToHour(time) {
  if (!time) return null;
  const parts = time.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1] || 0);
  if (isNaN(h)) return null;
  return h + m / 60;
}

function glucoseTimeStats(points) {
  if (!points || points.length < 2) return { low: 0, ok: 0, high: 0 };
  const sorted = [...points].sort((a, b) => a.hour - b.hour);
  const stats = { low: 0, ok: 0, high: 0 };
  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const next = sorted[i + 1];
    const hours = next.hour - cur.hour;
    if (hours <= 0) continue;
    const avg = (cur.value + next.value) / 2;
    if (avg < 70) stats.low += hours;
    else if (avg > 180) stats.high += hours;
    else stats.ok += hours;
  }
  return { low: round1(stats.low), ok: round1(stats.ok), high: round1(stats.high) };
}

export default function HealthPage({
  selectedDate,
  setSelectedDate,
  calendarMonth,
  monthLabel,
  monthDays,
  moveMonth,
  goToday,
  days,
  healthDays,
  addInsulin,
  updateInsulinEntry,
  deleteInsulin,
  addGlucose,
  updateGlucoseEntry,
  deleteGlucose,
  updateInsulinNote,
  updateGlucoseNote,
}) {
  const insulin = healthDays[selectedDate]?.insulin || [];
  const glucose = healthDays[selectedDate]?.glucose || [];

  const glucoseChartData = glucose
    .map((g) => ({ hour: timeToHour(g.time), value: Number(g.value), time: g.time }))
    .filter((g) => g.hour !== null)
    .sort((a, b) => a.hour - b.hour);

  const glucoseStats = glucoseTimeStats(glucoseChartData);

  const [insulinForm, setInsulinForm] = useState({ time: '', meal: 'Pranzo', dose: '', note: '' });
  const [glucoseForm, setGlucoseForm] = useState({ time: '', value: '', note: '' });
  const [editingInsulinId, setEditingInsulinId] = useState(null);
  const [editingGlucoseId, setEditingGlucoseId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  function now24() {
    return new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  function handleAddInsulin() {
    if (!insulinForm.dose) return;
    if (editingInsulinId) {
      updateInsulinEntry(selectedDate, editingInsulinId, {
        time: insulinForm.time || now24(),
        meal: insulinForm.meal,
        dose: Number(insulinForm.dose),
        note: insulinForm.note,
      });
      setEditingInsulinId(null);
    } else {
      addInsulin(selectedDate, {
        id: uid(),
        time: insulinForm.time || now24(),
        meal: insulinForm.meal,
        dose: Number(insulinForm.dose),
        note: insulinForm.note,
      });
    }
    setInsulinForm({ time: '', meal: 'Pranzo', dose: '', note: '' });
  }

  function handleAddGlucose() {
    if (!glucoseForm.value) return;
    if (editingGlucoseId) {
      updateGlucoseEntry(selectedDate, editingGlucoseId, {
        time: glucoseForm.time || now24(),
        value: Number(glucoseForm.value),
        note: glucoseForm.note,
      });
      setEditingGlucoseId(null);
    } else {
      addGlucose(selectedDate, {
        id: uid(),
        time: glucoseForm.time || now24(),
        value: Number(glucoseForm.value),
        note: glucoseForm.note,
      });
    }
    setGlucoseForm({ time: '', value: '', note: '' });
  }

  function startEditInsulin(entry) {
    setEditingInsulinId(entry.id);
    setInsulinForm({ time: entry.time, meal: entry.meal, dose: entry.dose, note: entry.note || '' });
    setEditingNoteId(null);
  }

  function startEditGlucose(entry) {
    setEditingGlucoseId(entry.id);
    setGlucoseForm({ time: entry.time, value: entry.value, note: entry.note || '' });
    setEditingNoteId(null);
  }

  function openNote(id, currentNote) {
    setEditingNoteId(id);
    setNoteText(currentNote || '');
  }

  function glucoseColor(v) {
    if (v < 70) return 'text-blue-600 bg-blue-50';
    if (v <= 140) return 'text-green-700 bg-green-50';
    if (v <= 180) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="bg-white px-4 pt-4 pb-3 shadow-sm">
        <h1 className="mb-3 text-xl font-bold">📅💉 Diario salute</h1>
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-[40px_1fr_40px] items-center gap-1 flex-1">
            <button onClick={() => moveMonth(-1)} className="h-10 rounded-xl bg-slate-100 font-bold text-slate-600">←</button>
            <h2 className="text-center text-base font-bold capitalize">{monthLabel}</h2>
            <button onClick={() => moveMonth(1)} className="h-10 rounded-xl bg-slate-100 font-bold text-slate-600">→</button>
          </div>
          <button onClick={goToday} className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-sm text-white">Oggi</button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-3">
        <div className="rounded-2xl bg-white p-3 shadow">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-1">
            {['L','M','M','G','V','S','D'].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((d, i) => {
              if (!d) return <div key={i} className="h-10 rounded-xl" />;
              const h = healthDays[d.key];
              const hasData = h && ((h.insulin?.length || 0) > 0 || (h.glucose?.length || 0) > 0);
              const active = selectedDate === d.key;
              const isToday = todayKey() === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDate(d.key)}
                  className={`relative h-10 rounded-xl text-sm font-semibold transition-colors ${
                    active ? 'bg-slate-900 text-white'
                    : isToday ? 'border-2 border-blue-500 bg-blue-50 text-blue-700'
                    : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  {d.day}
                  {hasData && (
                    <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${active ? 'bg-white' : 'bg-purple-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-3 font-bold text-purple-800">💉 Insulina — {selectedDate}</h2>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Ora (HH:MM)</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                className="w-full rounded-xl border p-2 text-sm"
                placeholder="es. 12:30"
                value={insulinForm.time}
                onChange={(e) => setInsulinForm({ ...insulinForm, time: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Dose (unità)</label>
              <input
                type="number"
                step="0.5"
                className="w-full rounded-xl border p-2 text-sm"
                placeholder="es. 4.5"
                value={insulinForm.dose}
                onChange={(e) => setInsulinForm({ ...insulinForm, dose: e.target.value })}
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="mb-1 block text-xs font-semibold text-slate-500">Pasto collegato</label>
            <select
              className="w-full rounded-xl border p-2 text-sm"
              value={insulinForm.meal}
              onChange={(e) => setInsulinForm({ ...insulinForm, meal: e.target.value })}
            >
              {mealTypes.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <input
            className="mb-2 w-full rounded-xl border p-2 text-sm"
            placeholder="📝 Nota (opzionale)"
            value={insulinForm.note}
            onChange={(e) => setInsulinForm({ ...insulinForm, note: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddInsulin}
              className={`flex-1 rounded-xl p-2 font-semibold text-white ${editingInsulinId ? 'bg-amber-500' : 'bg-purple-600'}`}
            >
              {editingInsulinId ? '💾 Salva modifica' : '+ Aggiungi insulina'}
            </button>
            {editingInsulinId && (
              <button
                onClick={() => { setEditingInsulinId(null); setInsulinForm({ time: '', meal: 'Pranzo', dose: '', note: '' }); }}
                className="rounded-xl bg-slate-200 px-4 font-semibold"
              >✕</button>
            )}
          </div>

          <div className="mt-3 space-y-2">
            {insulin.length === 0 && (
              <div className="py-3 text-center text-sm text-slate-400">Nessuna insulina registrata</div>
            )}
            {insulin.map((entry) => (
              <div key={entry.id} className={`rounded-xl border p-3 ${editingInsulinId === entry.id ? 'border-amber-400 bg-amber-50' : 'bg-purple-50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-purple-800">{entry.dose} U</span>
                    <span className="ml-2 text-sm text-slate-600">{entry.time} · {entry.meal}</span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => startEditInsulin(entry)}
                      className="rounded-lg bg-white px-2 py-1 text-sm border"
                    >✏️</button>
                    <button
                      onClick={() => openNote(entry.id, entry.note)}
                      className="rounded-lg bg-white px-2 py-1 text-sm border"
                    >📝</button>
                    <button
                      onClick={() => deleteInsulin(selectedDate, entry.id)}
                      className="rounded-lg bg-red-100 px-2 py-1 text-sm text-red-700"
                    >✕</button>
                  </div>
                </div>
                {entry.note && <div className="mt-1 text-xs text-slate-500 italic">{entry.note}</div>}
                {editingNoteId === entry.id && (
                  <div className="mt-2">
                    <input
                      className="w-full rounded-xl border p-2 text-sm"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Scrivi una nota..."
                    />
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => { updateInsulinNote(selectedDate, entry.id, noteText); setEditingNoteId(null); }}
                        className="rounded-lg bg-purple-600 px-3 py-1 text-xs text-white"
                      >Salva</button>
                      <button onClick={() => setEditingNoteId(null)} className="rounded-lg bg-slate-200 px-3 py-1 text-xs">Annulla</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-3 font-bold text-rose-800">🩸 Glicemia — {selectedDate}</h2>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Ora (HH:MM)</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                className="w-full rounded-xl border p-2 text-sm"
                placeholder="es. 14:30"
                value={glucoseForm.time}
                onChange={(e) => setGlucoseForm({ ...glucoseForm, time: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Valore (mg/dL)</label>
              <input
                type="number"
                className="w-full rounded-xl border p-2 text-sm"
                placeholder="es. 120"
                value={glucoseForm.value}
                onChange={(e) => setGlucoseForm({ ...glucoseForm, value: e.target.value })}
              />
            </div>
          </div>
          <input
            className="mb-2 w-full rounded-xl border p-2 text-sm"
            placeholder="📝 Nota (opzionale)"
            value={glucoseForm.note}
            onChange={(e) => setGlucoseForm({ ...glucoseForm, note: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddGlucose}
              className={`flex-1 rounded-xl p-2 font-semibold text-white ${editingGlucoseId ? 'bg-amber-500' : 'bg-rose-600'}`}
            >
              {editingGlucoseId ? '💾 Salva modifica' : '+ Aggiungi glicemia'}
            </button>
            {editingGlucoseId && (
              <button
                onClick={() => { setEditingGlucoseId(null); setGlucoseForm({ time: '', value: '', note: '' }); }}
                className="rounded-xl bg-slate-200 px-4 font-semibold"
              >✕</button>
            )}
          </div>

          <div className="mt-3 space-y-2">
            {glucose.length === 0 && (
              <div className="py-3 text-center text-sm text-slate-400">Nessuna glicemia registrata</div>
            )}
            {glucose.map((entry) => (
              <div key={entry.id} className={`rounded-xl border p-3 ${editingGlucoseId === entry.id ? 'border-amber-400 bg-amber-50' : 'bg-rose-50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className={`shrink-0 rounded-lg px-2 py-1 text-sm font-bold ${glucoseColor(entry.value)}`}>
                      {entry.value} mg/dL
                    </span>
                    <span className="truncate text-sm text-slate-600">{entry.time}</span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => startEditGlucose(entry)}
                      className="rounded-lg bg-white px-2 py-1 text-sm border"
                    >✏️</button>
                    <button
                      onClick={() => openNote(entry.id, entry.note)}
                      className="rounded-lg bg-white px-2 py-1 text-sm border"
                    >📝</button>
                    <button
                      onClick={() => deleteGlucose(selectedDate, entry.id)}
                      className="rounded-lg bg-red-100 px-2 py-1 text-sm text-red-700"
                    >✕</button>
                  </div>
                </div>
                {entry.note && <div className="mt-1 text-xs text-slate-500 italic">{entry.note}</div>}
                {editingNoteId === entry.id && (
                  <div className="mt-2">
                    <input
                      className="w-full rounded-xl border p-2 text-sm"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Scrivi una nota..."
                    />
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => { updateGlucoseNote(selectedDate, entry.id, noteText); setEditingNoteId(null); }}
                        className="rounded-lg bg-rose-600 px-3 py-1 text-xs text-white"
                      >Salva</button>
                      <button onClick={() => setEditingNoteId(null)} className="rounded-lg bg-slate-200 px-3 py-1 text-xs">Annulla</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-3 font-bold text-slate-800">📈 Andamento glicemia 24h — {selectedDate}</h2>

          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white border p-3 text-center">
              <div className="text-xl font-bold text-slate-800">{glucoseStats.ok}h</div>
              <div className="text-xs text-slate-500 mt-0.5">✅ Buona</div>
            </div>
            <div className="rounded-xl bg-blue-100 p-3 text-center">
              <div className="text-xl font-bold text-blue-800">{glucoseStats.low}h</div>
              <div className="text-xs text-blue-700 mt-0.5">⬇️ IPO &lt;70</div>
            </div>
            <div className="rounded-xl bg-red-100 p-3 text-center">
              <div className="text-xl font-bold text-red-800">{glucoseStats.high}h</div>
              <div className="text-xs text-red-700 mt-0.5">⬆️ IPER &gt;180</div>
            </div>
          </div>

          {glucoseChartData.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Inserisci misurazioni glicemia per vedere il grafico
            </div>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={glucoseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="hour"
                    type="number"
                    domain={[0, 24]}
                    ticks={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
                    tickFormatter={(v) => `${v}:00`}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis domain={[40, 300]} tick={{ fontSize: 10 }} />

                  <ReferenceArea y1={40} y2={70} fill="#bfdbfe" fillOpacity={0.45} />
                  <ReferenceArea y1={180} y2={300} fill="#fecaca" fillOpacity={0.45} />

                  <ReferenceLine y={70} stroke="#3b82f6" strokeDasharray="3 3" strokeWidth={1.5} />
                  <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} />

                  {insulin.map((i) => {
                    const x = timeToHour(i.time);
                    if (x === null) return null;
                    return (
                      <ReferenceLine
                        key={i.id}
                        x={x}
                        stroke="#475569"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{
                          value: `${i.dose}u`,
                          position: 'insideBottomLeft',
                          fill: '#334155',
                          fontSize: 10,
                        }}
                      />
                    );
                  })}

                  <Tooltip
                    formatter={(value) => [`${value} mg/dL`, 'Glicemia']}
                    labelFormatter={(value) => {
                      const h = Math.floor(value);
                      const m = String(Math.round((value % 1) * 60)).padStart(2, '0');
                      return `Ore ${h}:${m}`;
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#111827"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: '#111827' }}
                    activeDot={{ r: 7 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <span><span className="inline-block w-3 h-0.5 bg-blue-400 mr-1 align-middle" style={{borderTop:'2px dashed #3b82f6'}} />70</span>
            <span><span className="inline-block w-3 h-0.5 bg-red-400 mr-1 align-middle" style={{borderTop:'2px dashed #ef4444'}} />180</span>
            <span><span className="inline-block w-3 h-0.5 bg-slate-500 mr-1 align-middle" style={{borderTop:'2px dashed #475569'}} />insulina</span>
          </div>
        </div>

      </div>
    </div>
  );
}
