export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface ApiListResponse<T = any> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
