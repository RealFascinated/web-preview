import type Elysia from "elysia";
import type { ValidationError } from "elysia";

/**
 * Custom error handler
 *
 * @param app - The Elysia app instance
 */
export function handleError(app: Elysia) {
  /**
   * Custom error handler
   */
  app.onError({ as: "global" }, ({ code, error }) => {
    // Return default error for type validation
    if (code === "VALIDATION") {
      return (error as ValidationError).all;
    }

    // Assume unknown error is an internal server error
    if (code === "UNKNOWN") {
      code = "INTERNAL_SERVER_ERROR";
    }

    let status = "status" in error ? error.status : undefined;
    if (status === undefined) {
      switch (code) {
        case "INTERNAL_SERVER_ERROR":
          status = 500;
          break;
        case "NOT_FOUND":
          status = 404;
          break;
        case "PARSE":
          status = 400;
          break;
        case "INVALID_COOKIE_SIGNATURE":
          status = 401;
          break;
      }
    }

    return {
      ...((status && { statusCode: status }) || { status: code }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error - message is not in the error type
      ...(error.message != code && { message: error.message }),
      timestamp: new Date().toISOString(),
    };
  });
}

/**
 * Formats the time in the format "MM:SS"
 *
 * @param seconds the time to format in seconds
 * @returns the formatted time in "MM:SS" format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Zero pad minutes and seconds to ensure two digits
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Formats a duration in the format "Xd, Xh, Xm, Xs"
 * showing at most two units for simplicity.
 *
 * @param ms - Duration in milliseconds
 * @returns The formatted duration
 */
export function formatDuration(ms: number): string {
  if (ms < 0) ms = -ms;
  const timeUnits = [
    { unit: "d", ms: 86400000 },
    { unit: "h", ms: 3600000 },
    { unit: "m", ms: 60000 },
    { unit: "s", ms: 1000 },
    { unit: "ms", ms: 1 },
  ];

  const result = [];
  let remainingMs = ms;

  for (const { unit, ms: unitMs } of timeUnits) {
    const count = Math.floor(remainingMs / unitMs);
    if (count > 0) {
      result.push(`${count}${unit}`);
      remainingMs -= count * unitMs;
    }
    // Stop after two units have been added
    if (result.length === 2) break;
  }

  return result.join(", ") || "0s";
}
