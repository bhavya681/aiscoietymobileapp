/**
 * Static society identity shown in the app chrome.
 *
 * The backend does not expose a society-profile endpoint, so these values are
 * branding constants taken from the existing web application and the official
 * society knowledge document. They are not used for any financial data.
 */

export const SOCIETY = {
  name: process.env.EXPO_PUBLIC_SOCIETY_NAME?.trim() || "Palm Grove Residency",
  legalName: "Palm Grove Co-op Housing Society Ltd.",
  shortName: "Palm Grove",
  supportNote:
    "Contact your society administrator if you need help with your account.",
} as const;

export const QUICK_PROMPTS = [
  "What is my pending balance?",
  "Show my maintenance and payment history.",
  "What happens if I pay late?",
  "Show me my latest invoice.",
] as const;
