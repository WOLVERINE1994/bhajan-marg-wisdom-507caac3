import { getRegistryLibrary, type WisdomLibrary } from "./library";
import type {
  ContentItem,
  IngestionJob,
  SegmentTopic,
  Source,
  Topic,
  TranscriptSegment,
} from "./types";

type SupabaseTable =
  | "sources"
  | "content_items"
  | "topics"
  | "transcript_segments"
  | "segment_topics"
  | "ingestion_jobs";

interface ServerEnvironment {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

function serverEnvironment(): ServerEnvironment {
  if (typeof process === "undefined") return {};
  return process.env;
}

async function selectAll<T>(url: string, key: string, table: SupabaseTable): Promise<T[]> {
  const response = await fetch(`${url}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(4_000),
  });

  if (!response.ok) {
    throw new Error(`Supabase ${table} query failed (${response.status})`);
  }
  return (await response.json()) as T[];
}

/**
 * Loads the public wisdom-library snapshot on the server.
 *
 * No Supabase credential is imported into client code. A missing configuration,
 * timeout, unavailable database, or incomplete initial migration falls back to
 * the reviewed registry so public pages continue to render safely.
 */
export async function loadWisdomLibrary(
  options: { includeDemoFixtures?: boolean } = {},
): Promise<WisdomLibrary> {
  const fallback = getRegistryLibrary(options.includeDemoFixtures);
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = serverEnvironment();
  const databaseKey = SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !databaseKey) return fallback;

  const baseUrl = SUPABASE_URL.replace(/\/$/, "");
  try {
    const [sources, contentItems, topics, transcriptSegments, segmentTopics, ingestionJobs] =
      await Promise.all([
        selectAll<Source>(baseUrl, databaseKey, "sources"),
        selectAll<ContentItem>(baseUrl, databaseKey, "content_items"),
        selectAll<Topic>(baseUrl, databaseKey, "topics"),
        selectAll<TranscriptSegment>(baseUrl, databaseKey, "transcript_segments"),
        selectAll<SegmentTopic>(baseUrl, databaseKey, "segment_topics"),
        selectAll<IngestionJob>(baseUrl, databaseKey, "ingestion_jobs"),
      ]);

    // Empty sources/topics normally means the migration or seed has not completed.
    if (!sources.length || !topics.length) return fallback;

    return {
      sources,
      contentItems,
      topics,
      transcriptSegments,
      segmentTopics,
      ingestionJobs,
      origin: "supabase",
    };
  } catch (error) {
    console.warn("Wisdom library database unavailable; using registry fallback.", error);
    return fallback;
  }
}
