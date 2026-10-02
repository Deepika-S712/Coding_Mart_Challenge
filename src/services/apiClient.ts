/**
 * Simulated API Client with network latency, error handling, and response encapsulation.
 * Designed so that frontend components make clean async service calls.
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function simulatedFetch<T>(
  dataFetcher: () => T,
  options: {
    delayMs?: number;
    shouldFail?: boolean;
    errorMessage?: string;
    requiredRole?: string;
    currentUserRole?: string;
  } = {}
): Promise<ApiResponse<T>> {
  const {
    delayMs = 300,
    shouldFail = false,
    errorMessage = 'Failed to connect to the backend CMS service.',
    requiredRole,
    currentUserRole,
  } = options;

  await delay(delayMs);

  // Check Role-Based Access Control
  if (requiredRole && currentUserRole !== requiredRole) {
    return {
      success: false,
      error: `Access Denied: Action requires ${requiredRole} privileges. Current role: ${currentUserRole || 'Guest'}.`,
      statusCode: 403,
    };
  }

  if (shouldFail) {
    return {
      success: false,
      error: errorMessage,
      statusCode: 500,
    };
  }

  try {
    const data = dataFetcher();
    return {
      success: true,
      data,
      statusCode: 200,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return {
      success: false,
      error: msg,
      statusCode: 500,
    };
  }
}
