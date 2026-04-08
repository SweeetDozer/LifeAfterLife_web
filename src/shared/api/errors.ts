export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.payload === "object" && error.payload && "detail" in error.payload) {
      const detail = (error.payload as { detail?: unknown }).detail;
      if (typeof detail === "string") {
        return detail;
      }
      if (Array.isArray(detail)) {
        return detail
          .map((item) =>
            typeof item === "object" && item && "msg" in item
              ? String((item as { msg: unknown }).msg)
              : JSON.stringify(item)
          )
          .join(", ");
      }
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}
