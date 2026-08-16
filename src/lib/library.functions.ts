import { createServerFn } from "@tanstack/react-start";

import type { WisdomLibrary } from "@/data/library";

/**
 * Public read of the wisdom-library corpus. No auth required: every row it can
 * return is covered by a public read policy in the database.
 */
export const getWisdomLibrary = createServerFn({ method: "GET" }).handler(
  async (): Promise<WisdomLibrary> => {
    const { loadWisdomLibrary } = await import("@/data/library.server");
    return loadWisdomLibrary({ includeDemoFixtures: true });
  },
);
