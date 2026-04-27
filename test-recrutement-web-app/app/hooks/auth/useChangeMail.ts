import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope, User } from "../types";

export function useChangeMail() {
  return useMutation({
    mutationFn: async (payload: { current_password: string; new_email: string }) => {
      const response = await api.put<ApiEnvelope<User>>("/auth/change-mail", payload);
      return response.data.data;
    },
  });
}
