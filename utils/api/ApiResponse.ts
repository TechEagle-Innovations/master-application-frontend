export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiResponseHandler {
  static success<T>(data: T, message?: string): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static error(message: string, code?: string, details?: any): ApiErrorResponse {
    return {
      success: false,
      error: {
        message,
        code,
        details,
      },
    };
  }

  static isSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
    return response.success;
  }

  static isError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
    return !response.success;
  }

  static getData<T>(response: ApiResponse<T>): T | null {
    return this.isSuccess(response) ? response.data : null;
  }

  static getError<T>(response: ApiResponse<T>): string {
    return this.isError(response) ? response.error.message : '';
  }
} 