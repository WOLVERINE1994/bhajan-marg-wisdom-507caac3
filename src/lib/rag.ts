import {
  DEMO_ITEM,
  DEMO_SEGMENTS,
  DEMO_SEGMENT_TOPICS,
  DEMO_SOURCE,
  SOURCES,
  TOPICS,
} from "@/data/registry";
import type { WisdomLibrary } from "@/data/library";
import type {
  GeneratedAnswer,
  LanguageCode,
  RetrievedCitation,
  SafetyFlag,
  Source,
  TranscriptSegment,
} from "@/data/types";

export const WEAK_EVIDENCE_MESSAGE =
  "Is prashn par hamare indexed sroton mein spasht shiksha nahi mili. Kripya mool satsang dekhein ya sawaal ko thoda vistrit karein.";

const SAFETY_PATTERNS: { flag: SafetyFlag; patterns: RegExp }[] = [
  {
    flag: "self_harm_or_crisis",
    patterns:
      /(suicid|kill myself|end my life|self.?harm|atmahatya|आत्महत्या|marna chahta|marna chahti|jaan dena|abuse|beaten|violence)/i,
  },
  {
    flag: "medical",
    patterns:
      /(cancer|depress|diagnos|medicine|dawa|tablet|surgery|illness|bimari|बीमारी|doctor|therapy|mental health)/i,
  },
  { flag: "legal", patterns: /(court|lawyer|fir|divorce case|legal|kanoon|मुकदमा|police)/i },
  {
    flag: "financial",
    patterns: /(invest|stock|loan|debt|karz|कर्ज|mutual fund|crypto|trading|insurance)/i,
  },
];

export function detectSafetyFlags(question: string): SafetyFlag[] {
  const flags = SAFETY_PATTERNS.filter((p) => p.patterns.test(question)).map((p) => p.flag);
  return flags.length ? flags : ["none"];
}

export function detectLanguage(question: string): LanguageCode {
  const hasDeva = /[\u0900-\u097F]/.test(question);
  const hasLatin = /[a-z]/i.test(question);
  if (hasDeva && hasLatin) return "hi-en";
  if (hasDeva) return "hi";
  const hinglish =
    /(kaise|kya|kyon|mujhe|karun|nahi|hota|jap|bhakti|gussa|chinta|ghar|parivaar|dukh|mann)/i;
  if (hasLatin && hinglish.test(question)) return "hi-en";
  return hasLatin ? "en" : "unknown";
}

const STOP = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "do",
  "does",
  "how",
  "what",
  "why",
  "i",
  "my",
  "me",
  "to",
  "of",
  "and",
  "in",
  "on",
  "kya",
  "kaise",
  "kyon",
  "mujhe",
  "mera",
  "meri",
  "hai",
  "ho",
  "ka",
  "ki",
  "ke",
  "se",
  "par",
  "main",
  "aur",
  "nahi",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

export interface RetrievalHit {
  segment: TranscriptSegment;
  score: number;
}

/**
 * Lexical stand-in for the production retriever (pgvector cosine + reranker).
 * Only searches segments that are actually indexed. Real sources have no
 * indexed segments in this MVP, so real-source retrieval returns nothing.
 */
