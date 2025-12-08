export interface ApiResponse<T> {
  statusCode: number;
  body: T;
}

export interface ApiError {
  error: string;
  message: string;
}
