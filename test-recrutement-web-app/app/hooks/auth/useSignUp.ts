import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope, AuthPayload } from "../types";

export function useSignUp() {
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      first_name?: string;
      last_name?: string;
    }) => {
      const response = await api.post<ApiEnvelope<AuthPayload>>("/auth/sign-up", payload);
      return response.data.data;
    },
  });
}
