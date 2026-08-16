import {
  CONTENT_ITEMS,
  DEMO_ITEM,
  DEMO_SEGMENTS,
  DEMO_SEGMENT_TOPICS,
  DEMO_SOURCE,
  INGESTION_JOBS,
  SOURCES,
  TOPICS,
} from "./registry";
import type {
  ContentItem,
  IngestionJob,
  SegmentTopic,
  Source,
  Topic,
  TranscriptSegment,
} from "./types";

export interface WisdomLibrary {
  sources: Source[];
  contentItems: ContentItem[];
  topics: Topic[];
  transcriptSegments: TranscriptSegment[];
  segmentTopics: SegmentTopic[];
  ingestionJobs: IngestionJob[];
  origin: "supabase" | "registry";
}

/** Complete, deterministic local dataset used when Supabase is not configured. */
export function getRegistryLibrary(includeDemoFixtures = false): WisdomLibrary {
  return {
    sources: includeDemoFixtures ? [...SOURCES, DEMO_SOURCE] : [...SOURCES],
    contentItems: includeDemoFixtures ? [...CONTENT_ITEMS, DEMO_ITEM] : [...CONTENT_ITEMS],
    topics: [...TOPICS],
    transcriptSegments: includeDemoFixtures ? [...DEMO_SEGMENTS] : [],
    segmentTopics: includeDemoFixtures ? [...DEMO_SEGMENT_TOPICS] : [],
    ingestionJobs: [...INGESTION_JOBS],
    origin: "registry",
  };
}
