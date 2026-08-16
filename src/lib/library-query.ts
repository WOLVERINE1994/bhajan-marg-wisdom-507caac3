import { queryOptions } from "@tanstack/react-query";

import { getWisdomLibrary } from "./library.functions";

/** Shared read of the public wisdom-library corpus from the backend. */
export const wisdomLibraryQuery = queryOptions({
  queryKey: ["wisdom-library"],
  queryFn: () => getWisdomLibrary(),
  staleTime: 5 * 60 * 1000,
});
