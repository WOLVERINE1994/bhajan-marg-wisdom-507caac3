/**
 * Domain model for Bhajan Marg Wisdom AI.
 *
 * These types are intentionally shaped to map 1:1 onto Postgres/Supabase
 * tables (see `docs` in README): sources, content_items, transcript_segments,
 * topics, segment_topics, qa_pairs, citations, ingestion_jobs, answer_audits.
 *
 * Nothing here asserts that content has been ingested. Ingestion state is
 * always explicit so the UI can never imply a transcript exists when it does not.
 */

export type Platform =
  | "youtube"
  | "instagram"
  | "website"
  | "article"
  | "publication"
  | "mobile_app";

/** OFFICIAL = authorized channel/site. THIRD_PARTY = discovery source only. */
export type SourceAuthority = "OFFICIAL" | "THIRD_PARTY_DISCOVERY";

export type ReliabilityTier = "high" | "medium" | "unverified";

export type LanguageCode = "hi" | "en" | "hi-en" | "sa" | "unknown";

export type ReviewStatus =
  | "not_started"
  | "pending_review"
  | "changes_requested"
  | "approved"
  | "rejected";

export type TranscriptStatus =
  | "none"
  | "queued"
  | "fetching"
  | "available"
  | "manual_intake_required"
  | "not_permitted";

export type SegmentationStatus = "none" | "queued" | "running" | "done" | "failed";

export type EmbeddingStatus = "none" | "queued" | "running" | "indexed" | "failed";

/** sources — a channel, website, publication or app we may draw from. */
export interface Source {
  id: string;
  name: string;
  platform: Platform;
  url: string;
  authority: SourceAuthority;
  /** Verified as belonging to / authorized by the organisation. */
  verified: boolean;
  reliability: ReliabilityTier;
  description: string;
  /** Copyright / usage constraints recorded before any ingestion. */
  usage_notes: string;
  /** Whether we currently hold permission to store full transcripts. */
  ingestion_permitted: "yes" | "metadata_only" | "requires_permission";
  created_at: string;
}

/** content_items — one satsang video, reel, article, book chapter, app entry. */
export interface ContentItem {
  id: string;
  source_id: string;
  title: string;
  url: string;
  published_at: string | null;
  /** seconds, when known */
  duration_seconds: number | null;
  language: LanguageCode;
  transcript_status: TranscriptStatus;
  segmentation_status: SegmentationStatus;
  embedding_status: EmbeddingStatus;
  review_status: ReviewStatus;
  fetched_at: string | null;
  /** sha256 of normalized text/URL for duplicate detection */
  content_hash: string | null;
  usage_notes: string;
  /** true only for clearly-labelled synthetic demo fixtures */
  is_demo_fixture: boolean;
  notes?: string;
}

/** transcript_segments — chunked at question/answer boundaries where possible. */
export interface TranscriptSegment {
  id: string;
  content_item_id: string;
  seq: number;
  start_seconds: number | null;
  end_seconds: number | null;
  language: LanguageCode;
  text: string;
  /** normalized (transliteration-folded) text used for lexical search */
  text_normalized: string;
  /** vector(3072) in Postgres via pgvector; null until embedded */
  embedding: number[] | null;
  embedding_model: string | null;
  segment_hash: string;
  review_status: ReviewStatus;
  is_demo_fixture: boolean;
}

/** topics + segment_topics */
export interface Topic {
  id: string;
  slug: string;
  label_en: string;
  label_hi: string;
  blurb: string;
  example_questions: string[];
}

export interface SegmentTopic {
  segment_id: string;
  topic_id: string;
  /** 0..1 classifier confidence */
  score: number;
}

/** qa_pairs — curated question/answer extracted from a segment run. */
export interface QaPair {
  id: string;
  content_item_id: string;
  question_text: string;
  answer_text: string;
  segment_ids: string[];
  language: LanguageCode;
  review_status: ReviewStatus;
  is_demo_fixture: boolean;
}

/** citations — validated link between an answer and a segment. */
export interface Citation {
  id: string;
  segment_id: string;
  content_item_id: string;
  source_id: string;
  quote: string;
  start_seconds: number | null;
  end_seconds: number | null;
  /** retrieval score that produced this citation */
  score: number;
  validated: boolean;
}

export type IngestionJobKind =
  | "fetch_metadata"
  | "transcribe"
  | "segment_qa"
  | "embed"
  | "review"
  | "publish";

export interface IngestionJob {
  id: string;
  content_item_id: string | null;
  source_id: string;
  kind: IngestionJobKind;
  status: "queued" | "running" | "succeeded" | "failed" | "blocked";
  created_at: string;
  finished_at: string | null;
  message: string;
}

/** Answer trust mode shown on every answer card. */
export type AnswerMode =
  | "DIRECT_TEACHING"
  | "SYNTHESIZED_FROM_TEACHINGS"
  | "INSUFFICIENT_SOURCE_EVIDENCE";

/** answer_audits — every generated answer is logged for review. */
export interface AnswerAudit {
  id: string;
  question: string;
  detected_language: LanguageCode;
  mode: AnswerMode;
  /** 0..1 retrieval confidence */
  confidence: number;
  citation_ids: string[];
  retrieved_segment_ids: string[];
  safety_flags: SafetyFlag[];
  model: string | null;
  created_at: string;
}

export type SafetyFlag =
  | "medical"
  | "legal"
  | "financial"
  | "self_harm_or_crisis"
  | "none";

/** Client-side answer shape rendered by the UI. */
export interface RetrievedCitation {
  citation: Citation;
  segment: TranscriptSegment;
  item: ContentItem;
  source: Source;
}

export interface GeneratedAnswer {
  id: string;
  question: string;
  detected_language: LanguageCode;
  mode: AnswerMode;
  confidence: number;
  /** Always labelled in the UI as AI-generated synthesis unless mode is direct excerpt. */
  body: string;
  citations: RetrievedCitation[];
  safety_flags: SafetyFlag[];
  created_at: string;
}
