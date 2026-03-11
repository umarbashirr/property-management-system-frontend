import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/queryClient";
import { SessionLoader } from "@/providers/SessionLoader";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionLoader>{children}</SessionLoader>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
