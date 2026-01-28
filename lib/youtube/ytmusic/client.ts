// /lib/youtube/ytmusic/client.ts

import YTMusic from "ytmusic-api";

let client: YTMusic | null = null;
let initPromise: Promise<YTMusic> | null = null;

export async function getYTMusicClient(): Promise<YTMusic> {
  if (client) return client;

  if (!initPromise) {
    initPromise = (async () => {
      const c = new YTMusic();
      // README: initialize accepts optional custom cookies
      await c.initialize(); // or await c.initialize(customCookies)
      client = c;
      return c;
    })();
  }

  return initPromise;
}
