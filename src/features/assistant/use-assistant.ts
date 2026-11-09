import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { sendChatMessage } from "@/api/ai";
import { MAX_CHAT_HISTORY } from "@/constants/config";
import { useAssistantStore } from "@/store/assistant-store";
import type { ChatConfirmation, ChatHistoryMessage } from "@/types/api";
import { errorMessage } from "@/utils/errors";

function buildHistory(
  messages: ReturnType<typeof useAssistantStore.getState>["messages"]
): ChatHistoryMessage[] {
  return messages
    .filter((message) => !message.isError)
    .map((message) => ({ role: message.role, content: message.content }))
    .filter((message) => message.content.trim().length > 0)
    .slice(-MAX_CHAT_HISTORY);
}

export function useAssistant() {
  const queryClient = useQueryClient();
  const messages = useAssistantStore((state) => state.messages);
  const pending = useAssistantStore((state) => state.pending);
  const error = useAssistantStore((state) => state.error);
  const lastPayment = useAssistantStore((state) => state.lastPayment);
  const clearLastPayment = useAssistantStore((state) => state.clearLastPayment);

  const send = useCallback(
    async (text: string, confirmActionId?: string) => {
      const trimmed = text.trim();
      const store = useAssistantStore.getState();

      if (!trimmed || store.pending) {
        return;
      }

      const outgoing = confirmActionId
        ? "Yes, confirm the payment."
        : trimmed;
      const history = buildHistory(store.messages);
      const epoch = store.epoch;

      store.addUserMessage(outgoing);
      store.setPending(true);
      store.setError(null);

      try {
        const response = await sendChatMessage({
          message: outgoing,
          history,
          confirmActionId,
        });

        if (useAssistantStore.getState().epoch !== epoch) {
          return;
        }

        store.addAssistantMessage({
          content: response.message,
          ui: response.ui,
          toolCalls: response.toolCalls,
          source: response.source,
          confirmation: response.confirmation,
          payment: response.payment,
        });

        if (response.payment) {
          store.resolveAllConfirmations();
          queryClient.invalidateQueries({ queryKey: ["maintenance"] });
          queryClient.invalidateQueries({ queryKey: ["payments"] });
          queryClient.invalidateQueries({ queryKey: ["admin"] });
        }
      } catch (requestError) {
        if (useAssistantStore.getState().epoch !== epoch) {
          return;
        }

        const message = errorMessage(requestError);

        store.setError(message);
        store.addAssistantMessage({
          content: message,
          isError: true,
        });
      } finally {
        if (useAssistantStore.getState().epoch === epoch) {
          useAssistantStore.getState().setPending(false);
        }
      }
    },
    [queryClient]
  );

  const confirm = useCallback(
    async (messageId: string, confirmation: ChatConfirmation) => {
      const store = useAssistantStore.getState();

      store.resolveConfirmation(messageId);
      await send("Yes, confirm the payment.", confirmation.id);
    },
    [send]
  );

  const reset = useCallback(() => {
    useAssistantStore.getState().reset();
  }, []);

  const cancelConfirmation = useCallback((messageId: string) => {
    useAssistantStore.getState().resolveConfirmation(messageId);
  }, []);

  const clearError = useCallback(() => {
    useAssistantStore.getState().setError(null);
  }, []);

  return {
    messages,
    pending,
    error,
    lastPayment,
    send,
    confirm,
    cancelConfirmation,
    reset,
    clearError,
    clearLastPayment,
  };
}
