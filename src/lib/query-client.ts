import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export function createQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });

  queryClient.setQueryDefaults(queryKeys.auth.session, {
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });

  queryClient.setQueryDefaults(queryKeys.settings.detail, {
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
  });

  queryClient.setQueryDefaults(queryKeys.account.profile, {
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return queryClient;
}
