/// <reference types="vite/client" />

interface WakeLockSentinel {
  release: () => Promise<void>;
}

interface Navigator {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinel>;
  };
}
