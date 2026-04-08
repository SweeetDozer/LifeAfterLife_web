interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "number";
  multiline?: boolean;
}

export function Field({ label, value, onChange, type = "text", multiline = false }: FieldProps) {
  return (
    <label>
      <span>{label}</span>
      {multiline ? (
        <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
