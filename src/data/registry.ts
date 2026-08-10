import type {
  ContentItem,
  IngestionJob,
  Source,
  Topic,
  TranscriptSegment,
} from "./types";

/**
 * VERIFIED public/official source registry.
 *
 * IMPORTANT: registry entries are metadata only. No transcripts have been
 * ingested for these sources in this MVP, and the UI must not claim otherwise.
 */
export const SOURCES: Source[] = [
  {
    id: "src_yt_bhajanmarg",
    name: "Bhajan Marg (YouTube)",
    platform: "youtube",
    url: "https://www.youtube.com/BhajanMarg",
    authority: "OFFICIAL",
    verified: true,
    reliability: "high",
    description:
      "Official authorized YouTube channel publishing satsang recordings and Q&A sessions.",
    usage_notes:
      "Metadata and public captions may be referenced with attribution. Full transcript storage requires written permission from the channel owner.",
    ingestion_permitted: "requires_permission",
    created_at: "2026-01-14",
  },
  {
    id: "src_yt_radhakripa",
    name: "Shri Hit Radha Kripa (YouTube)",
    platform: "youtube",
    url: "https://www.youtube.com/channel/UC_fmMgNql89jbFI8TNcq9Vg",
    authority: "OFFICIAL",
    verified: true,
    reliability: "high",
    description:
      "Official authorized YouTube channel with satsang, bhajan and darshan uploads.",
    usage_notes:
      "Deep links to original videos with timestamps only. No re-hosting of audio or video.",
    ingestion_permitted: "requires_permission",
    created_at: "2026-01-14",
  },
  {
    id: "src_ig_bhajanmarg",
    name: "Bhajan Marg Official (Instagram)",
    platform: "instagram",
    url: "https://www.instagram.com/bhajanmarg_official/",
    authority: "OFFICIAL",
    verified: true,
    reliability: "high",
    description:
      "Official Instagram handle sharing short satsang excerpts and announcements.",
    usage_notes:
      "Platform terms restrict automated scraping. Metadata plus manual transcript intake only, where compliant.",
    ingestion_permitted: "metadata_only",
    created_at: "2026-01-14",
  },
  {
    id: "src_web_radhakelikunj",
    name: "Shri Hit Radha Keli Kunj (official site)",
    platform: "website",
    url: "https://radhakelikunj.com/",
    authority: "OFFICIAL",
    verified: true,
    reliability: "high",
    description:
      "Official ashram website: schedules, seva information, published material and announcements.",
    usage_notes:
      "Public article text may be parsed for indexing with attribution and canonical links back to the site.",
    ingestion_permitted: "requires_permission",
    created_at: "2026-01-14",
  },
  {
    id: "src_web_bhajanmarg",
    name: "Bhajan Marg articles & blog",
    platform: "article",
    url: "https://bhajanmarg.com/",
    authority: "OFFICIAL",
    verified: true,
    reliability: "high",
    description: "Written articles and satsang notes published under the Bhajan Marg banner.",
    usage_notes:
      "Article parsing permitted for excerpt-level citation. Store canonical URL and fetch date for every excerpt.",
    ingestion_permitted: "requires_permission",
    created_at: "2026-01-14",
  },
  {
    id: "src_pub_vaani",
    name: "Published Vaani / books",
    platform: "publication",
    url: "https://radhakelikunj.com/published-vaani/",
    authority: "OFFICIAL",
    verified: true,
    reliability: "high",
    description:
      "Officially published Vaani and book listings from the Radha Keli Kunj publications page.",
    usage_notes:
      "Copyrighted publications. Bibliographic reference only unless the publisher grants text licence.",
    ingestion_permitted: "metadata_only",
    created_at: "2026-01-14",
  },
  {
    id: "src_app_radhakelikunj",
    name: "Radha Keli Kunj official Android app",
    platform: "mobile_app",
    url: "https://play.google.com/store/apps/details?id=com.vrindavan_ras_mahima",
    authority: "OFFICIAL",
    verified: true,
    reliability: "high",
    description:
      "Official mobile app listing (Vrindavan Ras Mahima) referenced for schedules and in-app media.",
    usage_notes: "Reference and deep link only. No extraction of in-app media.",
    ingestion_permitted: "metadata_only",
    created_at: "2026-01-14",
  },
];

