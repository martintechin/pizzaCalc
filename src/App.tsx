import { useEffect, useMemo, useState } from "react";
import { AdvancedSettings } from "./components/AdvancedSettings";
import { CalculatorForm } from "./components/CalculatorForm";
import { RecipeCard } from "./components/RecipeCard";
import { TimelineView } from "./components/TimelineView";
import { WarningList } from "./components/WarningList";
import { DEFAULTS } from "./config";
import { usePersistedState } from "./hooks/usePersistedState";
import { calculate } from "./lib/calculate";
import type { ProofingMode, YeastType } from "./types";

function defaultCookTime(now: Date): Date {
  const cook = new Date(now);
  cook.setDate(cook.getDate() + 1);
  cook.setHours(18, 0, 0, 0);
  return cook;
}

interface Settings {
  pizzas: number;
  ballWeightG: number;
  hydrationPct: number;
  saltPct: number;
  yeastType: YeastType;
  roomTempC: number;
  fridgeTempC: number;
  proofingMode: ProofingMode;
}

export default function App() {
  const [settings, setSettings] = usePersistedState<Settings>(
    "pizzacalc-settings",
    DEFAULTS
  );
  const [now, setNow] = useState(() => new Date());
  const [cookTime, setCookTime] = useState(() => defaultCookTime(new Date()));
  const [editedStart, setEditedStart] = useState<Date | null>(null);

  // Keep "now" fresh so a start time of "now" doesn't go stale on a
  // long-lived tab (PWA kept open on a phone).
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const startTime = editedStart ?? now;

  const result = useMemo(
    () => calculate({ ...settings, startTime, cookTime }, now),
    [settings, startTime, cookTime, now]
  );

  const patch = (values: Partial<Settings>) =>
    setSettings((prev) => ({ ...prev, ...values }));

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍕 Pizza Dough Calculator</h1>
        <p className="tagline">
          Tell it when you want to cook — it plans the dough backwards.
        </p>
      </header>

      <CalculatorForm
        pizzas={settings.pizzas}
        ballWeightG={settings.ballWeightG}
        startTime={startTime}
        cookTime={cookTime}
        startEdited={editedStart !== null}
        onPizzasChange={(pizzas) => patch({ pizzas })}
        onBallWeightChange={(ballWeightG) => patch({ ballWeightG })}
        onStartTimeChange={setEditedStart}
        onCookTimeChange={setCookTime}
        onResetStart={() => setEditedStart(null)}
      />

      <AdvancedSettings
        hydrationPct={settings.hydrationPct}
        saltPct={settings.saltPct}
        yeastType={settings.yeastType}
        roomTempC={settings.roomTempC}
        fridgeTempC={settings.fridgeTempC}
        proofingMode={settings.proofingMode}
        onChange={patch}
      />

      <WarningList errors={result.errors} warnings={result.warnings} />

      {result.recipe && (
        <RecipeCard
          recipe={result.recipe}
          pizzas={settings.pizzas}
          ballWeightG={settings.ballWeightG}
        />
      )}
      {result.schedule && <TimelineView schedule={result.schedule} now={now} />}
    </div>
  );
}
