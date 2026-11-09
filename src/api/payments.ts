import { getMaintenanceHistory } from "@/api/maintenance";
import type { MaintenanceRecord } from "@/types/api";

/**
 * The backend has no standalone `GET /payments` endpoint yet. Every successful
 * maintenance payment is written to a `Payment` document, and the matching
 * maintenance record keeps its `paidAt`, `paymentMethod` and amount, so the
 * maintenance history is the authoritative payment history available to the
 * mobile client. Receipt-level transaction ids are returned by the pay
 * endpoint and are shown immediately after a payment.
 */
export async function getPaymentHistory(): Promise<MaintenanceRecord[]> {
  const { history } = await getMaintenanceHistory();

  return history
    .filter((record) => record.status === "paid")
    .sort((a, b) => {
      const first = new Date(a.paidAt ?? a.createdAt ?? 0).getTime();
      const second = new Date(b.paidAt ?? b.createdAt ?? 0).getTime();

      return second - first;
    });
}

export type PaymentSummary = {
  totalPaid: number;
  totalOutstanding: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
};

export function summarizePayments(
  records: MaintenanceRecord[]
): PaymentSummary {
  return records.reduce<PaymentSummary>(
    (summary, record) => {
      if (record.status === "paid") {
        summary.totalPaid += record.monthlyAmount;
        summary.paidCount += 1;
      } else {
        summary.totalOutstanding += record.pendingAmount;
        summary.pendingCount += 1;

        if (record.status === "overdue") {
          summary.overdueCount += 1;
        }
      }

      return summary;
    },
    {
      totalPaid: 0,
      totalOutstanding: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0,
    }
  );
}
