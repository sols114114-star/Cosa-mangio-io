import { carbSpeedOptions } from '../data/constants';
import { carbSpeedMeta, foodSourceMeta } from '../utils/helpers';

export default function FoodsPage({
  foods,
  search,
  setSearch,
  publicSearch,
  setPublicSearch,
  filteredFoods,
  filteredPublicFoods,
  foodForm,
  setFoodForm,
  saveFood,
  importPublicFood,
  editFood,
  deleteFood,
  editingFoodId,
  setEditingFoodId,
  weeklyIngredientUsage,
  setShowRecipeCreator,
  recipeCircleStyle,
}) {
  const nonRecipeFoods = filteredFoods.filter((f) => !f.isRecipe);

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="sticky top-0 z-30 bg-white px-4 pt-4 pb-3 shadow-sm">
        <h1 className="text-xl font-bold">🍝 I tuoi cibi</h1>
        <p className="text-sm text-slate-500">Libreria ingredienti personale</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="rounded-2xl bg-white p-4 shadow">
          <input
            className="w-full rounded-xl border p-3"
            placeholder="🔍 Cerca nei tuoi prodotti"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="mt-4 grid grid-cols-2 gap-2">
            <input
              className="col-span-2 rounded-xl border p-2"
              placeholder="Nome alimento"
              value={foodForm.name}
              onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
            />
            <label className="text-sm font-semibold">
              Carboidrati /100g
              <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" value={foodForm.carbs}
                onChange={(e) => setFoodForm({ ...foodForm, carbs: e.target.value })} />
            </label>
            <label className="text-sm font-semibold">
              Proteine /100g
              <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" value={foodForm.protein}
                onChange={(e) => setFoodForm({ ...foodForm, protein: e.target.value })} />
            </label>
            <label className="text-sm font-semibold">
              Grassi /100g
              <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" value={foodForm.fat}
                onChange={(e) => setFoodForm({ ...foodForm, fat: e.target.value })} />
            </label>
            <label className="text-sm font-semibold">
              Kcal /100g
              <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" value={foodForm.kcal}
                onChange={(e) => setFoodForm({ ...foodForm, kcal: e.target.value })} />
            </label>
            <label className="col-span-2 text-sm font-semibold">
              Porzione normale (g)
              <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number"
                placeholder="es. pasta 80g, pane 50g" value={foodForm.portionSize}
                onChange={(e) => setFoodForm({ ...foodForm, portionSize: e.target.value })} />
            </label>
            <label className="col-span-2 text-sm font-semibold">
              Tipo carboidrati
              <select className="mt-1 w-full rounded-xl border p-2 font-normal" value={foodForm.carbSpeed}
                onChange={(e) => setFoodForm({ ...foodForm, carbSpeed: e.target.value })}>
                {carbSpeedOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
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
                  setFoodForm({ name: '', carbs: '', protein: '', fat: '', kcal: '', carbSpeed: 'medium', portionSize: '' });
                }}
                className="rounded-xl bg-slate-200 px-4 font-semibold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <div className="mb-1 font-bold">🌍 Libreria pubblica</div>
          <div className="mb-2 text-xs text-slate-500">🏛️ dati ufficiali · 🌍⚠️ controlla l'etichetta</div>
          <input
            className="w-full rounded-xl border p-2"
            placeholder="🔍 Cerca alimenti pubblici"
            value={publicSearch}
            onChange={(e) => setPublicSearch(e.target.value)}
          />
          <div className="mt-2 max-h-[300px] space-y-2 overflow-auto">
            {filteredPublicFoods.map((food) => {
              const sm = foodSourceMeta(food);
              const exists = foods.some(
                (f) => f.publicId === food.id || f.name.toLowerCase() === food.name.toLowerCase()
              );
              return (
                <div key={food.id} className="rounded-xl border bg-slate-50 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {sm.icon} {food.name}{' '}
                        <span className={carbSpeedMeta(food.carbSpeed).color}>
                          {carbSpeedMeta(food.carbSpeed).icon}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        C:{food.carbs}g P:{food.protein}g G:{food.fat}g {food.kcal}kcal
                      </div>
                    </div>
                    <button
                      disabled={exists}
                      onClick={() => importPublicFood(food)}
                      className="shrink-0 rounded-lg bg-green-600 px-2 py-1 text-xs font-semibold text-white disabled:bg-slate-300"
                    >
                      {exists ? '✓' : 'Importa'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 px-1 text-sm font-semibold text-slate-500">
            I tuoi alimenti ({nonRecipeFoods.length})
          </div>
          <div className="space-y-2">
            {nonRecipeFoods.map((food) => {
              const sm = foodSourceMeta(food);
              const usage = weeklyIngredientUsage[food.id];
              return (
                <div key={food.id} className="rounded-2xl bg-white p-4 shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold truncate">
                        {food.name}{' '}
                        <span className={`ml-1 ${carbSpeedMeta(food.carbSpeed).color}`}>
                          {carbSpeedMeta(food.carbSpeed).icon}
                        </span>
                      </div>
                      <div className="mt-0.5">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] ${sm.color}`}>
                          {sm.icon} {sm.label}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        C:{food.carbs}g · P:{food.protein}g · G:{food.fat}g · {food.kcal}kcal
                      </div>
                      {usage && usage.grams > 0 && (
                        <div className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] ${usage.level.bg} ${usage.level.text}`}>
                          Settimana: {usage.grams}g · {usage.portions} porz.
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button onClick={() => editFood(food)} className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold">
                        Modifica
                      </button>
                      <button onClick={() => deleteFood(food.id)} className="rounded-lg bg-red-100 px-2 py-1 text-sm text-red-700">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
