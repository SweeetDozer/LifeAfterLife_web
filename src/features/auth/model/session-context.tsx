import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthTokens, subscribeToAuthFailure } from "../../../shared/api/auth";

interface SessionContextValue {
  status: string;
  setStatus: (status: string) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    return subscribeToAuthFailure((code) => {
      setStatus(`Authorization failed with ${code}. Stored auth tokens were cleared.`);
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      setStatus,
      logout() {
        clearAuthTokens();
        setStatus("Logged out.");
        navigate("/login", { replace: true });
      }
    }),
    [navigate, status]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}
