export interface TaskResponse {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_done: boolean;
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TaskListResponse {
  data: TaskResponse[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}