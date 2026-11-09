import { create } from "zustand";

import { STORAGE_KEYS } from "@/constants/config";
import type { ThemeMode } from "@/constants/theme";
import { getStoredItem, setStoredItem } from "@/utils/storage";

type ThemeState = {
  mode: ThemeMode;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => void;
};

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

let hydrating = false;

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated || hydrating) {
      return;
    }

    hydrating = true;

    const stored = await getStoredItem(STORAGE_KEYS.theme);
    set({
      mode: isThemeMode(stored) ? stored : "system",
      hydrated: true,
    });
  },

  setMode: (mode) => {
    set({ mode });
    void setStoredItem(STORAGE_KEYS.theme, mode);
  },
}));
