import { useEffect, useState } from "react";

export function useAutoRefresh(fetchFn: () => Promise<void>, intervalMs = 30000) {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(async () => {
      await fetchFn();
      setLastRefreshed(new Date());
    }, intervalMs);
    return () => clearInterval(id);
  }, [fetchFn, intervalMs]);

  return { lastRefreshed };
}
