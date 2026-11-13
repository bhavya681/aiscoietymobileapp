import { create, isAxiosError } from "axios";
import { Platform } from "react-native";

import {
  API_BASE_URL,
  MOBILE_CLIENT_HEADER,
  MOBILE_CLIENT_VALUE,
  REQUEST_TIMEOUT_MS,
} from "@/constants/config";
import { normalizeApiError } from "@/utils/errors";

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Registered by the auth store so that any 401 from the API can clear the
 * local session exactly once. Kept as a callback to avoid a circular import
 * between the HTTP layer and the state store.
 */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export const api = create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  /**
   * Auth travels in the `Authorization: Bearer` header on every platform.
   * The API intentionally allows any origin, and browsers reject wildcard
   * CORS responses when credentials mode is "include", so the client must not
   * opt into cookie credentials. Native builds cannot use browser cookies
   * anyway; they persist the token in SecureStore instead.
   */
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    [MOBILE_CLIENT_HEADER]: MOBILE_CLIENT_VALUE,
  },
});

api.interceptors.request.use((config) => {
  config.headers.set(MOBILE_CLIENT_HEADER, MOBILE_CLIENT_VALUE);

  if (authToken) {
    config.headers.set("Authorization", `Bearer ${authToken}`);

    /**
     * Transitional compatibility: a browser would forbid setting `Cookie`
     * manually, but React Native can. This lets older deployments that only
     * read the `token` cookie keep working until the Bearer-capable build is
     * live. The header is never sent on web.
     */
    if (Platform.OS !== "web") {
      config.headers.set("Cookie", `token=${authToken}`);
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const url = error.config?.url ?? "";
      const isCredentialAttempt =
        /\/users\/(login|signup|reset-password)/.test(url);

      if (status === 401 && !isCredentialAttempt) {
        unauthorizedHandler?.();
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);

export function isNetworkError(error: unknown): boolean {
  return (
    isAxiosError(error) &&
    !error.response &&
    error.code !== "ECONNABORTED"
  );
}
