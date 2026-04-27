import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope, User } from "../types";

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { current_password: string; new_password: string }) => {
      const response = await api.put<ApiEnvelope<User>>("/auth/change-password", payload);
      return response.data.data;
    },
  });
}
