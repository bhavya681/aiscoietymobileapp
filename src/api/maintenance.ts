import { api } from "@/api/client";
import type {
  ApiEnvelope,
  HistoryResponse,
  InvoiceResponse,
  PaymentMethod,
  PaymentResponse,
  PendingResponse,
} from "@/types/api";

export async function getPendingMaintenance(): Promise<PendingResponse> {
  const response = await api.get<ApiEnvelope<PendingResponse>>(
    "/maintenance/pending"
  );

  return {
    totalPending: response.data.totalPending ?? 0,
    monthlyAmount: response.data.monthlyAmount ?? 0,
    nextDueDate: response.data.nextDueDate ?? null,
    maintenance: response.data.maintenance ?? [],
  };
}

export async function getMaintenanceHistory(): Promise<HistoryResponse> {
  const response = await api.get<ApiEnvelope<HistoryResponse>>(
    "/maintenance/history"
  );

  return { history: response.data.history ?? [] };
}

export async function getInvoice(id: string): Promise<InvoiceResponse> {
  const response = await api.get<ApiEnvelope<InvoiceResponse>>(
    `/maintenance/invoice/${id}`
  );

  return {
    invoice: response.data.invoice ?? null,
    maintenance: response.data.maintenance,
  };
}

export async function payMaintenance(
  id: string,
  paymentMethod: PaymentMethod
): Promise<PaymentResponse & { message?: string }> {
  const response = await api.post<ApiEnvelope<PaymentResponse>>(
    `/maintenance/pay/${id}`,
    {
      paymentMethod,
      confirmation: true,
    }
  );

  return {
    amount: response.data.amount,
    transactionId: response.data.transactionId,
    message: response.data.message,
  };
}
