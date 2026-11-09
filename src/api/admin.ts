import { api } from "@/api/client";
import type {
  AdminMaintenanceRecord,
  AdminMaintenanceResponse,
  AdminUser,
  ApiEnvelope,
  CreateMaintenanceResponse,
  MaintenanceRecord,
  Role,
  UpdateRoleResponse,
  UsersResponse,
} from "@/types/api";

export async function getUsers(): Promise<AdminUser[]> {
  const response = await api.get<ApiEnvelope<UsersResponse>>("/admin/users");

  return response.data.users ?? [];
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

export async function updateUserRole(
  id: string,
  role: Role
): Promise<AdminUser> {
  const response = await api.put<ApiEnvelope<UpdateRoleResponse>>(
    `/admin/users/${id}/role`,
    { role }
  );

  return response.data.user;
}

export async function getAdminMaintenance(): Promise<
  AdminMaintenanceRecord[]
> {
  const response = await api.get<ApiEnvelope<AdminMaintenanceResponse>>(
    "/admin/maintenance"
  );

  return response.data.maintenance ?? [];
}

export async function createMaintenance(input: {
  userId: string;
  amount: number;
  dueDate: string;
}): Promise<MaintenanceRecord> {
  const response = await api.post<ApiEnvelope<CreateMaintenanceResponse>>(
    "/admin/maintenance",
    input
  );

  return response.data.maintenance;
}
