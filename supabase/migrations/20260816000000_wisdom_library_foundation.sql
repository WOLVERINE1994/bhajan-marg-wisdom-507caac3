-- Bhajan Marg Wisdom library foundation
-- Metadata is public only after verification; teaching text is public only after review.

create extension if not exists vector with schema extensions;

create table if not exists public.sources (
  id text primary key,
  name text not null,
  platform text not null check (platform in ('youtube','instagram','website','article','publication','mobile_app')),
  url text not null unique,
  authority text not null check (authority in ('OFFICIAL','THIRD_PARTY_DISCOVERY')),
  verified boolean not null default false,
  verified_at timestamptz,
  verification_url text,
  reliability text not null check (reliability in ('high','medium','unverified')),
  description text not null default '',
  usage_notes text not null default '',
  ingestion_permitted text not null check (ingestion_permitted in ('yes','metadata_only','requires_permission')),
  created_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id text primary key,
  source_id text not null references public.sources(id) on delete cascade,
  title text not null,
  url text not null unique,
  published_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  language text not null check (language in ('hi','en','hi-en','sa','unknown')),
  transcript_status text not null check (transcript_status in ('none','queued','fetching','available','manual_intake_required','not_permitted')),
  segmentation_status text not null check (segmentation_status in ('none','queued','running','done','failed')),
  embedding_status text not null check (embedding_status in ('none','queued','running','indexed','failed')),
  review_status text not null check (review_status in ('not_started','pending_review','changes_requested','approved','rejected')),
  fetched_at timestamptz,
  content_hash text unique,
  usage_notes text not null default '',
  is_demo_fixture boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.transcript_segments (
  id text primary key,
  content_item_id text not null references public.content_items(id) on delete cascade,
  seq integer not null check (seq > 0),
  start_seconds integer check (start_seconds is null or start_seconds >= 0),
  end_seconds integer check (end_seconds is null or end_seconds >= start_seconds),
  language text not null check (language in ('hi','en','hi-en','sa','unknown')),
  text text not null,
  text_normalized text not null,
  embedding extensions.vector(3072),
  embedding_model text,
  segment_hash text not null unique,
  review_status text not null check (review_status in ('not_started','pending_review','changes_requested','approved','rejected')),
  is_demo_fixture boolean not null default false,
  created_at timestamptz not null default now(),
  unique (content_item_id, seq)
);

create table if not exists public.topics (
  id text primary key,
  slug text not null unique,
  label_en text not null,
  label_hi text not null,
  blurb text not null default '',
  example_questions text[] not null default '{}'
);

create table if not exists public.segment_topics (
  segment_id text not null references public.transcript_segments(id) on delete cascade,
  topic_id text not null references public.topics(id) on delete cascade,
  score double precision not null check (score between 0 and 1),
  primary key (segment_id, topic_id)
);

create table if not exists public.qa_pairs (
  id text primary key,
  content_item_id text not null references public.content_items(id) on delete cascade,
  question_text text not null,
  answer_text text not null,
  segment_ids text[] not null default '{}',
  language text not null check (language in ('hi','en','hi-en','sa','unknown')),
  review_status text not null check (review_status in ('not_started','pending_review','changes_requested','approved','rejected')),
  is_demo_fixture boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.citations (
  id text primary key,
  segment_id text not null references public.transcript_segments(id) on delete cascade,
  content_item_id text not null references public.content_items(id) on delete cascade,
  source_id text not null references public.sources(id) on delete cascade,
  quote text not null,
  start_seconds integer check (start_seconds is null or start_seconds >= 0),
  end_seconds integer check (end_seconds is null or end_seconds >= start_seconds),
  score double precision not null check (score between 0 and 1),
  validated boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ingestion_jobs (
  id text primary key,
  content_item_id text references public.content_items(id) on delete cascade,
  source_id text not null references public.sources(id) on delete cascade,
  kind text not null check (kind in ('fetch_metadata','transcribe','segment_qa','embed','review','publish')),
  status text not null check (status in ('queued','running','succeeded','failed','blocked')),
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  message text not null default ''
);

create table if not exists public.answer_audits (
  id text primary key,
  question text not null,
  detected_language text not null check (detected_language in ('hi','en','hi-en','sa','unknown')),
  mode text not null check (mode in ('DIRECT_TEACHING','SYNTHESIZED_FROM_TEACHINGS','INSUFFICIENT_SOURCE_EVIDENCE')),
  confidence double precision not null check (confidence between 0 and 1),
  citation_ids text[] not null default '{}',
  retrieved_segment_ids text[] not null default '{}',
  safety_flags text[] not null default '{}',
  model text,
  created_at timestamptz not null default now()
);

create index if not exists content_items_source_idx on public.content_items(source_id);
create index if not exists transcript_segments_item_idx on public.transcript_segments(content_item_id, seq);
create index if not exists transcript_segments_normalized_idx on public.transcript_segments using gin (to_tsvector('simple', text_normalized));
create index if not exists transcript_segments_embedding_hnsw_idx on public.transcript_segments
  using hnsw ((embedding::extensions.halfvec(3072)) extensions.halfvec_cosine_ops)
  where embedding is not null;
create index if not exists segment_topics_topic_idx on public.segment_topics(topic_id, score desc);
create index if not exists ingestion_jobs_status_idx on public.ingestion_jobs(status, created_at);
create index if not exists answer_audits_created_idx on public.answer_audits(created_at desc);

alter table public.sources enable row level security;
alter table public.content_items enable row level security;
alter table public.transcript_segments enable row level security;
alter table public.topics enable row level security;
alter table public.segment_topics enable row level security;
alter table public.qa_pairs enable row level security;
alter table public.citations enable row level security;
alter table public.ingestion_jobs enable row level security;
alter table public.answer_audits enable row level security;

create policy "public reads verified sources" on public.sources for select to anon, authenticated using (verified);
create policy "public reads verified source metadata" on public.content_items for select to anon, authenticated
  using (not is_demo_fixture and exists (select 1 from public.sources s where s.id = source_id and s.verified));
create policy "public reads topics" on public.topics for select to anon, authenticated using (true);
create policy "public reads approved segments" on public.transcript_segments for select to anon, authenticated
  using (review_status = 'approved' and not is_demo_fixture);
create policy "public reads approved segment topics" on public.segment_topics for select to anon, authenticated
  using (exists (select 1 from public.transcript_segments ts where ts.id = segment_id and ts.review_status = 'approved' and not ts.is_demo_fixture));
create policy "public reads approved qa" on public.qa_pairs for select to anon, authenticated
  using (review_status = 'approved' and not is_demo_fixture);
create policy "public reads validated citations" on public.citations for select to anon, authenticated
  using (validated and exists (select 1 from public.transcript_segments ts where ts.id = segment_id and ts.review_status = 'approved' and not ts.is_demo_fixture));

revoke all on public.sources, public.content_items, public.transcript_segments, public.topics,
  public.segment_topics, public.qa_pairs, public.citations, public.ingestion_jobs,
  public.answer_audits from anon, authenticated;
grant select on public.sources, public.content_items, public.transcript_segments, public.topics,
  public.segment_topics, public.qa_pairs, public.citations, public.ingestion_jobs to anon, authenticated;

-- Operational jobs and audits deliberately have no public policy. The service role
-- bypasses RLS for trusted ingestion/admin servers; no client may insert or mutate rows.

insert into public.sources
  (id, name, platform, url, authority, verified, verified_at, verification_url, reliability, description, usage_notes, ingestion_permitted, created_at)
values
  ('src_yt_bhajanmarg', 'Bhajan Marg (YouTube)', 'youtube', 'https://www.youtube.com/@BhajanMarg', 'OFFICIAL', true, '2026-08-16', 'https://radhakelikunj.com/official-youtube-channels/', 'high', 'Official authorized YouTube channel publishing satsang recordings and Q&A sessions.', 'Metadata and canonical links only until transcript-storage permission is recorded.', 'requires_permission', '2026-08-16'),
  ('src_yt_radhakripa', 'Shri Hit Radha Kripa (YouTube)', 'youtube', 'https://www.youtube.com/channel/UC_fmMgNql89jbFI8TNcq9Vg', 'OFFICIAL', true, '2026-08-16', 'https://radhakelikunj.com/official-youtube-channels/', 'high', 'Official YouTube channel listed by Shri Hit Radha Keli Kunj.', 'Deep links only; do not re-host audio or video.', 'requires_permission', '2026-08-16'),
  ('src_ig_bhajanmarg', 'Bhajan Marg Official (Instagram)', 'instagram', 'https://www.instagram.com/bhajanmarg_official/', 'OFFICIAL', true, '2026-08-16', 'https://radhakelikunj.com/', 'high', 'Official Instagram handle for satsang excerpts and announcements.', 'Metadata and compliant manual intake only; no automated scraping.', 'metadata_only', '2026-08-16'),
  ('src_web_radhakelikunj', 'Shri Hit Radha Keli Kunj', 'website', 'https://radhakelikunj.com/', 'OFFICIAL', true, '2026-08-16', 'https://radhakelikunj.com/', 'high', 'Official ashram website for schedules, publications, media and announcements.', 'Keep canonical attribution; obtain permission before storing substantial text.', 'requires_permission', '2026-08-16'),
  ('src_pub_vaani', 'Bhajan Marg Publications', 'publication', 'https://radhakelikunj.com/published-vaani/', 'OFFICIAL', true, '2026-08-16', 'https://radhakelikunj.com/', 'high', 'Official publication and Vaani catalogue.', 'Bibliographic metadata only unless the publisher grants a text licence.', 'metadata_only', '2026-08-16'),
  ('src_app_radhakelikunj', 'Radha Keli Kunj official Android app', 'mobile_app', 'https://play.google.com/store/apps/details?id=com.vrindavan_ras_mahima', 'OFFICIAL', true, '2026-08-16', 'https://radhakelikunj.com/contact/', 'high', 'Official app linked by Shri Hit Radha Keli Kunj.', 'Reference and deep link only; no extraction of in-app media.', 'metadata_only', '2026-08-16')
on conflict (id) do update set
  name = excluded.name, url = excluded.url, verified = excluded.verified,
  verified_at = excluded.verified_at, verification_url = excluded.verification_url,
  description = excluded.description, usage_notes = excluded.usage_notes;

insert into public.content_items
  (id, source_id, title, url, language, transcript_status, segmentation_status, embedding_status, review_status, usage_notes, is_demo_fixture, notes)
values
  ('ci_yt_bm_channel', 'src_yt_bhajanmarg', 'Bhajan Marg — satsang upload feed', 'https://www.youtube.com/@BhajanMarg', 'hi', 'none', 'none', 'none', 'not_started', 'Verified channel metadata only; awaiting transcript permission.', false, 'Channel-level pointer.'),
  ('ci_yt_rk_channel', 'src_yt_radhakripa', 'Shri Hit Radha Kripa — upload feed', 'https://www.youtube.com/channel/UC_fmMgNql89jbFI8TNcq9Vg', 'hi', 'none', 'none', 'none', 'not_started', 'Verified channel metadata only; awaiting transcript permission.', false, 'Channel-level pointer.'),
  ('ci_ig_bm_feed', 'src_ig_bhajanmarg', 'Bhajan Marg Official — Instagram feed', 'https://www.instagram.com/bhajanmarg_official/', 'hi', 'manual_intake_required', 'none', 'none', 'not_started', 'Manual compliant transcript intake only.', false, 'Feed-level pointer.'),
  ('ci_web_rkk_home', 'src_web_radhakelikunj', 'Radha Keli Kunj — official website', 'https://radhakelikunj.com/', 'hi-en', 'none', 'none', 'none', 'not_started', 'Verified site metadata only.', false, 'Site-level pointer.'),
  ('ci_pub_vaani', 'src_pub_vaani', 'Published Vaani — publications listing', 'https://radhakelikunj.com/published-vaani/', 'hi', 'not_permitted', 'none', 'none', 'not_started', 'Copyrighted print material; bibliographic reference only.', false, 'Catalogue-level pointer.'),
  ('ci_app_rkk', 'src_app_radhakelikunj', 'Radha Keli Kunj — official Android app', 'https://play.google.com/store/apps/details?id=com.vrindavan_ras_mahima', 'hi-en', 'not_permitted', 'none', 'none', 'not_started', 'Reference only.', false, 'Store-listing pointer.')
on conflict (id) do update set title = excluded.title, url = excluded.url, usage_notes = excluded.usage_notes, notes = excluded.notes;

insert into public.topics (id, slug, label_en, label_hi, blurb, example_questions) values
  ('naam-jap','naam-jap','Naam Jap','नाम जप','Daily remembrance, counting practice, and steadiness during jap.',array['Naam jap mein mann nahi lagta, kya karun?']),
  ('bhakti','bhakti','Bhakti','भक्ति','Devotional feeling, sincerity, and the inner discipline of love.',array['Bhakti mein shuruaat kaise karein?']),
  ('radha-krishna','radha-krishna','Radha-Krishna','राधा-कृष्ण','Divine union, leela, and the ras tradition of Vrindavan.',array['Radha naam ka mahatva kya hai?']),
  ('guru','guru','Guru','गुरु','Guidance, obedience, and discernment on the path.',array['Guru ki aavashyakta kyon hoti hai?']),
  ('family-relationships','family-relationships','Family & Relationships','परिवार व सम्बन्ध','Marriage, family duty, and expectation in the household.',array['Ghar mein rozana jhagda hota hai, kya karun?']),
  ('anger-ego','anger-ego','Anger & Ego','क्रोध व अहंकार','Krodh, pride, reactivity, and restraint.',array['Mujhe bahut gussa aata hai, kya karun?']),
  ('fear-anxiety','fear-anxiety','Fear & Anxiety','भय व चिन्ता','Bhay, chinta, restlessness, and refuge.',array['Bhavishya ki chinta se dar lagta hai.']),
  ('career-money','career-money','Career & Money','आजीविका व धन','Livelihood, effort, contentment, and honest earning.',array['Naukri nahi mil rahi, kya karun?']),
  ('children-parenting','children-parenting','Children & Parenting','सन्तान व पालन','Raising children, sanskar, and patience.',array['Bacchon ko sanskar kaise dein?']),
  ('character-brahmacharya','character-brahmacharya','Character / Brahmacharya','चरित्र / ब्रह्मचर्य','Restraint of senses, pure conduct, and breaking harmful habits.',array['Buri aadat chhodne ka upay?']),
  ('karma','karma','Karma','कर्म','Action, consequence, prarabdha, and present effort.',array['Pichhle karmon ka fal kaise katta hai?']),
  ('death-detachment','death-detachment','Death & Detachment','मृत्यु व वैराग्य','Impermanence, grief, attachment, and letting go.',array['Kisi apne ke jaane ka dukh kaise saha jaye?']),
  ('discipline','discipline','Discipline','अनुशासन','Routine and consistency of sadhana.',array['Roz subah uthne ka niyam kaise bane?']),
  ('forgiveness','forgiveness','Forgiveness','क्षमा','Letting go of grievance and kshama as strength.',array['Jisne dhoka diya use kaise kshama karun?']),
  ('suffering','suffering','Suffering','दुःख','Pain, loss, and the devotional response to hardship.',array['Itna dukh kyon milta hai?']),
  ('vrindavan','vrindavan','Vrindavan','वृन्दावन','The dham, its mahima, seva, and pilgrimage conduct.',array['Vrindavan yatra mein kya dhyan rakhein?'])
on conflict (id) do update set label_en = excluded.label_en, label_hi = excluded.label_hi, blurb = excluded.blurb, example_questions = excluded.example_questions;

comment on table public.answer_audits is 'Private trust and safety audit log; service-role access only.';
comment on table public.ingestion_jobs is 'Private operational queue; service-role access only.';
