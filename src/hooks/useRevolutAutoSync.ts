import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_KEY = "admin.revolut.autosync";
const INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

export function useRevolutAutoSync(onSynced?: () => Promise<void> | void) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem(STORAGE_KEY);
    return v === null ? true : v === "1";
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [running, setRunning] = useState(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  }, [enabled]);

  const runSync = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setRunning(true);
    try {
      const { error } = await supabase.functions.invoke("revolut-sync-orders");
      if (error) throw error;
      setLastSyncedAt(new Date());
      await onSynced?.();
    } catch (err: any) {
      toast.error("Auto-sync failed: " + (err?.message || "Unknown error"));
    } finally {
      inFlightRef.current = false;
      setRunning(false);
    }
  }, [onSynced]);

  useEffect(() => {
    if (!enabled) return;
    // run once on mount/enable, then on interval
    runSync();
    const id = setInterval(runSync, INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, runSync]);

  return { enabled, setEnabled, lastSyncedAt, running, runSync };
}
