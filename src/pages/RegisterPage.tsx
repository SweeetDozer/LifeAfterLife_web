import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../features/auth/model/use-auth-mutations";
import { useSession } from "../features/auth/model/session-context";
import { AuthForm } from "../features/auth/ui/AuthForm";
import { getErrorMessage } from "../shared/api/errors";
import { PageSection } from "../shared/ui/PageSection";
import type { UserLogin } from "../shared/types/api";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setStatus } = useSession();
  const registerMutation = useRegisterMutation();
  const [form, setForm] = useState<UserLogin>({
    email: "",
    password: ""
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await registerMutation.mutateAsync(form);
      setStatus(result.detail);
      navigate("/login", { replace: true });
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  return (
    <PageSection title="Register" description="Account creation from the OpenAPI-described endpoint.">
      <AuthForm
        mode="register"
        form={form}
        onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSubmit}
      />
      {registerMutation.isPending ? <p>Loading...</p> : null}
      {registerMutation.isError ? <p>{getErrorMessage(registerMutation.error)}</p> : null}
    </PageSection>
  );
}
