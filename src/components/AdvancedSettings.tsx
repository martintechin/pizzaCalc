import type { ProofingMode, YeastType } from "../types";

interface AdvancedSettingsProps {
  hydrationPct: number;
  saltPct: number;
  yeastType: YeastType;
  roomTempC: number;
  fridgeTempC: number;
  proofingMode: ProofingMode;
  onChange: (
    patch: Partial<{
      hydrationPct: number;
      saltPct: number;
      yeastType: YeastType;
      roomTempC: number;
      fridgeTempC: number;
      proofingMode: ProofingMode;
    }>
  ) => void;
}

const YEAST_LABELS: Record<YeastType, string> = {
  fresh: "Fresh",
  activeDry: "Active dry",
  instant: "Instant dry",
};

const MODE_LABELS: Record<ProofingMode, string> = {
  auto: "Automatic",
  roomOnly: "Room temp only",
  coldProof: "Cold proof",
};

export function AdvancedSettings(props: AdvancedSettingsProps) {
  return (
    <details className="advanced">
      <summary>Advanced settings</summary>
      <div className="advanced-body">
        <div className="field-row">
          <label className="field">
            <span className="field-label">Hydration (%)</span>
            <input
              type="number"
              min={50}
              max={90}
              step={0.5}
              value={props.hydrationPct}
              onChange={(e) => props.onChange({ hydrationPct: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            <span className="field-label">Salt (%)</span>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={props.saltPct}
              onChange={(e) => props.onChange({ saltPct: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span className="field-label">Room temp (°C)</span>
            <input
              type="number"
              min={10}
              max={35}
              value={props.roomTempC}
              onChange={(e) => props.onChange({ roomTempC: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            <span className="field-label">Fridge temp (°C)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={props.fridgeTempC}
              onChange={(e) => props.onChange({ fridgeTempC: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="field">
          <span className="field-label">Yeast</span>
          <div className="segmented" role="group" aria-label="Yeast type">
            {(Object.keys(YEAST_LABELS) as YeastType[]).map((type) => (
              <button
                key={type}
                type="button"
                className={props.yeastType === type ? "segment active" : "segment"}
                onClick={() => props.onChange({ yeastType: type })}
              >
                {YEAST_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">Proofing</span>
          <div className="segmented" role="group" aria-label="Proofing mode">
            {(Object.keys(MODE_LABELS) as ProofingMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={props.proofingMode === mode ? "segment active" : "segment"}
                onClick={() => props.onChange({ proofingMode: mode })}
              >
                {MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}
