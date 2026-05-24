import { carbSpeedMeta, foodSourceMeta } from '../utils/helpers';

export default function RecipesPage({
  foods,
  weeklyIngredientUsage,
  setShowRecipeCreator,
  openRecipeEditor,
  deleteFood,
  recipeCircleStyle,
  recipeWarningText,
}) {
  const recipes = foods.filter((f) => f.isRecipe);

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="sticky top-0 z-30 bg-white px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">🍲 Ricette</h1>
            <p className="text-sm text-slate-500">{recipes.length} ricette salvate</p>
          </div>
          <button
            onClick={() => setShowRecipeCreator(true)}
            className="rounded-xl bg-amber-500 px-4 py-2 font-semibold text-white"
          >
            + Nuova
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-3 p-4">
        {recipes.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <div className="text-4xl mb-2">🍲</div>
            <div>Nessuna ricetta ancora.</div>
            <div className="text-sm mt-1">Clicca "+ Nuova" per crearne una.</div>
          </div>
        )}

        {recipes.map((recipe) => {
          const warning = recipeWarningText(recipe);
          const usage = weeklyIngredientUsage[recipe.id];
          return (
            <div key={recipe.id} className="rounded-2xl bg-white p-4 shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className="mt-1 shrink-0 inline-block h-8 w-8 rounded-full border-2 border-slate-700"
                    style={recipeCircleStyle(recipe)}
                    title="Stato ingredienti nella settimana"
                  />
                  <div className="min-w-0">
                    <div className="font-bold truncate">
                      {recipe.name}{' '}
                      <span className={`ml-1 ${carbSpeedMeta(recipe.carbSpeed).color}`}>
                        {carbSpeedMeta(recipe.carbSpeed).icon}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      C: {recipe.carbs}g | P: {recipe.protein}g | G: {recipe.fat}g | {recipe.kcal} kcal /100g
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Peso totale: {recipe.recipeTotalWeight}g · {recipe.ingredients?.length || 0} ingredienti
                    </div>
                    {warning && (
                      <div className="mt-1 text-xs text-orange-700">{warning}</div>
                    )}
                    {usage && usage.grams > 0 && (
                      <div className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] ${usage.level.bg} ${usage.level.text}`}>
                        Settimana: {usage.grams}g · {usage.portions} porz.
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openRecipeEditor(recipe)}
                    className="rounded-lg bg-slate-200 px-2 py-1 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteFood(recipe.id)}
                    className="rounded-lg bg-red-100 px-2 py-1 text-sm text-red-700"
                  >
                    X
                  </button>
                </div>
              </div>

              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
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
    </div>
  );
}