export function retrieveSegments(
  question: string,
  includeDemoFixtures: boolean,
  library?: WisdomLibrary,
): RetrievalHit[] {
  const indexed = library ? library.transcriptSegments : DEMO_SEGMENTS;
  const pool = includeDemoFixtures ? indexed : indexed.filter((s) => !s.is_demo_fixture);
  const tokens = tokenize(question);
  if (!tokens.length) return [];

  return pool
    .map((segment) => {
      const hay = segment.text_normalized;
      const matched = tokens.filter((t) => hay.includes(t.slice(0, 4)));
      const score = matched.length / tokens.length;
      return { segment, score: Math.min(0.94, score) };
    })
    .filter((h) => h.score >= 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function toCitations(hits: RetrievalHit[], library?: WisdomLibrary): RetrievedCitation[] {
  return hits.map((hit, i) => {
    const item =
      library?.contentItems.find((c) => c.id === hit.segment.content_item_id) ?? DEMO_ITEM;
    const source = library?.sources.find((s) => s.id === item.source_id) ?? DEMO_SOURCE;
    return {
      citation: {
        id: `cit_${hit.segment.id}_${i}`,
        segment_id: hit.segment.id,
        content_item_id: hit.segment.content_item_id,
        source_id: source.id,
        // Never fabricate: the quote is exactly the stored segment text.
        quote: hit.segment.text,
        start_seconds: hit.segment.start_seconds,
        end_seconds: hit.segment.end_seconds,
        score: hit.score,
        validated: true,
      },
      segment: hit.segment,
      item,
      source,
    };
  });
}

function safetyPreamble(flags: SafetyFlag[]): string {
  const notes: string[] = [];
  if (flags.includes("self_harm_or_crisis")) {
    notes.push(
      "**Please seek immediate help.** If you are in danger or thinking of harming yourself, contact local emergency services now, or in India call Tele-MANAS at 14416 / 1800-891-4416. Spiritual material below is supplementary context only and is not a substitute for crisis care.",
    );
  }
  if (flags.includes("medical")) {
    notes.push(
      "This question touches health. Please consult a qualified doctor or mental-health professional; sourced spiritual material is offered only as supplementary support.",
    );
  }
  if (flags.includes("legal")) {
    notes.push(
      "This question touches legal matters. Please consult a qualified lawyer; sourced material below is supplementary only.",
    );
  }
  if (flags.includes("financial")) {
    notes.push(
      "This question touches financial decisions. Please consult a qualified financial adviser; sourced material below is supplementary only.",
    );
  }
  return notes.join("\n\n");
}

/**
 * Mock RAG orchestration. Retrieval first, then a strictly bounded synthesis.
 * If evidence is weak, it refuses rather than putting words in anyone's mouth.
 */
export function generateAnswer(
  question: string,
  includeDemoFixtures: boolean,
  library?: WisdomLibrary,
): GeneratedAnswer {
  const flags = detectSafetyFlags(question);
  const hits = retrieveSegments(question, includeDemoFixtures, library);
  const top = hits[0]?.score ?? 0;
  const preamble = safetyPreamble(flags);

  if (!hits.length || top < 0.35) {
    return {
      id: crypto.randomUUID(),
      question,
      detected_language: detectLanguage(question),
      mode: "INSUFFICIENT_SOURCE_EVIDENCE",
      confidence: top,
      body: [
        preamble,
        WEAK_EVIDENCE_MESSAGE,
        "No sufficiently relevant indexed segment was retrieved, so no teaching is being paraphrased here. Use the Original Satsang Finder to browse the official sources directly.",
      ]
        .filter(Boolean)
        .join("\n\n"),
      citations: toCitations(hits, library),
      safety_flags: flags,
      created_at: new Date().toISOString(),
    };
  }

  const citations = toCitations(hits, library);
  const mode = top >= 0.7 && hits.length === 1 ? "DIRECT_TEACHING" : "SYNTHESIZED_FROM_TEACHINGS";
  const body = [
    preamble,
    mode === "DIRECT_TEACHING"
      ? "The closest match is reproduced verbatim below from the cited segment, without paraphrase."
      : `Synthesis drawn only from the ${citations.length} cited segment${citations.length > 1 ? "s" : ""} below. Nothing outside those citations has been added, and no quotation or timestamp has been invented.`,
    citations
      .map((c) => `> ${c.segment.text}\n> — ${c.item.title}${formatTs(c.segment.start_seconds)}`)
      .join("\n\n"),
    "Please verify against the original recording before acting on anything here.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    id: crypto.randomUUID(),
    question,
    detected_language: detectLanguage(question),
    mode,
    confidence: top,
    body,
    citations,
    safety_flags: flags,
    created_at: new Date().toISOString(),
  };
}

export function formatTs(seconds: number | null): string {
  if (seconds == null) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return ` @ ${m}:${String(s).padStart(2, "0")}`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export interface SatsangMoment {
  source: Source;
  reason: string;
  topics: string[];
  hasIndexedTranscript: boolean;
  url: string;
}

/**
 * Original satsang finder: returns *where to look* in the official sources.
 * It never claims an indexed moment exists when no transcript is indexed.
 */
export function findOriginalMoments(question: string, library?: WisdomLibrary): SatsangMoment[] {
  const tokens = tokenize(question);
  const topics = library?.topics.length ? library.topics : TOPICS;
  const sources = library?.sources.length ? library.sources : SOURCES;
  const topicMatches = topics
    .filter((t) =>
      tokens.some(
        (tok) =>
          t.label_en.toLowerCase().includes(tok) ||
          t.blurb.toLowerCase().includes(tok) ||
          t.slug.includes(tok) ||
          t.example_questions.join(" ").toLowerCase().includes(tok),
      ),
    )
    .map((t) => t.label_en);

  const demoHits = retrieveSegments(question, true, library);
  const segmentTopics = library?.segmentTopics.length ? library.segmentTopics : DEMO_SEGMENT_TOPICS;
  const demoTopics = segmentTopics
    .filter((st) => demoHits.some((h) => h.segment.id === st.segment_id))
    .map((st) => st.topic_id);

  const suggestedTopics = Array.from(
    new Set([
      ...topicMatches,
      ...demoTopics.map((slug) => topics.find((t) => t.slug === slug)?.label_en ?? slug),
    ]),
  ).slice(0, 4);

  return sources
    .filter((s) => s.platform !== "mobile_app" && s.authority === "OFFICIAL")
    .map((s) => ({
      source: s,
      reason:
        s.platform === "youtube"
          ? "Search this official channel for satsang Q&A on your question."
          : s.platform === "instagram"
            ? "Short official excerpts often address this theme."
            : s.platform === "publication"
              ? "Published Vaani may cover this theme in written form."
              : "Official written material may address this theme.",
      topics: suggestedTopics,
      hasIndexedTranscript: false,
      url: s.url,
    }));
}
