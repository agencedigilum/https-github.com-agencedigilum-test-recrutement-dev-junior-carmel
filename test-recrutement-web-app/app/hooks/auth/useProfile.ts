import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope, User } from "../types";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get<ApiEnvelope<User>>("/auth/profile");
      return response.data.data;
    },
  });
}
