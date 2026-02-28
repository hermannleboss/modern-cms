import type { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export function extractApiError(error: unknown): ApiErrorResponse {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  if (axiosError.response?.data) {
    return {
      message: axiosError.response.data.message || 'An error occurred',
      errors: axiosError.response.data.errors,
      statusCode: axiosError.response.status,
    };
  }

  return {
    message: 'Network error. Please try again.',
    statusCode: 0,
  };
}
