import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope, User } from "../types";

export function useNewPassword() {
  return useMutation({
    mutationFn: async (payload: { token: string; new_password: string }) => {
      const response = await api.put<ApiEnvelope<User>>("/auth/new-password", payload);
      return response.data.data;
    },
  });
}
