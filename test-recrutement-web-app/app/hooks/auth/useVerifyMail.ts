import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope } from "../types";

type VerifyMailResponse = {
  exists: boolean;
  is_active: boolean;
  can_sign_up: boolean;
};

export function useVerifyMail() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post<ApiEnvelope<VerifyMailResponse>>("/auth/verify-mail", {
        email,
      });
      return response.data.data;
    },
  });
}
