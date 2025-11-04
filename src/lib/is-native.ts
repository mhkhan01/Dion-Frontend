// src/lib/is-native.ts
export const isNative =
  typeof window !== 'undefined' &&
  (window as any).Capacitor?.isNativePlatform?.();
