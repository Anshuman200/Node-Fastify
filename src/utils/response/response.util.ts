/**
 * 📝 API Response Utility
 * Standardizes successful and error responses across the application.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  error?: any;
}

export const responseUtil = {
  /**
   * Success response
   */
  success<T>(message: string, data?: T, meta?: any): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      meta,
    };
  },

  /**
   * Error response
   */
  error(message: string, error?: any): ApiResponse {
    return {
      success: false,
      message,
      error: error || null,
    };
  }
};
