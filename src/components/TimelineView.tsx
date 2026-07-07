import { formatHours, formatStepTime } from "../lib/format";
import type { Schedule } from "../types";

interface TimelineViewProps {
  schedule: Schedule;
  now: Date;
}

export function TimelineView({ schedule, now }: TimelineViewProps) {
  return (
    <section className="card timeline-card">
      <h2>Schedule</h2>
      <p className="card-subtitle">
        {schedule.mode === "coldProof" ? "Cold proof" : "Room temperature"} ·{" "}
        {formatHours(schedule.totalHours)} total
      </p>
      <ol className="timeline">
        {schedule.steps.map((step, i) => (
          <li key={i} className="timeline-step">
            <span className="step-time">{formatStepTime(step.time, now)}</span>
            <span className="step-body">
              <span className="step-label">{step.label}</span>
              <span className="step-detail">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
