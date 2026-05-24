import { useState, useRef } from 'react';
import { carbSpeedOptions, foodGroups } from '../data/constants';
import { carbSpeedMeta, foodSourceMeta } from '../utils/helpers';

function GroupedFoodPicker({ foods, selectedFoodId, onSelect }) {
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
        className="mb-2 w-full rounded-xl border p-2 text-sm"
        placeholder="🔍 Cerca ingrediente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="max-h-[300px] overflow-y-auto space-y-1">
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
                <span className="text-slate-400">{groupFoods.length} {isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="mt-0.5 space-y-0.5 pl-1">
                  {groupFoods.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onSelect(f.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedFoodId === f.id ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50 border'
                      }`}
                    >
                      {f.name}
                      <span className={`ml-1 text-xs ${selectedFoodId === f.id ? 'text-slate-300' : carbSpeedMeta(f.carbSpeed).color}`}>
                        {carbSpeedMeta(f.carbSpeed).icon}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IngredientiTab({
  foods, search, setSearch, publicSearch, setPublicSearch,
  filteredFoods, filteredPublicFoods, foodForm, setFoodForm,
  saveFood, importPublicFood, editFood, deleteFood,
  editingFoodId, setEditingFoodId, weeklyIngredientUsage,
}) {
  const [openGroups, setOpenGroups] = useState({});
  const foodFormRef = useRef(null);
  const nonRecipeFoods = foods.filter((f) => !f.isRecipe);
  const q = search.trim().toLowerCase();
  const isSearching = q.length > 0;

  function toggleGroup(id) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleEditFood(food) {
    editFood(food);
    setTimeout(() => {
      foodFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  return (
    <div className="space-y-4">
      <div ref={foodFormRef} className="rounded-2xl bg-white p-4 shadow">
        <h3 className="mb-3 font-bold text-slate-700">{editingFoodId ? '✏️ Modifica alimento' : '+ Nuovo alimento'}</h3>
        <div className="grid grid-cols-2 gap-2">
          <input className="col-span-2 rounded-xl border p-2" placeholder="Nome alimento"
            value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} />
          <label className="text-sm font-semibold">Carboidrati /100g
            <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number"
              value={foodForm.carbs} onChange={(e) => setFoodForm({ ...foodForm, carbs: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Proteine /100g
            <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number"
              value={foodForm.protein} onChange={(e) => setFoodForm({ ...foodForm, protein: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Grassi /100g
            <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number"
              value={foodForm.fat} onChange={(e) => setFoodForm({ ...foodForm, fat: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Kcal /100g
            <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number"
              value={foodForm.kcal} onChange={(e) => setFoodForm({ ...foodForm, kcal: e.target.value })} />
          </label>
          <label className="col-span-2 text-sm font-semibold">Porzione normale (g)
            <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number"
              placeholder="es. pasta 80g, pane 50g" value={foodForm.portionSize}
              onChange={(e) => setFoodForm({ ...foodForm, portionSize: e.target.value })} />
          </label>
          <label className="col-span-2 text-sm font-semibold">Tipo carboidrati
            <select className="mt-1 w-full rounded-xl border p-2 font-normal"
              value={foodForm.carbSpeed} onChange={(e) => setFoodForm({ ...foodForm, carbSpeed: e.target.value })}>
              {carbSpeedOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
              ))}
            </select>
          </label>
          <label className="col-span-2 text-sm font-semibold">Gruppo
            <select className="mt-1 w-full rounded-xl border p-2 font-normal"
              value={foodForm.group || 'other'} onChange={(e) => setFoodForm({ ...foodForm, group: e.target.value })}>
              {foodGroups.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={saveFood} className="flex-1 rounded-xl bg-black p-3 font-semibold text-white">
            {editingFoodId ? '💾 Salva modifica' : '+ Aggiungi'}
          </button>
          {editingFoodId && (
            <button
              onClick={() => {
                setEditingFoodId(null);
                setFoodForm({ name: '', carbs: '', protein: '', fat: '', kcal: '', carbSpeed: 'medium', portionSize: '', group: 'other' });
              }}
              className="rounded-xl bg-slate-200 px-4 font-semibold"
            >✕</button>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <div className="mb-1 font-bold">🌍 Libreria pubblica</div>
        <div className="mb-2 text-xs text-slate-500">🏛️ dati ufficiali · 🌍⚠️ controlla etichetta</div>
        <input className="w-full rounded-xl border p-2" placeholder="🔍 Cerca alimenti pubblici"
          value={publicSearch} onChange={(e) => setPublicSearch(e.target.value)} />
        <div className="mt-2 max-h-[280px] space-y-2 overflow-auto">
          {filteredPublicFoods.map((food) => {
            const sm = foodSourceMeta(food);
            const exists = foods.some((f) => f.publicId === food.id || f.name.toLowerCase() === food.name.toLowerCase());
            return (
              <div key={food.id} className="rounded-xl border bg-slate-50 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {sm.icon} {food.name} <span className={carbSpeedMeta(food.carbSpeed).color}>{carbSpeedMeta(food.carbSpeed).icon}</span>
                    </div>
                    <div className="text-xs text-slate-500">C:{food.carbs}g P:{food.protein}g G:{food.fat}g {food.kcal}kcal</div>
                  </div>
                  <button disabled={exists} onClick={() => importPublicFood(food)}
                    className="shrink-0 rounded-lg bg-green-600 px-2 py-1 text-xs font-semibold text-white disabled:bg-slate-300">
                    {exists ? '✓' : 'Importa'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-3 shadow">
        <input
          className="w-full rounded-xl border p-3"
          placeholder="🔍 Cerca nei tuoi prodotti"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div>
        <div className="mb-2 px-1 text-sm font-semibold text-slate-500">I tuoi alimenti ({nonRecipeFoods.length})</div>
        <div className="space-y-1">
          {foodGroups.map((group) => {
            const groupFoods = nonRecipeFoods.filter((f) => {
              const matches = !isSearching || f.name.toLowerCase().includes(q);
              return matches && (f.group || 'other') === group.id;
            });
            if (groupFoods.length === 0) return null;
            const isOpen = isSearching ? true : !!openGroups[group.id];
            return (
              <div key={group.id} className="rounded-2xl overflow-hidden shadow">
                <button
                  className="flex w-full items-center justify-between bg-slate-100 px-4 py-3 font-semibold"
                  onClick={() => toggleGroup(group.id)}
                >
                  <span>{group.label}</span>
                  <span className="text-sm text-slate-400">{groupFoods.length} {isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="divide-y bg-white">
                    {groupFoods.map((food) => {
                      const sm = foodSourceMeta(food);
                      const usage = weeklyIngredientUsage[food.id];
                      return (
                        <div key={food.id} className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold truncate text-sm">
                                {food.name}
                                <span className={`ml-1 ${carbSpeedMeta(food.carbSpeed).color}`}>{carbSpeedMeta(food.carbSpeed).icon}</span>
                              </div>
                              <div className="mt-0.5">
                                <span className={`rounded-full px-2 py-0.5 text-[11px] ${sm.color}`}>{sm.icon} {sm.label}</span>
                              </div>
                              <div className="mt-1 text-xs text-slate-500">C:{food.carbs}g · P:{food.protein}g · G:{food.fat}g · {food.kcal}kcal</div>
                              {usage && usage.grams > 0 && (
                                <div className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] ${usage.level.bg} ${usage.level.text}`}>
                                  Sett: {usage.grams}g · {usage.portions} porz.
                                </div>
                              )}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button onClick={() => handleEditFood(food)} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold">✏️</button>
                              <button onClick={() => deleteFood(food.id)} className="rounded-lg bg-red-100 px-2 py-1 text-xs text-red-700">✕</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RicetteTab({
  foods, weeklyIngredientUsage, setShowRecipeCreator, openRecipeEditor, deleteFood,
  recipeCircleStyle, recipeWarningText,
}) {
  const [recipeSearch, setRecipeSearch] = useState('');
  const recipes = foods.filter((f) => f.isRecipe);
  const q = recipeSearch.trim().toLowerCase();
  const filtered = q ? recipes.filter((r) => r.name.toLowerCase().includes(q)) : recipes;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-3 shadow">
        <input
          className="w-full rounded-xl border p-3"
          placeholder="🔍 Cerca ricetta per nome..."
          value={recipeSearch}
          onChange={(e) => setRecipeSearch(e.target.value)}
        />
      </div>
      <button onClick={() => setShowRecipeCreator(true)}
        className="w-full rounded-xl bg-amber-500 p-3 font-semibold text-white">
        + Nuova ricetta
      </button>
      {recipes.length === 0 && (
        <div className="py-10 text-center text-slate-400">
          <div className="text-4xl mb-2">🍲</div>
          Nessuna ricetta ancora
        </div>
      )}
      {filtered.length === 0 && recipes.length > 0 && (
        <div className="py-6 text-center text-slate-400 text-sm">Nessuna ricetta trovata per "{recipeSearch}"</div>
      )}
      {filtered.map((recipe) => {
        const warning = recipeWarningText(recipe);
        const usage = weeklyIngredientUsage[recipe.id];
        return (
          <div key={recipe.id} className="rounded-2xl bg-white p-4 shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-1 shrink-0 inline-block h-8 w-8 rounded-full border-2 border-slate-700"
                  style={recipeCircleStyle(recipe)} title="Stato ingredienti settimana" />
                <div className="min-w-0">
                  <div className="font-bold truncate">
                    {recipe.name} <span className={`ml-1 ${carbSpeedMeta(recipe.carbSpeed).color}`}>{carbSpeedMeta(recipe.carbSpeed).icon}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    C:{recipe.carbs}g · P:{recipe.protein}g · G:{recipe.fat}g · {recipe.kcal}kcal /100g
                  </div>
                  <div className="text-xs text-slate-400">Peso: {recipe.recipeTotalWeight}g · {recipe.ingredients?.length || 0} ingr.</div>
                  {warning && <div className="mt-1 text-xs text-orange-700">{warning}</div>}
                  {usage && usage.grams > 0 && (
                    <div className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] ${usage.level.bg} ${usage.level.text}`}>
                      Sett: {usage.grams}g · {usage.portions} porz.
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openRecipeEditor(recipe)} className="rounded-lg bg-slate-100 px-2 py-1 text-sm">✏️</button>
                <button onClick={() => deleteFood(recipe.id)} className="rounded-lg bg-red-100 px-2 py-1 text-sm text-red-700">✕</button>
              </div>
            </div>
            {recipe.ingredients?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {recipe.ingredients.map((ing) => (
                  <span key={ing.foodId} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {ing.name} {ing.grams}g
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CibiPage({
  foods, search, setSearch, publicSearch, setPublicSearch,
  filteredFoods, filteredPublicFoods, foodForm, setFoodForm,
  saveFood, importPublicFood, editFood, deleteFood,
  editingFoodId, setEditingFoodId, weeklyIngredientUsage,
  setShowRecipeCreator, openRecipeEditor,
  recipeCircleStyle, recipeWarningText,
}) {
  const [tab, setTab] = useState('ingredienti');

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="px-4 pt-4 pb-0">
          <h1 className="text-xl font-bold">🍝 Cibi</h1>
        </div>
        <div className="flex border-b mt-2">
          {[
            { id: 'ingredienti', label: '🧂 Ingredienti' },
            { id: 'ricette', label: '🍲 Ricette' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl p-4">
        {tab === 'ingredienti' && (
          <IngredientiTab
            foods={foods} search={search} setSearch={setSearch}
            publicSearch={publicSearch} setPublicSearch={setPublicSearch}
            filteredFoods={filteredFoods} filteredPublicFoods={filteredPublicFoods}
            foodForm={foodForm} setFoodForm={setFoodForm}
            saveFood={saveFood} importPublicFood={importPublicFood}
            editFood={editFood} deleteFood={deleteFood}
            editingFoodId={editingFoodId} setEditingFoodId={setEditingFoodId}
            weeklyIngredientUsage={weeklyIngredientUsage}
          />
        )}
        {tab === 'ricette' && (
          <RicetteTab
            foods={foods} weeklyIngredientUsage={weeklyIngredientUsage}
            setShowRecipeCreator={setShowRecipeCreator} openRecipeEditor={openRecipeEditor}
            deleteFood={deleteFood} recipeCircleStyle={recipeCircleStyle}
            recipeWarningText={recipeWarningText}
          />
        )}
      </div>
    </div>
  );
}
