export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
};

export type AuthPayload = {
  access_token: string;
  refresh_token: string;
  user: User;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_done: boolean;
  due_date?: string;
  created_at: string;
  updated_at: string;
};
