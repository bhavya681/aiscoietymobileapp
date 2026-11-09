import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getInvoice,
  getMaintenanceHistory,
  getPendingMaintenance,
  payMaintenance,
} from "@/api/maintenance";
import type { PaymentMethod } from "@/types/api";

export const maintenanceKeys = {
  all: ["maintenance"] as const,
  pending: ["maintenance", "pending"] as const,
  history: ["maintenance", "history"] as const,
  invoice: (id: string) => ["maintenance", "invoice", id] as const,
};

const FIVE_MINUTES = 5 * 60 * 1000;

export function usePendingMaintenance() {
  return useQuery({
    queryKey: maintenanceKeys.pending,
    queryFn: getPendingMaintenance,
    staleTime: 60 * 1000,
  });
}

export function useMaintenanceHistory() {
  return useQuery({
    queryKey: maintenanceKeys.history,
    queryFn: getMaintenanceHistory,
    staleTime: FIVE_MINUTES,
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: maintenanceKeys.invoice(id ?? "unknown"),
    queryFn: () => getInvoice(id as string),
    enabled: Boolean(id),
    staleTime: FIVE_MINUTES,
  });
}

export function usePayMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      paymentMethod,
    }: {
      id: string;
      paymentMethod: PaymentMethod;
    }) => payMaintenance(id, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}
