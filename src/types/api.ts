export type Role = "admin" | "resident";

export type MaintenanceStatus = "pending" | "paid" | "overdue";

export type PaymentMethod = "upi" | "bank_transfer" | "cash" | "other";

export type Profile = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: Role;
  createdAt?: string;
};

export type MaintenanceRecord = {
  _id: string;
  userId: string;
  monthlyAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: MaintenanceStatus;
  paidAt?: string | null;
  paymentMethod?: string | null;
  createdAt?: string;
};

export type Invoice = {
  _id: string;
  invoiceNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: "unpaid" | "paid" | "overdue";
};

export type ProfileResponse = {
  profile: Profile;
};

export type PendingResponse = {
  totalPending: number;
  monthlyAmount: number;
  nextDueDate: string | null;
  maintenance: MaintenanceRecord[];
};

export type HistoryResponse = {
  history: MaintenanceRecord[];
};

export type InvoiceResponse = {
  invoice: Invoice | null;
  maintenance: MaintenanceRecord;
};

export type PaymentResponse = {
  amount: number;
  transactionId: string;
};

export type ChatConfirmation = {
  id: string;
  amount: number;
  maintenanceId: string;
};

export type ChatToolCall = {
  name: string;
  status: "success" | "error" | "unauthorized" | "unknown";
};

export type ChatSource = "rag" | "tool" | "both" | "none" | "confirmation";

export type ChatResponse = {
  message: string;
  /** OpenUI Lang program. Rendered by the safe client-side parser. */
  ui?: string | null;
  toolCalls?: ChatToolCall[];
  source?: ChatSource;
  confirmation?: ChatConfirmation | null;
  payment?: PaymentResponse & { method?: PaymentMethod | string };
};

export type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AdminUser = Profile;

export type AdminMaintenanceRecord = Omit<MaintenanceRecord, "userId"> & {
  userId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        address?: string;
      };
};

export type UsersResponse = {
  users: AdminUser[];
};

export type AdminMaintenanceResponse = {
  maintenance: AdminMaintenanceRecord[];
};

export type CreateMaintenanceResponse = {
  maintenance: MaintenanceRecord;
};

export type UpdateRoleResponse = {
  user: AdminUser;
};

export type ApiEnvelope<T> = T & {
  success: boolean;
  message?: string;
};

export type LoginUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type LoginResponse = {
  token: string | null;
  user?: LoginUser;
  message?: string;
};

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
};

export type UpdateProfileInput = {
  name?: string;
  phone?: string;
  address?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};
