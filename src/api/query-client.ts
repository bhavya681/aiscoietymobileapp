import { QueryClient } from "@tanstack/react-query";

import { isApiError } from "@/utils/errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (isApiError(error)) {
          if (error.status && error.status >= 400 && error.status < 500) {
            return false;
          }
        }

        return failureCount < 1;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
