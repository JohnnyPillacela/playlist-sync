// /lib/types.ts

/**
 * A generic result type that can be either successful or failed.
 * @template T - The type of the successful result.
 * @template E - The type of the error.
 * @returns {Result<T, E>} A result object.
 */
export type Result<T, E = string> = 
  | { ok: true; data: T }
  | { ok: false; error: E }