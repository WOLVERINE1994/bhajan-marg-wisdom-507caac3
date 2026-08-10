import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Compass, ShieldCheck } from "lucide-react";

import { AuthorityBadge } from "@/components/badges";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { CORPUS_STATS, EXAMPLE_PROMPTS, SOURCES, TOPICS } from "@/data/registry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bhajan Marg Wisdom AI — Source-Grounded Satsang Study" },
      {
        name: "description",
        content:
          "Ask life and spiritual questions and receive answers grounded in indexed public satsang sources, with citations, timestamps and links to the originals.",
      },
      { property: "og:title", content: "Bhajan Marg Wisdom AI — Source-Grounded Satsang Study" },
      {
        property: "og:description",
        content:
          "Source-grounded RAG over publicly available teachings. Every answer is labelled and cited. Not affiliated with or representing Maharaj Ji.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteShell>
      <section className="paper-wash relative overflow-hidden border-b border-border/60">
        <div className="mx-auto w-full max-w-4xl px-4 py-20 text-center sm:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Vrindavan · Source-grounded study
          </p>
          <h1 className="mt-5 font-deva text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
            आपका सवाल। स्रोत से जुड़ी शिक्षा।
          </h1>
          <p className="mt-2 font-display text-xl text-muted-foreground sm:text-2xl">
            Aapka sawaal. Srot se judi shiksha.
          </p>
          <div className="gold-rule mx-auto mt-8 w-40" />
          <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Ask a question about anger, family, fear, livelihood, attachment or sadhana. The system
            first retrieves relevant moments from indexed public satsangs, then either shows a short
            verbatim excerpt or a clearly-labelled AI synthesis built only from those citations. If
            the sources do not clearly address your question, it says so instead of guessing.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/ask">
                Sawaal poochhein <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/finder">Find the original satsang</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            {CORPUS_STATS.registeredSources} official sources registered ·{" "}
            {CORPUS_STATS.indexedRealSegments} transcripts indexed so far — answers will show
            “insufficient source evidence” until ingestion is authorised and run.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-14 sm:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Never in his voice",
            body: "The tool does not impersonate Maharaj Ji, imitate his personality, or claim official affiliation. Answers are labelled AI-generated synthesis based on cited teachings.",
          },
          {
            icon: BookOpen,
            title: "Citations before answers",
            body: "Retrieval runs first. Every claim carries a source card with title, platform, URL, date and timestamp where available.",
          },
          {
            icon: Compass,
            title: "Verify at the origin",
            body: "Each card links straight to the original recording or article so you can hear the teaching for yourself.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <article key={title} className="card-elevated p-6">
            <Icon className="size-5 text-primary" />
            <h2 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </article>
        ))}
      </section>

      <section className="border-y border-border/60 bg-paper-deep/50 py-14">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Log kya poochhte hain
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hindi, Hinglish or English — ask in whatever feels natural.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.slice(0, 8).map((p) => (
              <Link
                key={p.text}
                to="/ask"
                search={{ q: p.text }}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {p.text}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Topic library</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sixteen themes drawn from commonly asked satsang questions.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/topics">All topics</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.slice(0, 8).map((t) => (
            <Link
              key={t.slug}
              to="/topics"
              className="card-elevated p-4 transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <p className="font-deva text-sm text-primary">{t.label_hi}</p>
              <p className="mt-1 font-display text-base font-semibold text-foreground">
                {t.label_en}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 bg-paper-deep/50 py-14">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Registered official sources
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Verified public destinations. Metadata only until ingestion permission is confirmed.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {SOURCES.map((s) => (
              <div key={s.id} className="card-elevated flex flex-col gap-2 p-4">
                <AuthorityBadge authority={s.authority} />
                <p className="font-display text-base font-semibold text-foreground">{s.name}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{s.description}</p>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto truncate text-xs text-primary underline-offset-4 hover:underline"
                >
                  {s.url}
                </a>
              </div>
            ))}
          </div>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/sources">Open source library</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
