import { useQuery } from "@tanstack/react-query";

import { getPaymentHistory, summarizePayments } from "@/api/payments";

export const paymentKeys = {
  all: ["payments"] as const,
  history: ["payments", "history"] as const,
};

export function usePaymentHistory() {
  return useQuery({
    queryKey: paymentKeys.history,
    queryFn: getPaymentHistory,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentSummary() {
  const query = usePaymentHistory();

  return {
    ...query,
    summary: summarizePayments(query.data ?? []),
  };
}
