import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { LibraryErrorState, LibraryNotFoundState } from "@/components/library-states";
import { SiteShell } from "@/components/site-shell";
import { Input } from "@/components/ui/input";
import { wisdomLibraryQuery } from "@/lib/library-query";

export const Route = createFileRoute("/topics")({
  head: () => ({
    meta: [
      { title: "Topic Library — Bhajan Marg Wisdom AI" },
      {
        name: "description",
        content:
          "Browse sixteen satsang themes: naam jap, bhakti, family, anger, fear, karma, suffering, Vrindavan and more, each with example questions.",
      },
      { property: "og:title", content: "Topic Library — Bhajan Marg Wisdom AI" },
      {
        property: "og:description",
        content:
          "Sixteen curated themes from commonly asked satsang questions, each linking into cited retrieval.",
      },
    ],
  }),
  component: TopicsPage,
});

function TopicsPage() {
  const [query, setQuery] = useState("");
  const filtered = TOPICS.filter((t) =>
    `${t.label_en} ${t.label_hi} ${t.blurb}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
        <h1 className="font-display text-3xl font-semibold text-foreground">Topic library</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Themes used to classify transcript segments (`segment_topics`) and to steer retrieval.
          Selecting a question takes you to the Ask page with retrieval already framed.
        </p>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics — anger, naam jap, parivaar…"
          className="mt-6 max-w-md"
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <article key={t.slug} className="card-elevated flex flex-col p-5">
              <p className="font-deva text-sm text-primary">{t.label_hi}</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-foreground">
                {t.label_en}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.blurb}</p>
              <ul className="mt-4 space-y-2">
                {t.example_questions.map((qq) => (
                  <li key={qq}>
                    <Link
                      to="/ask"
                      search={{ q: qq }}
                      className="block rounded-md border border-border/70 bg-muted/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {qq}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {!filtered.length && (
          <p className="mt-10 text-sm text-muted-foreground">No topic matched that search.</p>
        )}
      </div>
    </SiteShell>
  );
}
