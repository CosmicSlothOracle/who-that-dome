"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEVICE_STORAGE_KEY } from "./config";

function readDeviceId() {
  return window.localStorage.getItem(DEVICE_STORAGE_KEY) ?? "";
}

export function useDeviceId(): [string, (id: string) => void] {
  const deviceId = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("wtd-device", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("wtd-device", onChange);
      };
    },
    readDeviceId,
    () => "",
  );

  const setDeviceId = useCallback((id: string) => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, id);
    window.dispatchEvent(new Event("wtd-device"));
  }, []);

  return [deviceId, setDeviceId];
}

export function useBrowserOrigin(): string {
  return useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => "",
  );
}
