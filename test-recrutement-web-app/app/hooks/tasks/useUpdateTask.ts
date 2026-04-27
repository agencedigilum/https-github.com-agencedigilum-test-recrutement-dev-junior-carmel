import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope, Task } from "../types";

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      data: { title?: string; description?: string; due_date?: string; is_done?: boolean };
    }) => {
      const response = await api.put<ApiEnvelope<Task>>(`/tasks/${payload.id}`, payload.data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
