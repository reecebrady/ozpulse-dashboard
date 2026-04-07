export interface FetcherConfig {
  baseUrl: string;
  refreshIntervalMs: number;
  cacheKey: string;
}

export function createFetcher<T>(config: FetcherConfig) {
  return async (): Promise<T> => {
    const res = await fetch(config.baseUrl, {
      next: { revalidate: config.refreshIntervalMs / 1000 },
    });
    if (!res.ok) throw new Error(`Fetch failed: ${config.baseUrl} (${res.status})`);
    return res.json();
  };
}
