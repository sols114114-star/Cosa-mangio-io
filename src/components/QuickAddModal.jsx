import { useState } from 'react';
import { mealTypes, foodGroups } from '../data/constants';
import { carbSpeedMeta } from '../utils/helpers';

function FoodGroupPicker({ foods, selectedFoodId, onSelect, weeklyIngredientUsage }) {
  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState({});
  const q = search.trim().toLowerCase();
  const isSearching = q.length > 0;

  function toggle(id) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const recipeGroup = { id: '_recipes', label: '🍲 Ricette' };
  const allGroups = [recipeGroup, ...foodGroups];

  return (
    <div>
      <input
        className="mb-2 w-full rounded-xl border p-3 text-base"
        placeholder="🔍 Cerca cibo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="max-h-[260px] overflow-y-auto space-y-1">
        {allGroups.map((group) => {
          const groupFoods = group.id === '_recipes'
            ? foods.filter((f) => f.isRecipe && (!isSearching || f.name.toLowerCase().includes(q)))
            : foods.filter((f) => !f.isRecipe && (f.group || 'other') === group.id && (!isSearching || f.name.toLowerCase().includes(q)));
          if (groupFoods.length === 0) return null;
          const isOpen = isSearching ? true : !!openGroups[group.id];
          return (
            <div key={group.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold"
                onClick={() => toggle(group.id)}
              >
                <span>{group.label}</span>
                <span className="text-slate-400 text-xs">{groupFoods.length} {isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="mt-0.5 space-y-0.5 pl-1">
                  {groupFoods.map((f) => {
                    const usage = weeklyIngredientUsage?.[f.id];
                    const isSelected = selectedFoodId === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => onSelect(f.id)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          isSelected ? 'bg-slate-900 text-white font-semibold' : 'bg-white hover:bg-slate-50 border'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>
                            {f.name}
                            <span className={`ml-1 text-xs ${isSelected ? 'text-slate-300' : carbSpeedMeta(f.carbSpeed).color}`}>
                              {carbSpeedMeta(f.carbSpeed).icon}
                            </span>
                          </span>
                          {usage && usage.grams > 0 && (
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isSelected ? 'bg-slate-700 text-slate-200' : `${usage.level.bg} ${usage.level.text}`}`}>
                              {usage.grams}g
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function QuickAddModal({
  foods, weeklyIngredientUsage,
  selectedMeal, setSelectedMeal,
  selectedFoodId, setSelectedFoodId,
  addGrams, setAddGrams, addCarbs, setAddCarbs,
  addNote, setAddNote,
  addEntry, onClose,
}) {
  const selectedFood = foods.find((f) => f.id === Number(selectedFoodId));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">➕ Aggiungi pasto</h2>
          <button onClick={onClose} className="rounded-xl bg-slate-100 px-3 py-2 text-slate-600">✕ Chiudi</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">Pasto</label>
            <select
              className="w-full rounded-xl border bg-slate-50 p-3 font-semibold"
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
            >
              {mealTypes.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">Cibo selezionato</label>
            {selectedFood ? (
              <div className="rounded-xl border bg-slate-50 px-3 py-2 text-sm">
                <span className="font-semibold">{selectedFood.name}</span>
                <span className={`ml-2 ${carbSpeedMeta(selectedFood.carbSpeed).color}`}>{carbSpeedMeta(selectedFood.carbSpeed).icon}</span>
                <span className="ml-2 text-slate-500">C:{selectedFood.carbs}g · P:{selectedFood.protein}g · G:{selectedFood.fat}g</span>
              </div>
            ) : (
              <div className="rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-400">Scegli un cibo qui sotto</div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">Scegli cibo</label>
            <FoodGroupPicker
              foods={foods}
              selectedFoodId={Number(selectedFoodId)}
              onSelect={(id) => setSelectedFoodId(id)}
              weeklyIngredientUsage={weeklyIngredientUsage}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-600">Grammi</label>
              <input
                className="w-full rounded-xl border p-3 text-lg"
                type="number"
                placeholder="100"
                value={addGrams}
                onChange={(e) => setAddGrams(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-600">Oppure carbo (g)</label>
              <input
                className="w-full rounded-xl border p-3 text-lg"
                type="number"
                placeholder="es. 60"
                value={addCarbs}
                onChange={(e) => setAddCarbs(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">📝 Nota (opzionale)</label>
            <input
              className="w-full rounded-xl border p-3"
              placeholder="es. pasto pre-allenamento..."
              value={addNote}
              onChange={(e) => setAddNote(e.target.value)}
            />
          </div>

          <button
            onClick={() => { addEntry(); onClose(); }}
            disabled={!selectedFood}
            className="w-full rounded-xl bg-green-600 p-4 text-lg font-bold text-white active:bg-green-700 disabled:bg-slate-300"
          >
            ✅ Aggiungi
          </button>
        </div>
      </div>
    </div>
  );
}
