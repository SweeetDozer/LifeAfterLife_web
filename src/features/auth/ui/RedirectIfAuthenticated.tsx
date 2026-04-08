import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../model/auth-store";

interface RedirectIfAuthenticatedProps {
  children: ReactNode;
}

export function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return null;
  }

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
