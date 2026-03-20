import { useEffect, useRef } from "react";
import { supabase } from "@/config/supabaseClient";

const API_BASE = import.meta.env.DEV
  ? "http://localhost:5000"
  : import.meta.env.VITE_API_BASE || "http://localhost:5000";

type RealtimeHandlers = Record<string, (data: any) => void>;

/**
 * Lightweight SSE client for realtime UI updates.
 * Security: server validates the access token and UI refetches secured data via APIs.
 */
export const useRealtimeEvents = (handlers: RealtimeHandlers) => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let es: EventSource | null = null;
    let cancelled = false;

    const start = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token || cancelled) return;

      es = new EventSource(
        `${API_BASE}/api/realtime?access_token=${encodeURIComponent(token)}`
      );

      Object.keys(handlersRef.current).forEach((eventName) => {
        es!.addEventListener(eventName, (evt) => {
          try {
            const payload = evt instanceof MessageEvent ? evt.data : null;
            const parsed = payload ? JSON.parse(payload) : null;
            const handler = handlersRef.current[eventName];
            handler?.(parsed);
          } catch {
            // Ignore malformed payload.
          }
        });
      });
    };

    start();

    return () => {
      cancelled = true;
      es?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

