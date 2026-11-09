import { isAxiosError } from "axios";

export class ApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError(
        "The request timed out. Check your connection and try again.",
        408,
        error.code
      );
    }

    if (!error.response) {
      return new ApiError(
        "Unable to reach SocietyAI. Check your internet connection and try again.",
        undefined,
        error.code
      );
    }

    const payload = error.response.data as
      | { message?: unknown; error?: unknown }
      | undefined;

    const message =
      (typeof payload?.message === "string" && payload.message) ||
      (typeof payload?.error === "string" && payload.error) ||
      defaultMessageForStatus(error.response.status);

    return new ApiError(message, error.response.status, error.code);
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError("Something went wrong. Please try again.");
}

function defaultMessageForStatus(status: number): string {
  if (status === 400) {
    return "That request could not be completed. Check the details and try again.";
  }

  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (status === 403) {
    return "You do not have permission to do that.";
  }

  if (status === 404) {
    return "We could not find what you were looking for.";
  }

  if (status === 409) {
    return "That action conflicts with the current state. Refresh and try again.";
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (status >= 500) {
    return "SocietyAI is having trouble right now. Please try again shortly.";
  }

  return "Something went wrong. Please try again.";
}
