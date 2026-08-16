-- Public, read-only wisdom-library corpus for Bhajan Marg Wisdom AI.
create table public.sources (
  id text primary key,
  name text not null,
  platform text not null,
  url text not null,
  authority text not null default 'OFFICIAL',
  verified boolean not null default false,
  verified_at timestamptz,
  verification_url text,
  reliability text not null default 'unverified',
  description text not null default '',
  usage_notes text not null default '',
  ingestion_permitted text not null default 'requires_permission',
  created_at timestamptz not null default now()
);
grant select on public.sources to anon, authenticated;
grant all on public.sources to service_role;
alter table public.sources enable row level security;
create policy "Sources are publicly readable" on public.sources for select to anon, authenticated using (true);

create table public.content_items (
  id text primary key,
  source_id text not null references public.sources(id) on delete cascade,
  title text not null,
  url text not null,
  published_at timestamptz,
  duration_seconds integer,
  language text not null default 'unknown',
  transcript_status text not null default 'none',
  segmentation_status text not null default 'none',
  embedding_status text not null default 'none',
  review_status text not null default 'not_started',
  fetched_at timestamptz,
  content_hash text,
  usage_notes text not null default '',
  is_demo_fixture boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
create index content_items_source_id_idx on public.content_items (source_id);
grant select on public.content_items to anon, authenticated;
grant all on public.content_items to service_role;
alter table public.content_items enable row level security;
create policy "Content items are publicly readable" on public.content_items for select to anon, authenticated using (true);

create table public.topics (
  id text primary key,
  slug text not null unique,
  label_en text not null,
  label_hi text not null,
  blurb text not null default '',
  example_questions text[] not null default '{}'
);
grant select on public.topics to anon, authenticated;
grant all on public.topics to service_role;
alter table public.topics enable row level security;
create policy "Topics are publicly readable" on public.topics for select to anon, authenticated using (true);

create table public.transcript_segments (
  id text primary key,
  content_item_id text not null references public.content_items(id) on delete cascade,
  seq integer not null,
  start_seconds integer,
  end_seconds integer,
  language text not null default 'unknown',
  text text not null,
  text_normalized text not null default '',
  embedding_model text,
  segment_hash text not null,
  review_status text not null default 'not_started',
  is_demo_fixture boolean not null default false,
  created_at timestamptz not null default now()
);
create index transcript_segments_item_idx on public.transcript_segments (content_item_id, seq);
grant select on public.transcript_segments to anon, authenticated;
grant all on public.transcript_segments to service_role;
alter table public.transcript_segments enable row level security;
create policy "Approved segments are publicly readable" on public.transcript_segments for select to anon, authenticated using (review_status = 'approved');

create table public.segment_topics (
  segment_id text not null references public.transcript_segments(id) on delete cascade,
  topic_id text not null references public.topics(id) on delete cascade,
  score numeric not null default 0,
  primary key (segment_id, topic_id)
);
grant select on public.segment_topics to anon, authenticated;
grant all on public.segment_topics to service_role;
alter table public.segment_topics enable row level security;
create policy "Segment topics are publicly readable" on public.segment_topics for select to anon, authenticated using (true);

create table public.ingestion_jobs (
  id text primary key,
  content_item_id text references public.content_items(id) on delete set null,
  source_id text not null references public.sources(id) on delete cascade,
  kind text not null,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  message text not null default ''
);
grant select on public.ingestion_jobs to anon, authenticated;
grant all on public.ingestion_jobs to service_role;
alter table public.ingestion_jobs enable row level security;
create policy "Ingestion jobs are publicly readable" on public.ingestion_jobs for select to anon, authenticated using (true);

insert into public.sources (id, name, platform, url, authority, verified, verified_at, verification_url, reliability, description, usage_notes, ingestion_permitted, created_at) values
  ('src_yt_bhajanmarg', 'Bhajan Marg (YouTube)', 'youtube', 'https://www.youtube.com/BhajanMarg', 'OFFICIAL', true, null, null, 'high', 'Official authorized YouTube channel publishing satsang recordings and Q&A sessions.', 'Metadata and public captions may be referenced with attribution. Full transcript storage requires written permission from the channel owner.', 'requires_permission', '2026-01-14T00:00:00Z'),
  ('src_yt_radhakripa', 'Shri Hit Radha Kripa (YouTube)', 'youtube', 'https://www.youtube.com/channel/UC_fmMgNql89jbFI8TNcq9Vg', 'OFFICIAL', true, null, null, 'high', 'Official authorized YouTube channel with satsang, bhajan and darshan uploads.', 'Deep links to original videos with timestamps only. No re-hosting of audio or video.', 'requires_permission', '2026-01-14T00:00:00Z'),
  ('src_ig_bhajanmarg', 'Bhajan Marg Official (Instagram)', 'instagram', 'https://www.instagram.com/bhajanmarg_official/', 'OFFICIAL', true, null, null, 'high', 'Official Instagram handle sharing short satsang excerpts and announcements.', 'Platform terms restrict automated scraping. Metadata plus manual transcript intake only, where compliant.', 'metadata_only', '2026-01-14T00:00:00Z'),
  ('src_web_radhakelikunj', 'Shri Hit Radha Keli Kunj (official site)', 'website', 'https://radhakelikunj.com/', 'OFFICIAL', true, null, null, 'high', 'Official ashram website: schedules, seva information, published material and announcements.', 'Public article text may be parsed for indexing with attribution and canonical links back to the site.', 'requires_permission', '2026-01-14T00:00:00Z'),
  ('src_web_bhajanmarg', 'Bhajan Marg articles & blog', 'article', 'https://bhajanmarg.com/', 'OFFICIAL', true, null, null, 'high', 'Written articles and satsang notes published under the Bhajan Marg banner.', 'Article parsing permitted for excerpt-level citation. Store canonical URL and fetch date for every excerpt.', 'requires_permission', '2026-01-14T00:00:00Z'),
  ('src_pub_vaani', 'Published Vaani / books', 'publication', 'https://radhakelikunj.com/published-vaani/', 'OFFICIAL', true, null, null, 'high', 'Officially published Vaani and book listings from the Radha Keli Kunj publications page.', 'Copyrighted publications. Bibliographic reference only unless the publisher grants text licence.', 'metadata_only', '2026-01-14T00:00:00Z'),
  ('src_app_radhakelikunj', 'Radha Keli Kunj official Android app', 'mobile_app', 'https://play.google.com/store/apps/details?id=com.vrindavan_ras_mahima', 'OFFICIAL', true, null, null, 'high', 'Official mobile app listing (Vrindavan Ras Mahima) referenced for schedules and in-app media.', 'Reference and deep link only. No extraction of in-app media.', 'metadata_only', '2026-01-14T00:00:00Z'),
  ('src_demo_fixture', 'Demo fixture corpus (synthetic — not a real source)', 'website', 'about:blank', 'THIRD_PARTY_DISCOVERY', false, null, null, 'unverified', 'Synthetic placeholder text used only to exercise the retrieval, citation and review UI during the MVP demo.', 'Synthetic content. Not attributable to any speaker.', 'yes', '2026-01-14T00:00:00Z')
on conflict (id) do nothing;

insert into public.content_items (id, source_id, title, url, published_at, duration_seconds, language, transcript_status, segmentation_status, embedding_status, review_status, fetched_at, content_hash, usage_notes, is_demo_fixture, notes) values
  ('ci_yt_bm_channel', 'src_yt_bhajanmarg', 'Bhajan Marg — satsang upload feed (channel-level entry)', 'https://www.youtube.com/BhajanMarg', null, null, 'hi', 'none', 'none', 'none', 'not_started', null, null, 'Awaiting written permission before transcript ingestion.', false, 'Registered for ingestion. Individual videos will be enumerated by the metadata job once permission is confirmed.'),
  ('ci_yt_rk_channel', 'src_yt_radhakripa', 'Shri Hit Radha Kripa — satsang upload feed (channel-level entry)', 'https://www.youtube.com/channel/UC_fmMgNql89jbFI8TNcq9Vg', null, null, 'hi', 'none', 'none', 'none', 'not_started', null, null, 'Awaiting written permission before transcript ingestion.', false, null),
  ('ci_ig_bm_feed', 'src_ig_bhajanmarg', 'Bhajan Marg Official — Instagram excerpt feed', 'https://www.instagram.com/bhajanmarg_official/', null, null, 'hi', 'manual_intake_required', 'none', 'none', 'not_started', null, null, 'Manual, compliant transcript intake only.', false, null),
  ('ci_web_rkk_home', 'src_web_radhakelikunj', 'Radha Keli Kunj — official website', 'https://radhakelikunj.com/', null, null, 'hi-en', 'none', 'none', 'none', 'not_started', null, null, 'Article parser configured; not yet run.', false, null),
  ('ci_web_bm_articles', 'src_web_bhajanmarg', 'Bhajan Marg — articles index', 'https://bhajanmarg.com/', null, null, 'hi', 'none', 'none', 'none', 'not_started', null, null, 'Article parser configured; not yet run.', false, null),
  ('ci_pub_vaani', 'src_pub_vaani', 'Published Vaani — publications listing', 'https://radhakelikunj.com/published-vaani/', null, null, 'hi', 'not_permitted', 'none', 'none', 'not_started', null, null, 'Copyrighted print material — bibliographic reference only.', false, null),
  ('ci_app_rkk', 'src_app_radhakelikunj', 'Radha Keli Kunj — official Android app listing', 'https://play.google.com/store/apps/details?id=com.vrindavan_ras_mahima', null, null, 'hi-en', 'not_permitted', 'none', 'none', 'not_started', null, null, 'Reference only.', false, null),
  ('ci_demo_fixture', 'src_demo_fixture', 'Demo fixture transcript (synthetic placeholder, not a satsang)', 'about:blank', '2026-01-14T00:00:00Z', 1800, 'hi-en', 'available', 'done', 'indexed', 'approved', '2026-01-14T00:00:00Z', 'demo-0000000000000000', 'Synthetic demo fixture.', true, null)
on conflict (id) do nothing;

insert into public.topics (id, slug, label_en, label_hi, blurb, example_questions) values
  ('naam-jap', 'naam-jap', 'Naam Jap', 'नाम जप', 'Daily remembrance, counting practice, steadiness of mind during jap.', ARRAY['Naam jap mein mann nahi lagta, kya karun?', 'How do I keep a fixed daily jap count?']::text[]),
  ('bhakti', 'bhakti', 'Bhakti', 'भक्ति', 'Devotional feeling, sincerity, and the inner discipline of love.', ARRAY['Bhakti mein shuruaat kaise karein?']::text[]),
  ('radha-krishna', 'radha-krishna', 'Radha-Krishna', 'राधा-कृष्ण', 'Divine union, leela, and the ras tradition of Vrindavan.', ARRAY['Radha naam ka mahatva kya hai?']::text[]),
  ('guru', 'guru', 'Guru', 'गुरु', 'Guidance, obedience, and discernment on the path.', ARRAY['Guru ki aavashyakta kyon hoti hai?']::text[]),
  ('family-relationships', 'family-relationships', 'Family & Relationships', 'परिवार व सम्बन्ध', 'Marriage, in-laws, duty and expectation inside the household.', ARRAY['Ghar mein rozana jhagda hota hai, kya karun?', 'My marriage feels loveless — what does dharma say?']::text[]),
  ('anger-ego', 'anger-ego', 'Anger & Ego', 'क्रोध व अहंकार', 'Krodh, pride, reactivity and the practice of restraint.', ARRAY['Mujhe bahut gussa aata hai, use kaise shant karun?']::text[]),
  ('fear-anxiety', 'fear-anxiety', 'Fear & Anxiety', 'भय व चिन्ता', 'Bhay, chinta, restlessness and refuge.', ARRAY['Bhavishya ki chinta se dar lagta hai.']::text[]),
  ('career-money', 'career-money', 'Career & Money', 'आजीविका व धन', 'Livelihood, effort, contentment and honest earning.', ARRAY['Naukri nahi mil rahi, kya karun?']::text[]),
  ('children-parenting', 'children-parenting', 'Children & Parenting', 'सन्तान व पालन', 'Raising children, sanskar, and patience with the young.', ARRAY['Bacchon ko sanskar kaise dein?']::text[]),
  ('character-brahmacharya', 'character-brahmacharya', 'Character / Brahmacharya', 'चरित्र / ब्रह्मचर्य', 'Restraint of senses, purity of conduct, breaking harmful habits.', ARRAY['Buri aadat chhodne ka upay?']::text[]),
  ('karma', 'karma', 'Karma', 'कर्म', 'Action, consequence, prarabdha and present effort.', ARRAY['Pichhle karmon ka fal kaise katta hai?']::text[]),
  ('death-detachment', 'death-detachment', 'Death & Detachment', 'मृत्यु व वैराग्य', 'Impermanence, grief, attachment and letting go.', ARRAY['Kisi apne ke jaane ka dukh kaise saha jaye?']::text[]),
  ('discipline', 'discipline', 'Discipline', 'अनुशासन', 'Routine, waking early, consistency of sadhana.', ARRAY['Roz subah uthne ka niyam kaise bane?']::text[]),
  ('forgiveness', 'forgiveness', 'Forgiveness', 'क्षमा', 'Letting go of grievance, kshama as strength.', ARRAY['Jisne dhoka diya use kaise kshama karun?']::text[]),
  ('suffering', 'suffering', 'Suffering', 'दुःख', 'Pain, illness, loss and the devotional response to hardship.', ARRAY['Itna dukh kyon milta hai?']::text[]),
  ('vrindavan', 'vrindavan', 'Vrindavan', 'वृन्दावन', 'The dham, its mahima, seva and pilgrimage conduct.', ARRAY['Vrindavan yatra mein kya dhyan rakhein?']::text[])
on conflict (id) do nothing;

insert into public.transcript_segments (id, content_item_id, seq, start_seconds, end_seconds, language, text, text_normalized, embedding_model, segment_hash, review_status, is_demo_fixture) values
  ('seg_demo_anger', 'ci_demo_fixture', 1, 122, 205, 'hi-en', '[SYNTHETIC DEMO TEXT — not a real transcript] Placeholder passage on anger: the practitioner is advised to notice the first rise of heat, pause the speech, and return attention to remembrance before responding.', '[synthetic demo text — not a real transcript] placeholder passage on anger: the practitioner is advised to notice the first rise of heat, pause the speech, and return attention to remembrance before responding. anger krodh gussa irritation temper ego ahankar', 'google/gemini-embedding-001 (placeholder)', 'demo-seg_demo_anger', 'approved', true),
  ('seg_demo_naamjap', 'ci_demo_fixture', 2, 410, 512, 'hi-en', '[SYNTHETIC DEMO TEXT — not a real transcript] Placeholder passage on naam-jap: a fixed daily count, a fixed seat, and a fixed time are described as the practical supports of steadiness.', '[synthetic demo text — not a real transcript] placeholder passage on naam-jap: a fixed daily count, a fixed seat, and a fixed time are described as the practical supports of steadiness. naam jap japa mala chanting smaran remembrance', 'google/gemini-embedding-001 (placeholder)', 'demo-seg_demo_naamjap', 'approved', true),
  ('seg_demo_family', 'ci_demo_fixture', 3, 730, 861, 'hi-en', '[SYNTHETIC DEMO TEXT — not a real transcript] Placeholder passage on household discord: duty is performed without demand for recognition, and expectation is identified as the root of repeated quarrel.', '[synthetic demo text — not a real transcript] placeholder passage on household discord: duty is performed without demand for recognition, and expectation is identified as the root of repeated quarrel. marriage shaadi family parivaar wife husband conflict saas', 'google/gemini-embedding-001 (placeholder)', 'demo-seg_demo_family', 'approved', true),
  ('seg_demo_fear', 'ci_demo_fixture', 4, 980, 1074, 'hi-en', '[SYNTHETIC DEMO TEXT — not a real transcript] Placeholder passage on fear: attention is turned from the imagined future to the present act of remembrance, and surrender is described as the resting place.', '[synthetic demo text — not a real transcript] placeholder passage on fear: attention is turned from the imagined future to the present act of remembrance, and surrender is described as the resting place. fear dar bhay anxiety chinta worry panic', 'google/gemini-embedding-001 (placeholder)', 'demo-seg_demo_fear', 'approved', true),
  ('seg_demo_karma', 'ci_demo_fixture', 5, 1210, 1301, 'hi-en', '[SYNTHETIC DEMO TEXT — not a real transcript] Placeholder passage on karma: present effort is emphasised over lament for the past, with results left to the divine.', '[synthetic demo text — not a real transcript] placeholder passage on karma: present effort is emphasised over lament for the past, with results left to the divine. karma prarabdha destiny bhagya result fal suffering dukh', 'google/gemini-embedding-001 (placeholder)', 'demo-seg_demo_karma', 'approved', true)
on conflict (id) do nothing;

insert into public.segment_topics (segment_id, topic_id, score) values
  ('seg_demo_anger', 'anger-ego', 0.82),
  ('seg_demo_naamjap', 'naam-jap', 0.82),
  ('seg_demo_family', 'family-relationships', 0.82),
  ('seg_demo_fear', 'fear-anxiety', 0.82),
  ('seg_demo_karma', 'karma', 0.82)
on conflict (segment_id, topic_id) do nothing;

insert into public.ingestion_jobs (id, content_item_id, source_id, kind, status, created_at, finished_at, message) values
  ('job_1', 'ci_yt_bm_channel', 'src_yt_bhajanmarg', 'fetch_metadata', 'blocked', '2026-01-14T09:12:00Z', null, 'Blocked: awaiting written permission for transcript storage.'),
  ('job_2', 'ci_web_bm_articles', 'src_web_bhajanmarg', 'fetch_metadata', 'queued', '2026-01-14T09:20:00Z', null, 'Article index crawl queued (robots.txt respected).'),
  ('job_3', 'ci_ig_bm_feed', 'src_ig_bhajanmarg', 'transcribe', 'blocked', '2026-01-14T09:25:00Z', null, 'Manual compliant transcript intake required.'),
  ('job_4', 'ci_demo_fixture', 'src_demo_fixture', 'publish', 'succeeded', '2026-01-14T10:02:00Z', '2026-01-14T10:04:00Z', 'Synthetic demo fixture published to sandbox index (5 segments).')
on conflict (id) do nothing;