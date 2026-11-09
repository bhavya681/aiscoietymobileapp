import type { AxiosResponse } from "axios";

import { api } from "@/api/client";
import {
  MOBILE_CLIENT_HEADER,
  MOBILE_CLIENT_VALUE,
} from "@/constants/config";
import type {
  ApiEnvelope,
  ChangePasswordInput,
  LoginResponse,
  Profile,
  ProfileResponse,
  SignupInput,
  UpdateProfileInput,
} from "@/types/api";

export type LoginInput = {
  email: string;
  password: string;
};

/**
 * Extracts a JWT from either a patched mobile login response (`token` in the
 * JSON body) or the `Set-Cookie` header when the runtime exposes it. The app
 * works with the current deployment whenever the cookie is readable and works
 * everywhere once the documented backend patch is deployed.
 */
function extractToken(response: AxiosResponse): string | null {
  const body = response.data as { token?: unknown } | undefined;

  if (typeof body?.token === "string" && body.token.length > 0) {
    return body.token;
  }

  const rawCookie = response.headers?.["set-cookie"];
  const cookieString = Array.isArray(rawCookie)
    ? rawCookie.join("; ")
    : typeof rawCookie === "string"
      ? rawCookie
      : "";

  const match = /(?:^|[;,\s])token=([^;,\s]+)/.exec(cookieString);

  if (!match?.[1]) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export async function loginRequest(input: LoginInput): Promise<LoginResponse> {
  const response = await api.post<
    ApiEnvelope<{ user?: LoginResponse["user"] }>
  >("/users/login", input, {
    headers: { [MOBILE_CLIENT_HEADER]: MOBILE_CLIENT_VALUE },
  });

  return {
    token: extractToken(response),
    user: response.data.user,
    message: response.data.message,
  };
}

export async function signupRequest(
  input: SignupInput
): Promise<{ message?: string }> {
  const response = await api.post<ApiEnvelope<{ user: Profile }>>(
    "/users/signup",
    input
  );

  return { message: response.data.message };
}

export async function logoutRequest(): Promise<void> {
  await api.post("/users/logout");
}

export async function getProfile(): Promise<Profile> {
  const response = await api.get<ApiEnvelope<ProfileResponse>>("/users/profile");

  return response.data.profile;
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<Profile> {
  const response = await api.patch<ApiEnvelope<{ user: Profile }>>(
    "/users/update",
    input
  );

  return response.data.user;
}

export async function changePassword(
  input: ChangePasswordInput
): Promise<string | undefined> {
  const response = await api.put<ApiEnvelope<Record<string, never>>>(
    "/users/reset-password",
    input
  );

  return response.data.message;
}

export async function deleteAccount(): Promise<void> {
  await api.delete("/users/delete");
}
