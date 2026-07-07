import { formatGrams } from "../lib/format";
import type { Recipe } from "../types";

interface RecipeCardProps {
  recipe: Recipe;
  pizzas: number;
  ballWeightG: number;
}

const YEAST_NAMES = {
  fresh: "Fresh yeast",
  activeDry: "Active dry yeast",
  instant: "Instant dry yeast",
};

export function RecipeCard({ recipe, pizzas, ballWeightG }: RecipeCardProps) {
  return (
    <section className="card recipe-card">
      <h2>Recipe</h2>
      <p className="card-subtitle">
        {pizzas} × {ballWeightG} g balls ({formatGrams(recipe.totalDoughG)} dough)
      </p>
      <table className="recipe-table">
        <tbody>
          <tr>
            <td>Flour (tipo 00)</td>
            <td className="amount">{formatGrams(recipe.flourG)}</td>
          </tr>
          <tr>
            <td>Water</td>
            <td className="amount">{formatGrams(recipe.waterG)}</td>
          </tr>
          <tr>
            <td>Salt</td>
            <td className="amount">{formatGrams(recipe.saltG)}</td>
          </tr>
          <tr>
            <td>
              {YEAST_NAMES[recipe.yeastType]}
              <span className="yeast-pct">
                {" "}
                ({recipe.yeastPct.toLocaleString("sv-SE", {
                  maximumSignificantDigits: 2,
                })}
                %)
              </span>
            </td>
            <td className="amount">{formatGrams(recipe.yeastG)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
