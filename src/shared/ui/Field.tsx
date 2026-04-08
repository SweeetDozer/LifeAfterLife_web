interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "number" | "date";
  multiline?: boolean;
  min?: number;
}

export function Field({ label, value, onChange, type = "text", multiline = false, min }: FieldProps) {
  function handleChange(nextValue: string) {
    if (type === "number" && min !== undefined && nextValue !== "") {
      if (nextValue.startsWith("-")) {
        return;
      }

      const parsed = Number(nextValue);
      if (Number.isNaN(parsed) || parsed < min) {
        return;
      }
    }

    onChange(nextValue);
  }

  return (
    <label>
      <span>{label}</span>
      {multiline ? (
        <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input
          min={type === "number" ? min : undefined}
          type={type}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
        />
      )}
    </label>
  );
}
