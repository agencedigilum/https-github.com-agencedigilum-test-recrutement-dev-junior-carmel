import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope, User } from "../types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { first_name?: string; last_name?: string }) => {
      const response = await api.put<ApiEnvelope<User>>("/auth/profile", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