/**
 * Registry-level content items. Every entry below is a *pointer* to public
 * material with an explicit, honest ingestion state. Nothing is marked
 * `available` because no transcript has been ingested in this MVP.
 */
export const CONTENT_ITEMS: ContentItem[] = [
  {
    id: "ci_yt_bm_channel",
    source_id: "src_yt_bhajanmarg",
    title: "Bhajan Marg — satsang upload feed (channel-level entry)",
    url: "https://www.youtube.com/BhajanMarg",
    published_at: null,
    duration_seconds: null,
    language: "hi",
    transcript_status: "none",
    segmentation_status: "none",
    embedding_status: "none",
    review_status: "not_started",
    fetched_at: null,
    content_hash: null,
    usage_notes: "Awaiting written permission before transcript ingestion.",
    is_demo_fixture: false,
    notes:
      "Registered for ingestion. Individual videos will be enumerated by the metadata job once permission is confirmed.",
  },
  {
    id: "ci_yt_rk_channel",
    source_id: "src_yt_radhakripa",
    title: "Shri Hit Radha Kripa — satsang upload feed (channel-level entry)",
    url: "https://www.youtube.com/channel/UC_fmMgNql89jbFI8TNcq9Vg",
    published_at: null,
    duration_seconds: null,
    language: "hi",
    transcript_status: "none",
    segmentation_status: "none",
    embedding_status: "none",
    review_status: "not_started",
    fetched_at: null,
    content_hash: null,
    usage_notes: "Awaiting written permission before transcript ingestion.",
    is_demo_fixture: false,
  },
  {
    id: "ci_ig_bm_feed",
    source_id: "src_ig_bhajanmarg",
    title: "Bhajan Marg Official — Instagram excerpt feed",
    url: "https://www.instagram.com/bhajanmarg_official/",
    published_at: null,
    duration_seconds: null,
    language: "hi",
    transcript_status: "manual_intake_required",
    segmentation_status: "none",
    embedding_status: "none",
    review_status: "not_started",
    fetched_at: null,
    content_hash: null,
    usage_notes: "Manual, compliant transcript intake only.",
    is_demo_fixture: false,
  },
  {
    id: "ci_web_rkk_home",
    source_id: "src_web_radhakelikunj",
    title: "Radha Keli Kunj — official website",
    url: "https://radhakelikunj.com/",
    published_at: null,
    duration_seconds: null,
    language: "hi-en",
    transcript_status: "none",
    segmentation_status: "none",
    embedding_status: "none",
    review_status: "not_started",
    fetched_at: null,
    content_hash: null,
    usage_notes: "Article parser configured; not yet run.",
    is_demo_fixture: false,
  },
  {
    id: "ci_web_bm_articles",
    source_id: "src_web_bhajanmarg",
    title: "Bhajan Marg — articles index",
    url: "https://bhajanmarg.com/",
    published_at: null,
    duration_seconds: null,
    language: "hi",
    transcript_status: "none",
    segmentation_status: "none",
    embedding_status: "none",
    review_status: "not_started",
    fetched_at: null,
    content_hash: null,
    usage_notes: "Article parser configured; not yet run.",
    is_demo_fixture: false,
  },
  {
    id: "ci_pub_vaani",
    source_id: "src_pub_vaani",
    title: "Published Vaani — publications listing",
    url: "https://radhakelikunj.com/published-vaani/",
    published_at: null,
    duration_seconds: null,
    language: "hi",
    transcript_status: "not_permitted",
    segmentation_status: "none",
    embedding_status: "none",
    review_status: "not_started",
    fetched_at: null,
    content_hash: null,
    usage_notes: "Copyrighted print material — bibliographic reference only.",
    is_demo_fixture: false,
  },
  {
    id: "ci_app_rkk",
    source_id: "src_app_radhakelikunj",
    title: "Radha Keli Kunj — official Android app listing",
    url: "https://play.google.com/store/apps/details?id=com.vrindavan_ras_mahima",
    published_at: null,
    duration_seconds: null,
    language: "hi-en",
    transcript_status: "not_permitted",
    segmentation_status: "none",
    embedding_status: "none",
    review_status: "not_started",
    fetched_at: null,
    content_hash: null,
    usage_notes: "Reference only.",
    is_demo_fixture: false,
  },
];

