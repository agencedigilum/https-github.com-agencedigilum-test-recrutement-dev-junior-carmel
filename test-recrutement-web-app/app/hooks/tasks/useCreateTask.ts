import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope, Task } from "../types";

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; description?: string; due_date?: string }) => {
      const response = await api.post<ApiEnvelope<Task>>("/tasks", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
