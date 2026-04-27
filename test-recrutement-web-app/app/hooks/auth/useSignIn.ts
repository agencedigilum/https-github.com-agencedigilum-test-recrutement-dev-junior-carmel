import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope, AuthPayload } from "../types";

export function useSignIn() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const response = await api.post<ApiEnvelope<AuthPayload>>("/auth/sign-in", payload);
      return response.data.data;
    },
  });
}
