/**
 * Runtime configuration.
 *
 * Only EXPO_PUBLIC_* variables are bundled into the app. Never put MongoDB,
 * JWT, or Gemini secrets here — those live exclusively on the server.
 */

const DEFAULT_API_URL = "https://aiscoietyproject-roan.vercel.app/api";

function normalizeBaseUrl(value: string | undefined): string {
  const raw = (value ?? "").trim();

  if (!raw) {
    return DEFAULT_API_URL;
  }

  return raw.replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);

export const REQUEST_TIMEOUT_MS = 25_000;

export const APP_NAME = "SocietyAI";

/**
 * Identifies native requests to the backend. The web app never sends this
 * header, so the backend can safely expose a mobile-friendly token response
 * without weakening the httpOnly cookie session used by the web client.
 */
export const MOBILE_CLIENT_HEADER = "X-Client-Platform";
export const MOBILE_CLIENT_VALUE = "mobile";

export const STORAGE_KEYS = {
  session: "societyai_session_v1",
  theme: "societyai_theme_v1",
} as const;

export const MAX_CHAT_HISTORY = 20;
