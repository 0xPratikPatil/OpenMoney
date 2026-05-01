/** Standard API response envelope */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/** Pagination parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/** Standard error response */
export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}
