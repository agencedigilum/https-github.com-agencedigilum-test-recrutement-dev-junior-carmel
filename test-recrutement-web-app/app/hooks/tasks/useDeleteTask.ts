import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope } from "../types";

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<ApiEnvelope<{ deleted: boolean }>>(`/tasks/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
