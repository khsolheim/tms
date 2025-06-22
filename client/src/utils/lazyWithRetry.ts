import React from 'react';

/**
 * Pakker React.lazy slik at vi automatisk prøver på nytt (full refresh)
 * dersom Webpack ikke finner chunk-fila – typisk når service-worker eller
 * cache gir 404/ChunkLoadError etter deploy/hot-reload.
 */
export default function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  return React.lazy(() =>
    factory().catch((error: any) => {
      const isChunkLoadError =
        error &&
        (error.name === 'ChunkLoadError' ||
          /Loading chunk [\d]+ failed/.test(error.message));

      if (isChunkLoadError) {
        // Hard refresh – laster appen på nytt slik at nye bundles hentes
        window.location.reload();
      }
      throw error;
    }),
  );
} 