/**
 * DEMO FIXTURES — synthetic, clearly-labelled placeholder segments used only to
 * demonstrate retrieval and citation UI. These are NOT teachings of Pujya Shri
 * Hit Premanand Govind Sharan Ji Maharaj and are never attributed to him.
 */
export const DEMO_SOURCE: Source = {
  id: "src_demo_fixture",
  name: "Demo fixture corpus (synthetic — not a real source)",
  platform: "website",
  url: "about:blank",
  authority: "THIRD_PARTY_DISCOVERY",
  verified: false,
  reliability: "unverified",
  description:
    "Synthetic placeholder text used only to exercise the retrieval, citation and review UI during the MVP demo.",
  usage_notes: "Synthetic content. Not attributable to any speaker.",
  ingestion_permitted: "yes",
  created_at: "2026-01-14",
};

export const DEMO_ITEM: ContentItem = {
  id: "ci_demo_fixture",
  source_id: "src_demo_fixture",
  title: "Demo fixture transcript (synthetic placeholder, not a satsang)",
  url: "about:blank",
  published_at: "2026-01-14",
  duration_seconds: 1800,
  language: "hi-en",
  transcript_status: "available",
  segmentation_status: "done",
  embedding_status: "indexed",
  review_status: "approved",
  fetched_at: "2026-01-14",
  content_hash: "demo-0000000000000000",
  usage_notes: "Synthetic demo fixture.",
  is_demo_fixture: true,
};

interface DemoSegmentSeed {
  id: string;
  topics: string[];
  keywords: string[];
  text: string;
  start: number;
  end: number;
}

const DEMO_SEEDS: DemoSegmentSeed[] = [
  {
    id: "seg_demo_anger",
    topics: ["anger-ego"],
    keywords: ["anger", "krodh", "gussa", "irritation", "temper", "ego", "ahankar"],
    text:
      "[SYNTHETIC DEMO TEXT — not a real transcript] Placeholder passage on anger: the practitioner is advised to notice the first rise of heat, pause the speech, and return attention to remembrance before responding.",
    start: 122,
    end: 205,
  },
  {
    id: "seg_demo_naamjap",
    topics: ["naam-jap"],
    keywords: ["naam", "jap", "japa", "mala", "chanting", "smaran", "remembrance"],
    text:
      "[SYNTHETIC DEMO TEXT — not a real transcript] Placeholder passage on naam-jap: a fixed daily count, a fixed seat, and a fixed time are described as the practical supports of steadiness.",
    start: 410,
    end: 512,
  },
  {
    id: "seg_demo_family",
    topics: ["family-relationships"],
    keywords: ["marriage", "shaadi", "family", "parivaar", "wife", "husband", "conflict", "saas"],
    text:
      "[SYNTHETIC DEMO TEXT — not a real transcript] Placeholder passage on household discord: duty is performed without demand for recognition, and expectation is identified as the root of repeated quarrel.",
    start: 730,
    end: 861,
  },
  {
    id: "seg_demo_fear",
    topics: ["fear-anxiety"],
    keywords: ["fear", "dar", "bhay", "anxiety", "chinta", "worry", "panic"],
    text:
      "[SYNTHETIC DEMO TEXT — not a real transcript] Placeholder passage on fear: attention is turned from the imagined future to the present act of remembrance, and surrender is described as the resting place.",
    start: 980,
    end: 1074,
  },
  {
    id: "seg_demo_karma",
    topics: ["karma"],
    keywords: ["karma", "prarabdha", "destiny", "bhagya", "result", "fal", "suffering", "dukh"],
    text:
      "[SYNTHETIC DEMO TEXT — not a real transcript] Placeholder passage on karma: present effort is emphasised over lament for the past, with results left to the divine.",
    start: 1210,
    end: 1301,
  },
];

export const DEMO_SEGMENTS: TranscriptSegment[] = DEMO_SEEDS.map((seed, i) => ({
  id: seed.id,
  content_item_id: DEMO_ITEM.id,
  seq: i + 1,
  start_seconds: seed.start,
  end_seconds: seed.end,
  language: "hi-en",
  text: seed.text,
  text_normalized: `${seed.text} ${seed.keywords.join(" ")}`.toLowerCase(),
  embedding: null,
  embedding_model: "google/gemini-embedding-001 (placeholder)",
  segment_hash: `demo-${seed.id}`,
  review_status: "approved",
  is_demo_fixture: true,
}));

