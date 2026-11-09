import { api } from "@/api/client";
import type {
  ApiEnvelope,
  ChatHistoryMessage,
  ChatResponse,
} from "@/types/api";

export async function sendChatMessage(input: {
  message: string;
  history?: ChatHistoryMessage[];
  confirmActionId?: string;
}): Promise<ChatResponse> {
  const response = await api.post<ApiEnvelope<ChatResponse>>("/ai/chat", {
    message: input.message,
    history: input.history ?? [],
    confirmActionId: input.confirmActionId,
  });

  return {
    message: response.data.message ?? "",
    ui: response.data.ui ?? null,
    toolCalls: response.data.toolCalls ?? [],
    source: response.data.source ?? "none",
    confirmation: response.data.confirmation ?? null,
    payment: response.data.payment,
  };
}
