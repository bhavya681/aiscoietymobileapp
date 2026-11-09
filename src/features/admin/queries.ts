import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createMaintenance,
  deleteUser,
  getAdminMaintenance,
  getUsers,
  updateUserRole,
} from "@/api/admin";
import type { Role } from "@/types/api";

export const adminKeys = {
  all: ["admin"] as const,
  users: ["admin", "users"] as const,
  maintenance: ["admin", "maintenance"] as const,
};

export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: getUsers,
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useAdminMaintenance() {
  return useQuery({
    queryKey: adminKeys.maintenance,
    queryFn: getAdminMaintenance,
    staleTime: 60 * 1000,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      updateUserRole(id, role),
    onSuccess: (updated) => {
      queryClient.setQueryData(adminKeys.users, (previous) => {
        if (!Array.isArray(previous)) {
          return previous;
        }

        return previous.map((user) =>
          user._id === updated._id ? { ...user, ...updated } : user
        );
      });
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
