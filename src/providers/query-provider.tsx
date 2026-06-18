import { useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import {
  createAsyncStoragePersister,
} from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Persister for offline read cache.
 * Survives app restarts so lists render immediately even with no connection.
 * Bust entries older than 24h to avoid showing very stale data.
 */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "moneytracker_query_cache",
  throttleTime: 1000,
});

const defaultOptions = {
  queries: {
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: 0,
  },
} as const;

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    const qc = new QueryClient({ defaultOptions });
    persistQueryClient({
      queryClient: qc,
      persister: asyncStoragePersister,
      maxAge: ONE_DAY_MS,
    });
    return qc;
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
