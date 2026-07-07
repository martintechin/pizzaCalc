interface WarningListProps {
  errors: string[];
  warnings: string[];
}

export function WarningList({ errors, warnings }: WarningListProps) {
  if (errors.length === 0 && warnings.length === 0) return null;
  return (
    <div className="messages">
      {errors.map((message, i) => (
        <p key={`e${i}`} className="message error">
          {message}
        </p>
      ))}
      {warnings.map((message, i) => (
        <p key={`w${i}`} className="message warning">
          {message}
        </p>
      ))}
    </div>
  );
}