export const DEMO_SEGMENT_TOPICS = DEMO_SEEDS.flatMap((seed) =>
  seed.topics.map((topicSlug) => ({ segment_id: seed.id, topic_id: topicSlug, score: 0.82 })),
);

export const TOPICS: Topic[] = [
  {
    id: "naam-jap",
    slug: "naam-jap",
    label_en: "Naam Jap",
    label_hi: "नाम जप",
    blurb: "Daily remembrance, counting practice, steadiness of mind during jap.",
    example_questions: [
      "Naam jap mein mann nahi lagta, kya karun?",
      "How do I keep a fixed daily jap count?",
    ],
  },
  {
    id: "bhakti",
    slug: "bhakti",
    label_en: "Bhakti",
    label_hi: "भक्ति",
    blurb: "Devotional feeling, sincerity, and the inner discipline of love.",
    example_questions: ["Bhakti mein shuruaat kaise karein?"],
  },
  {
    id: "radha-krishna",
    slug: "radha-krishna",
    label_en: "Radha-Krishna",
    label_hi: "राधा-कृष्ण",
    blurb: "Divine union, leela, and the ras tradition of Vrindavan.",
    example_questions: ["Radha naam ka mahatva kya hai?"],
  },
  {
    id: "guru",
    slug: "guru",
    label_en: "Guru",
    label_hi: "गुरु",
    blurb: "Guidance, obedience, and discernment on the path.",
    example_questions: ["Guru ki aavashyakta kyon hoti hai?"],
  },
  {
    id: "family-relationships",
    slug: "family-relationships",
    label_en: "Family & Relationships",
    label_hi: "परिवार व सम्बन्ध",
    blurb: "Marriage, in-laws, duty and expectation inside the household.",
    example_questions: [
      "Ghar mein rozana jhagda hota hai, kya karun?",
      "My marriage feels loveless — what does dharma say?",
    ],
  },
  {
    id: "anger-ego",
    slug: "anger-ego",
    label_en: "Anger & Ego",
    label_hi: "क्रोध व अहंकार",
    blurb: "Krodh, pride, reactivity and the practice of restraint.",
    example_questions: ["Mujhe bahut gussa aata hai, use kaise shant karun?"],
  },
  {
    id: "fear-anxiety",
    slug: "fear-anxiety",
    label_en: "Fear & Anxiety",
    label_hi: "भय व चिन्ता",
    blurb: "Bhay, chinta, restlessness and refuge.",
    example_questions: ["Bhavishya ki chinta se dar lagta hai."],
  },
  {
    id: "career-money",
    slug: "career-money",
    label_en: "Career & Money",
    label_hi: "आजीविका व धन",
    blurb: "Livelihood, effort, contentment and honest earning.",
    example_questions: ["Naukri nahi mil rahi, kya karun?"],
  },
  {
    id: "children-parenting",
    slug: "children-parenting",
    label_en: "Children & Parenting",
    label_hi: "सन्तान व पालन",
    blurb: "Raising children, sanskar, and patience with the young.",
    example_questions: ["Bacchon ko sanskar kaise dein?"],
  },
  {
    id: "character-brahmacharya",
    slug: "character-brahmacharya",
    label_en: "Character / Brahmacharya",
    label_hi: "चरित्र / ब्रह्मचर्य",
    blurb: "Restraint of senses, purity of conduct, breaking harmful habits.",
    example_questions: ["Buri aadat chhodne ka upay?"],
  },
  {
    id: "karma",
    slug: "karma",
    label_en: "Karma",
    label_hi: "कर्म",
    blurb: "Action, consequence, prarabdha and present effort.",
    example_questions: ["Pichhle karmon ka fal kaise katta hai?"],
  },
  {
    id: "death-detachment",
    slug: "death-detachment",
    label_en: "Death & Detachment",
    label_hi: "मृत्यु व वैराग्य",
    blurb: "Impermanence, grief, attachment and letting go.",
    example_questions: ["Kisi apne ke jaane ka dukh kaise saha jaye?"],
  },
  {
    id: "discipline",
    slug: "discipline",
    label_en: "Discipline",
    label_hi: "अनुशासन",
    blurb: "Routine, waking early, consistency of sadhana.",
    example_questions: ["Roz subah uthne ka niyam kaise bane?"],
  },
  {
    id: "forgiveness",
    slug: "forgiveness",
    label_en: "Forgiveness",
    label_hi: "क्षमा",
    blurb: "Letting go of grievance, kshama as strength.",
    example_questions: ["Jisne dhoka diya use kaise kshama karun?"],
  },
  {
    id: "suffering",
    slug: "suffering",
    label_en: "Suffering",
    label_hi: "दुःख",
    blurb: "Pain, illness, loss and the devotional response to hardship.",
    example_questions: ["Itna dukh kyon milta hai?"],
  },
  {
    id: "vrindavan",
    slug: "vrindavan",
    label_en: "Vrindavan",
    label_hi: "वृन्दावन",
    blurb: "The dham, its mahima, seva and pilgrimage conduct.",
    example_questions: ["Vrindavan yatra mein kya dhyan rakhein?"],
  },
];

