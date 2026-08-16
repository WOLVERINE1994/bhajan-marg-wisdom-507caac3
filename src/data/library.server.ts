import { createClient } from "@supabase/supabase-js";

import { getRegistryLibrary, type WisdomLibrary } from "./library";
import type {
  ContentItem,
  IngestionJob,
  SegmentTopic,
  Source,
  Topic,
  TranscriptSegment,
} from "./types";

/**
 * Loads the public wisdom-library snapshot on the server using the publishable
 * key. Only rows exposed by the public read policies are returned, and no
 * credential ever reaches client code.
 *
 * A missing configuration, timeout, unavailable database, or incomplete
 * migration falls back to the reviewed local registry so public pages continue
 * to render safely.
 */
export async function loadWisdomLibrary(
  options: { includeDemoFixtures?: boolean } = {},
): Promise<WisdomLibrary> {
  const fallback = getRegistryLibrary(options.includeDemoFixtures);

  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) return fallback;

  const supabase = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  try {
    const [sources, contentItems, topics, transcriptSegments, segmentTopics, ingestionJobs] =
      await Promise.all([
        supabase.from("sources").select("*").order("created_at"),
        supabase.from("content_items").select("*").order("title"),
        supabase.from("topics").select("*").order("label_en"),
        supabase.from("transcript_segments").select("*").order("seq"),
        supabase.from("segment_topics").select("*"),
        supabase.from("ingestion_jobs").select("*").order("created_at"),
      ]);

    const first = [
      sources,
      contentItems,
      topics,
      transcriptSegments,
      segmentTopics,
      ingestionJobs,
    ].find((r) => r.error);
    if (first?.error) throw first.error;

    // Empty sources/topics normally means the migration or seed has not completed.
    if (!sources.data?.length || !topics.data?.length) return fallback;

    return {
      sources: (sources.data ?? []) as unknown as Source[],
      contentItems: (contentItems.data ?? []) as unknown as ContentItem[],
      topics: (topics.data ?? []) as unknown as Topic[],
      transcriptSegments: (transcriptSegments.data ?? []).map((s) => ({
        ...(s as unknown as TranscriptSegment),
        embedding: null,
      })),
      segmentTopics: (segmentTopics.data ?? []).map((st) => ({
        ...(st as unknown as SegmentTopic),
        score: Number((st as { score: number | string }).score),
      })),
      ingestionJobs: (ingestionJobs.data ?? []) as unknown as IngestionJob[],
      origin: "supabase",
    };
  } catch (error) {
    console.warn("Wisdom library database unavailable; using registry fallback.", error);
    return fallback;
  }
}
