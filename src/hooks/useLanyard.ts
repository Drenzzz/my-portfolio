import { useEffect, useRef, useState } from "react";
import type { LanyardData } from "@/types";

const DISCORD_ID = import.meta.env.PUBLIC_DISCORD_ID;

export function useLanyard() {
  const [data, setData] = useState<LanyardData | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "open" | "closed" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const attemptRef = useRef(0);

  useEffect(() => {
    if (!DISCORD_ID) {
      setError("PUBLIC_DISCORD_ID is not set");
      setStatus("error");
      return;
    }

    let socket: WebSocket | null = null;
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    const maxAttempts = 6;

    const connect = () => {
      if (stopped) return;
      if (attemptRef.current >= maxAttempts) {
        setStatus("error");
        setError("Failed to connect to Lanyard after multiple attempts");
        return;
      }

      setStatus("connecting");
      setError(null);
      attemptRef.current += 1;

      socket = new WebSocket("wss://api.lanyard.rest/socket");

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const { op, d } = message;

        if (op === 1) {
          heartbeatInterval = setInterval(() => {
            socket?.send(JSON.stringify({ op: 3 }));
          }, d.heartbeat_interval);

          socket?.send(JSON.stringify({
            op: 2,
            d: { subscribe_to_id: DISCORD_ID },
          }));
        } else if (op === 0) {
          if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
            setStatus("open");
            setData(d);
            setLastUpdated(Date.now());
            attemptRef.current = 0;
          }
        }
      };

      socket.onerror = () => {
        setStatus("error");
        setError("WebSocket error");
      };

      socket.onclose = () => {
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
        if (stopped) return;
        setStatus("closed");
        const delay = Math.min(5000 * Math.pow(1.5, attemptRef.current), 30000);
        reconnectTimeout = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      stopped = true;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      socket?.close();
    };
  }, []);

  return { data, status, error, lastUpdated };
}
