declare module "../.open-next/worker.js" {
  export const fetch: ExportedHandlerFetchHandler<CloudflareEnv>;
  export const DOQueueHandler: unknown;
  export const DOShardedTagCache: unknown;
}
