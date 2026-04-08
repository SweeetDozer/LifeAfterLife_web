import type { FormEvent } from "react";
import { Field } from "../../../shared/ui/Field";
import { Panel } from "../../../shared/ui/Panel";
import type { UserLogin } from "../../../shared/types/api";

interface AuthFormProps {
  mode: "login" | "register";
  form: UserLogin;
  onChange: (field: "email" | "password", value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AuthForm({ mode, form, onChange, onSubmit }: AuthFormProps) {
  return (
    <Panel title={mode === "login" ? "Login" : "Register"}>
      <form className="stack" onSubmit={onSubmit}>
        <Field
          label="Email"
          value={form.email}
          onChange={(value) => onChange("email", value)}
          type="email"
        />
        <Field
          label="Password"
          value={form.password}
          onChange={(value) => onChange("password", value)}
          type="password"
        />
        <button type="submit">{mode === "login" ? "Sign in" : "Create account"}</button>
      </form>
    </Panel>
  );
}
