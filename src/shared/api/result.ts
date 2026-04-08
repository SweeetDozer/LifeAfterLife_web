import { toApiError } from "./client";

export function unwrap<TData, TError>(
  data: TData | undefined,
  error: TError | undefined,
  response: Response
): TData {
  if (data !== undefined) {
    return data;
  }

  throw toApiError(response, error ?? null);
}
