import type { AuthFailureStatus } from "./types";

type AuthFailureHandler = (status: AuthFailureStatus) => void;

const authFailureHandlers = new Set<AuthFailureHandler>();

export function notifyAuthFailure(status: AuthFailureStatus) {
  authFailureHandlers.forEach((handler) => handler(status));
}

export function subscribeToAuthFailure(handler: AuthFailureHandler): () => void {
  authFailureHandlers.add(handler);

  return () => {
    authFailureHandlers.delete(handler);
  };
}
