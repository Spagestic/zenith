// hooks/useSessionId.ts
"use client";

import { useSyncExternalStore } from "react";

function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem("zenith_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("zenith_session", id);
  }
  return id;
}

function subscribe(): () => void {
  // Session ID doesn't change, so no-op subscribe
  return () => {};
}

export function useSessionId(): string {
  return useSyncExternalStore(
    subscribe,
    getSessionId, // Client
    () => "", // Server (SSR fallback)
  );
}
