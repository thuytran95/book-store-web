export type FieldError = { loc: (string | number)[]; msg: string; type: string };

/** Error envelope returned by the backend: `{ error: { code, message, details } }`. */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    status = 0,
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /** Per-field validation errors (VALIDATION_ERROR), keyed by the last `loc` segment. */
  get fieldErrors(): Record<string, string> {
    const fields = this.details.fields as FieldError[] | undefined;
    const out: Record<string, string> = {};
    for (const f of fields ?? []) {
      const key = String(f.loc[f.loc.length - 1]);
      if (!(key in out)) out[key] = f.msg;
    }
    return out;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

export function hasCode(e: unknown, ...codes: string[]): boolean {
  return isApiError(e) && codes.includes(e.code);
}

export async function parseApiError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    const err = body?.error;
    if (err?.code) {
      return new ApiError(err.code, err.message ?? err.code, res.status, err.details ?? {});
    }
  } catch {
    // fall through to generic error
  }
  return new ApiError(`HTTP_${res.status}`, res.statusText || "Request failed", res.status);
}
