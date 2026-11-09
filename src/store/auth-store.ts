import { create } from "zustand";

import {
  changePassword,
  deleteAccount,
  getProfile,
  loginRequest,
  logoutRequest,
  signupRequest,
  updateProfile,
} from "@/api/auth";
import { setAuthToken, setUnauthorizedHandler } from "@/api/client";
import { queryClient } from "@/api/query-client";
import { STORAGE_KEYS } from "@/constants/config";
import { useAssistantStore } from "@/store/assistant-store";
import type {
  ChangePasswordInput,
  Profile,
  SignupInput,
  UpdateProfileInput,
} from "@/types/api";
import { errorMessage } from "@/utils/errors";
import { deleteStoredItem, getStoredItem, setStoredItem } from "@/utils/storage";

export type AuthMode = "bearer" | "cookie";
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type PersistedSession = {
  version: 1;
  token: string | null;
  mode: AuthMode;
  user: Profile | null;
  savedAt: string;
};

type AuthState = {
  status: AuthStatus;
  hydrated: boolean;
  hydrating: boolean;
  user: Profile | null;
  token: string | null;
  mode: AuthMode;
  offline: boolean;
  sessionExpired: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignupInput) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  saveProfile: (profile: Profile) => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<Profile>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  deleteAccount: () => Promise<void>;
  handleUnauthorized: () => void;
  clearError: () => void;
  dismissSessionExpired: () => void;
};

let hydrating = false;

function persistSession(
  token: string | null,
  mode: AuthMode,
  user: Profile | null
) {
  const session: PersistedSession = {
    version: 1,
    token,
    mode,
    user,
    savedAt: new Date().toISOString(),
  };

  return setStoredItem(STORAGE_KEYS.session, JSON.stringify(session));
}

async function clearPersistedSession() {
  await deleteStoredItem(STORAGE_KEYS.session);
}

/**
 * Drops every trace of the previous account from memory. Without this, cached
 * maintenance, resident or chat data could be shown briefly to the next user
 * who signs in on the same device.
 */
function clearAccountCaches() {
  queryClient.clear();
  useAssistantStore.getState().reset();
}

function isInvalidSessionError(error: unknown): boolean {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: number }).status
      : undefined;

  return status === 401 || status === 403 || status === 404;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "loading",
  hydrated: false,
  hydrating: false,
  user: null,
  token: null,
  mode: "bearer",
  offline: false,
  sessionExpired: false,
  error: null,

  hydrate: async () => {
    if (get().hydrated || hydrating) {
      return;
    }

    hydrating = true;
    set({ hydrating: true });

    try {
      const raw = await getStoredItem(STORAGE_KEYS.session);

      if (!raw) {
        setAuthToken(null);
        set({
          status: "unauthenticated",
          hydrated: true,
          hydrating: false,
          user: null,
          token: null,
        });
        return;
      }

      let session: PersistedSession | null = null;

      try {
        session = JSON.parse(raw) as PersistedSession;
      } catch {
        session = null;
      }

      if (
        !session ||
        session.version !== 1 ||
        (!session.token && session.mode !== "cookie")
      ) {
        await clearPersistedSession();
        setAuthToken(null);
        set({
          status: "unauthenticated",
          hydrated: true,
          hydrating: false,
          user: null,
          token: null,
        });
        return;
      }

      setAuthToken(session.token);
      set({
        token: session.token,
        mode: session.mode,
        user: session.user,
      });

      try {
        const profile = await getProfile();

        set({
          status: "authenticated",
          hydrated: true,
          hydrating: false,
          user: profile,
          offline: false,
          sessionExpired: false,
        });

        void persistSession(session.token, session.mode, profile);
      } catch (error) {
        if (isInvalidSessionError(error)) {
          await clearPersistedSession();
          setAuthToken(null);
          set({
            status: "unauthenticated",
            hydrated: true,
            hydrating: false,
            user: null,
            token: null,
            mode: "bearer",
          });
          return;
        }

        if (session.user) {
          // The device is offline (or the server is unreachable). Keep the
          // cached identity so the app opens instantly; TanStack Query will
          // surface the connection error on data screens and refresh later.
          set({
            status: "authenticated",
            hydrated: true,
            hydrating: false,
            offline: true,
            user: session.user,
          });
          return;
        }

        setAuthToken(null);
        set({
          status: "unauthenticated",
          hydrated: true,
          hydrating: false,
          user: null,
          token: null,
        });
      }
    } finally {
      hydrating = false;
      set({ hydrating: false });
    }
  },

  signIn: async (email, password) => {
    set({ error: null, sessionExpired: false });

    const result = await loginRequest({
      email: email.trim().toLowerCase(),
      password,
    });

    setAuthToken(result.token);

    let profile: Profile;

    try {
      profile = await getProfile();
    } catch (error) {
      if (!result.token && !result.user) {
        setAuthToken(null);
        throw error;
      }

      if (result.user) {
        profile = {
          _id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: "",
          address: "",
          role: result.user.role,
        };
      } else {
        throw error;
      }
    }

    const mode: AuthMode = result.token ? "bearer" : "cookie";

    clearAccountCaches();

    set({
      status: "authenticated",
      hydrated: true,
      user: profile,
      token: result.token,
      mode,
      offline: false,
      sessionExpired: false,
      error: null,
    });

    await persistSession(result.token, mode, profile);
  },

  signUp: async (input) => {
    set({ error: null });
    await signupRequest(input);
    await get().signIn(input.email, input.password);
  },

  signOut: async () => {
    await clearPersistedSession();
    setAuthToken(null);
    clearAccountCaches();
    set({
      status: "unauthenticated",
      user: null,
      token: null,
      mode: "bearer",
      offline: false,
      sessionExpired: false,
      error: null,
    });

    // Best-effort cookie invalidation for the server session. Local state is
    // already cleared, so a network failure must not keep the user signed in.
    void logoutRequest().catch(() => undefined);
  },

  refreshProfile: async () => {
    try {
      const profile = await getProfile();
      const { token, mode } = get();

      set({ user: profile, offline: false });

      void persistSession(token, mode, profile);

      return profile;
    } catch (error) {
      if (isInvalidSessionError(error)) {
        get().handleUnauthorized();
        return null;
      }

      if (get().user) {
        set({ offline: true });
      }

      return null;
    }
  },

  saveProfile: async (profile) => {
    const { token, mode } = get();
    set({ user: profile });
    await persistSession(token, mode, profile);
  },

  updateProfile: async (input) => {
    const profile = await updateProfile(input);
    await get().saveProfile(profile);
    return profile;
  },

  changePassword: async (input) => {
    await changePassword(input);
  },

  deleteAccount: async () => {
    await deleteAccount();
    await clearPersistedSession();
    setAuthToken(null);
    clearAccountCaches();
    set({
      status: "unauthenticated",
      user: null,
      token: null,
      mode: "bearer",
      offline: false,
      sessionExpired: false,
    });
  },

  handleUnauthorized: () => {
    if (get().status !== "authenticated") {
      return;
    }

    setAuthToken(null);
    void clearPersistedSession();
    clearAccountCaches();
    set({
      status: "unauthenticated",
      user: null,
      token: null,
      mode: "bearer",
      offline: false,
      sessionExpired: true,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  dismissSessionExpired: () => set({ sessionExpired: false }),
}));

setUnauthorizedHandler(() => {
  useAuthStore.getState().handleUnauthorized();
});

export function authErrorMessage(error: unknown): string {
  return errorMessage(error);
}
