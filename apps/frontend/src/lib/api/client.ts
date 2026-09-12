const DEFAULT_API_URL = "http://localhost:5000";

export type ApiError = {
  error?: string;
  message?: string;
};

type ApiRequestOptions = Omit<RequestInit, "credentials">;

export const API_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiError;

    return {
      error: body.error,
      message: body.message ?? fallbackMessage(response.status),
    };
  } catch {
    return {
      message: fallbackMessage(response.status),
    };
  }
}

function fallbackMessage(status: number): string {
  if (status === 401) {
    return "Session expired. Please sign in again.";
  }

  if (status === 403) {
    return "You don't have permission to perform this action.";
  }

  if (status === 404) {
    return "The requested resource was not found.";
  }

  return "Something went wrong.";
}
