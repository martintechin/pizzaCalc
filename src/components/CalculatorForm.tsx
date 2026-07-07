import { fromDatetimeLocal, toDatetimeLocal } from "../lib/format";

interface CalculatorFormProps {
  pizzas: number;
  ballWeightG: number;
  startTime: Date;
  cookTime: Date;
  startEdited: boolean;
  onPizzasChange: (value: number) => void;
  onBallWeightChange: (value: number) => void;
  onStartTimeChange: (value: Date) => void;
  onCookTimeChange: (value: Date) => void;
  onResetStart: () => void;
}

export function CalculatorForm(props: CalculatorFormProps) {
  return (
    <section className="form-card">
      <div className="field-row">
        <label className="field">
          <span className="field-label">Pizzas</span>
          <input
            type="number"
            min={1}
            max={99}
            value={props.pizzas}
            onChange={(e) => props.onPizzasChange(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field-label">Ball weight (g)</span>
          <input
            type="number"
            min={100}
            max={500}
            step={5}
            value={props.ballWeightG}
            onChange={(e) => props.onBallWeightChange(Number(e.target.value))}
          />
        </label>
      </div>

      <label className="field">
        <span className="field-label">I want to cook at</span>
        <input
          type="datetime-local"
          className="datetime-input"
          value={toDatetimeLocal(props.cookTime)}
          onChange={(e) => {
            const date = fromDatetimeLocal(e.target.value);
            if (date) props.onCookTimeChange(date);
          }}
        />
      </label>

      <label className="field">
        <span className="field-label">
          Starting (mixing) at
          {props.startEdited && (
            <button type="button" className="link-button" onClick={props.onResetStart}>
              reset to now
            </button>
          )}
        </span>
        <input
          type="datetime-local"
          className="datetime-input"
          value={toDatetimeLocal(props.startTime)}
          onChange={(e) => {
            const date = fromDatetimeLocal(e.target.value);
            if (date) props.onStartTimeChange(date);
          }}
        />
      </label>
    </section>
  );
}
