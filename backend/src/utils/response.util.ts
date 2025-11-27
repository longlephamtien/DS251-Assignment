/**
 * Standardized success response format
 */
export function successResponse(message: string, data?: any, count?: number, pagination?: any) {
  const response: any = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (count !== undefined) {
    response.count = count;
  }

  if (pagination !== undefined) {
    response.pagination = pagination;
  }

  return response;
}

/**
 * Standardized error response format
 */
export function errorResponse(message: string, error?: any) {
  return {
    success: false,
    message,
    error,
  };
}
