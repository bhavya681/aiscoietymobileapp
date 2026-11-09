import { create } from "zustand";

import type {
  ChatConfirmation,
  ChatResponse,
  ChatSource,
  ChatToolCall,
} from "@/types/api";

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ui?: string | null;
  toolCalls?: ChatToolCall[];
  source?: ChatSource;
  confirmation?: ChatConfirmation | null;
  payment?: ChatResponse["payment"];
  isError?: boolean;
  createdAt: number;
};

type AssistantState = {
  messages: AssistantMessage[];
  pending: boolean;
  error: string | null;
  lastPayment: ChatResponse["payment"] | null;
  /** Incremented on reset so in-flight replies cannot repopulate a cleared chat. */
  epoch: number;
  addUserMessage: (content: string) => string;
  addAssistantMessage: (
    input: Omit<AssistantMessage, "id" | "role" | "createdAt">
  ) => string;
  resolveConfirmation: (messageId: string) => void;
  resolveAllConfirmations: () => void;
  setPending: (pending: boolean) => void;
  setError: (error: string | null) => void;
  clearLastPayment: () => void;
  reset: () => void;
};

let sequence = 0;

function createId(prefix: string): string {
  sequence += 1;

  return `${prefix}-${Date.now()}-${sequence}`;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  messages: [],
  pending: false,
  error: null,
  lastPayment: null,
  epoch: 0,

  addUserMessage: (content) => {
    const id = createId("user");

    set((state) => ({
      messages: [
        ...state.messages,
        {
          id,
          role: "user",
          content,
          createdAt: Date.now(),
        },
      ],
    }));

    return id;
  },

  addAssistantMessage: (input) => {
    const id = createId("assistant");

    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...input,
          id,
          role: "assistant",
          createdAt: Date.now(),
        },
      ],
      lastPayment: input.payment ?? state.lastPayment,
    }));

    return id;
  },

  resolveConfirmation: (messageId) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId
          ? { ...message, confirmation: null }
          : message
      ),
    }));
  },

  resolveAllConfirmations: () => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.confirmation ? { ...message, confirmation: null } : message
      ),
    }));
  },

  setPending: (pending) => set({ pending }),
  setError: (error) => set({ error }),
  clearLastPayment: () => set({ lastPayment: null }),

  reset: () =>
    set((state) => ({
      messages: [],
      pending: false,
      error: null,
      lastPayment: null,
      epoch: state.epoch + 1,
    })),
}));
