"use client";

import type { ReactNode } from "react";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/config/wagmi';
import { InMemoryStorageProvider } from "@/hooks/useInMemoryStorage";

const queryClient = new QueryClient();

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
