import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope } from "../types";

export function useForgetPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post<ApiEnvelope<null>>("/auth/forget-password", { email });
      return response.data;
    },
  });
}
