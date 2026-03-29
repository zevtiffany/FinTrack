"use client";
import { useEffect } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";

/**
 * Renders nothing but initializes the Zustand store from IndexedDB on mount.
 * Must be a client component placed inside the root layout body.
 */
export function StoreInitializer() {
  const { initialize, isInitialized } = useFinanceStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return null;
}
