import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { ApiEnvelope, Task } from "../types";

type TasksResponse = {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export function useTasks(params: {
  page: number;
  limit: number;
  search?: string;
  is_done?: string;
  sort?: string;
  order?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const response = await api.get<ApiEnvelope<TasksResponse>>("/tasks", { params });
      return response.data.data;
    },
  });
}
