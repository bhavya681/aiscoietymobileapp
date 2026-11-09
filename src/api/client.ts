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
  withCredentials: true,
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
     * The deployed web backend authenticates from the `token` httpOnly cookie.
     * React Native can attach that cookie manually once the token is known
     * (something a browser would forbid), so sending both headers keeps the
     * app compatible with the current deployment *and* with the documented
     * Bearer-token patch.
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
