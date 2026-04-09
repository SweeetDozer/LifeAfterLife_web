import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../features/auth/model/use-auth-mutations";
import { useSession } from "../features/auth/model/session-context";
import { AuthForm } from "../features/auth/ui/AuthForm";
import { getErrorMessage } from "../shared/api/client";
import { PageSection } from "../shared/ui/PageSection";
import type { UserLogin } from "../shared/types/api";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setStatus } = useSession();
  const loginMutation = useLoginMutation();
  const [form, setForm] = useState<UserLogin>({
    email: "",
    password: ""
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await loginMutation.mutateAsync(form);
      setStatus(`Logged in. Token type: ${result.token_type}.`);
      const nextPath =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";
      navigate(nextPath, { replace: true });
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  return (
    <PageSection title="Login" description="Authenticate through the typed API client.">
      <AuthForm
        mode="login"
        form={form}
        onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSubmit}
      />
      {loginMutation.isPending ? <p>Loading...</p> : null}
      {loginMutation.isError ? <p>{getErrorMessage(loginMutation.error)}</p> : null}
    </PageSection>
  );
}
