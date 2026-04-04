import { useEffect } from "react";

export function useAutoRefresh(fetchFn: () => Promise<void>, intervalMs = 30000) {
  useEffect(() => {
    const id = setInterval(fetchFn, intervalMs);
    return () => clearInterval(id);
  }, [fetchFn, intervalMs]);
}