export const EXAMPLE_PROMPTS: { topic: string; text: string }[] = [
  { topic: "anger-ego", text: "Mujhe baat-baat par gussa aata hai, kaise shant rahun?" },
  { topic: "family-relationships", text: "Ghar mein pati-patni ka rozana jhagda hota hai." },
  { topic: "fear-anxiety", text: "Bhavishya ki chinta se raat ko neend nahi aati." },
  { topic: "career-money", text: "Career mein baar-baar asafalta mil rahi hai." },
  { topic: "death-detachment", text: "Moh aur attachment kaise kam ho?" },
  { topic: "naam-jap", text: "Naam jap karte samay mann bhatakta hai." },
  { topic: "bhakti", text: "Bhakti ki shuruaat kahan se karun?" },
  { topic: "children-parenting", text: "How should parents guide teenagers without anger?" },
  { topic: "discipline", text: "Subah jaldi uthne ka niyam kaise banaye rakhun?" },
  { topic: "karma", text: "Kya prarabdha badla ja sakta hai?" },
  { topic: "suffering", text: "Why does sincere effort still bring suffering?" },
];

export const INGESTION_JOBS: IngestionJob[] = [
  {
    id: "job_1",
    content_item_id: "ci_yt_bm_channel",
    source_id: "src_yt_bhajanmarg",
    kind: "fetch_metadata",
    status: "blocked",
    created_at: "2026-01-14 09:12",
    finished_at: null,
    message: "Blocked: awaiting written permission for transcript storage.",
  },
  {
    id: "job_2",
    content_item_id: "ci_web_bm_articles",
    source_id: "src_web_bhajanmarg",
    kind: "fetch_metadata",
    status: "queued",
    created_at: "2026-01-14 09:20",
    finished_at: null,
    message: "Article index crawl queued (robots.txt respected).",
  },
  {
    id: "job_3",
    content_item_id: "ci_ig_bm_feed",
    source_id: "src_ig_bhajanmarg",
    kind: "transcribe",
    status: "blocked",
    created_at: "2026-01-14 09:25",
    finished_at: null,
    message: "Manual compliant transcript intake required.",
  },
  {
    id: "job_4",
    content_item_id: "ci_demo_fixture",
    source_id: "src_demo_fixture",
    kind: "publish",
    status: "succeeded",
    created_at: "2026-01-14 10:02",
    finished_at: "2026-01-14 10:04",
    message: "Synthetic demo fixture published to sandbox index (5 segments).",
  },
];

export const sourceById = (id: string): Source =>
  [...SOURCES, DEMO_SOURCE].find((s) => s.id === id) ?? DEMO_SOURCE;

export const itemsBySource = (id: string): ContentItem[] =>
  [...CONTENT_ITEMS, DEMO_ITEM].filter((c) => c.source_id === id);

export const topicBySlug = (slug: string): Topic | undefined =>
  TOPICS.find((t) => t.slug === slug);

/** Honest corpus stats: only non-fixture, indexed segments count as real. */
export const CORPUS_STATS = {
  registeredSources: SOURCES.length,
  registeredItems: CONTENT_ITEMS.length,
  indexedRealSegments: 0,
  demoFixtureSegments: DEMO_SEGMENTS.length,
};
