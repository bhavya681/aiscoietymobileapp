import type {
  MaintenanceStatus,
  PaymentMethod,
  Role,
} from "@/types/api";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function groupIndian(integerPart: string): string {
  if (integerPart.length <= 3) {
    return integerPart;
  }

  const lastThree = integerPart.slice(-3);
  const rest = integerPart.slice(0, -3);

  return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}`;
}

export function formatCurrency(
  amount: number | null | undefined,
  options: { decimals?: number; compactZero?: boolean } = {}
): string {
  const value = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;

  if (options.compactZero && value === 0) {
    return "₹0";
  }

  const decimals =
    options.decimals ?? (Number.isInteger(value) ? 0 : 2);
  const fixed = Math.abs(value).toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split(".");
  const formatted = `${value < 0 ? "-" : ""}₹${groupIndian(integerPart)}${
    decimalPart ? `.${decimalPart}` : ""
  }`;

  return formatted;
}

export function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value?: string | null): string {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return `${String(date.getDate()).padStart(2, "0")} ${
    MONTHS_SHORT[date.getMonth()]
  } ${date.getFullYear()}`;
}

export function formatDateTime(value?: string | null): string {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${formatDate(value)}, ${displayHour}:${minutes} ${suffix}`;
}

export function formatMonth(value?: string | null): string {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return `${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatMonthShort(value?: string | null): string {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return `${MONTHS_SHORT[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}`;
}

export function daysFromToday(value?: string | null): number | null {
  const date = parseDate(value);

  if (!date) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function dueLabel(value?: string | null): string {
  const days = daysFromToday(value);

  if (days === null) {
    return "No due date";
  }

  if (days === 0) {
    return "Due today";
  }

  if (days === 1) {
    return "Due tomorrow";
  }

  if (days > 1) {
    return `Due in ${days} days`;
  }

  if (days === -1) {
    return "1 day overdue";
  }

  return `${Math.abs(days)} days overdue`;
}

export function titleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

export function paymentMethodLabel(method?: string | null): string {
  if (!method) {
    return "—";
  }

  switch (method) {
    case "upi":
      return "UPI";
    case "bank_transfer":
      return "Bank transfer";
    case "cash":
      return "Cash";
    case "other":
      return "Other";
    default:
      return titleCase(method);
  }
}

export function paymentMethodDescription(method: PaymentMethod): string {
  switch (method) {
    case "upi":
      return "Google Pay, PhonePe, Paytm or any UPI app";
    case "bank_transfer":
      return "NEFT / IMPS to the society account";
    case "cash":
      return "Hand over to the society office";
    case "other":
      return "Cheque or another approved method";
  }
}

export function initials(name?: string | null): string {
  if (!name) {
    return "SA";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "SA";
  }

  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";

  return `${first}${last}`.toUpperCase();
}

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export function maintenanceStatusMeta(status: MaintenanceStatus): {
  label: string;
  tone: StatusTone;
} {
  switch (status) {
    case "paid":
      return { label: "Paid", tone: "success" };
    case "overdue":
      return { label: "Overdue", tone: "danger" };
    case "pending":
    default:
      return { label: "Pending", tone: "warning" };
  }
}

export function roleLabel(role: Role): string {
  return role === "admin" ? "Administrator" : "Resident";
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max - 1)}…`;
}

export function invoiceStatusTone(status: InvoiceStatus): StatusTone {
  switch (status) {
    case "paid":
      return "success";
    case "overdue":
      return "danger";
    case "unpaid":
    default:
      return "warning";
  }
}

type InvoiceStatus = "unpaid" | "paid" | "overdue";

export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}
