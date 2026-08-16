import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { AuthorityBadge, StatusPill } from "@/components/badges";
import { LibraryErrorState, LibraryNotFoundState } from "@/components/library-states";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { wisdomLibraryQuery } from "@/lib/library-query";
import type { Platform } from "@/data/types";
import { trackSourceView, useRecentSources } from "@/lib/local-store";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: "Source Library — Bhajan Marg Wisdom AI" },
      {
        name: "description",
        content:
          "The verified registry of official YouTube channels, Instagram, Radha Keli Kunj, Bhajan Marg articles, published Vaani and the official app, with usage notes and ingestion status.",
      },
      { property: "og:title", content: "Source Library — Bhajan Marg Wisdom AI" },
      {
        property: "og:description",
        content:
          "Official versus third-party discovery sources, copyright notes, and honest per-item ingestion status.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(wisdomLibraryQuery),
  errorComponent: LibraryErrorState,
  notFoundComponent: LibraryNotFoundState,
  component: SourcesPage,
});

const FILTERS: { key: Platform | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "youtube", label: "Official YouTube" },
  { key: "instagram", label: "Official Instagram" },
  { key: "website", label: "Radha Keli Kunj site" },
  { key: "article", label: "Bhajan Marg articles" },
  { key: "publication", label: "Publications / books" },
  { key: "mobile_app", label: "Official app" },
];

function SourcesPage() {
  const [filter, setFilter] = useState<Platform | "all">("all");
  const [officialOnly, setOfficialOnly] = useState(true);
  const { items: recent, clear } = useRecentSources();

  const sources = SOURCES.filter(
    (s) =>
      (filter === "all" || s.platform === filter) &&
      (!officialOnly || s.authority === "OFFICIAL"),
  );

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
        <h1 className="font-display text-3xl font-semibold text-foreground">Source library</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every source is labelled OFFICIAL or THIRD-PARTY DISCOVERY, with recorded copyright and
          usage notes. Ingestion status is shown honestly — nothing here is marked indexed unless it
          truly is.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                filter === f.key
                  ? "border-primary/50 bg-primary/12 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setOfficialOnly((v) => !v)}
            className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
              officialOnly
                ? "border-success/50 bg-success/10 text-success"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {officialOnly ? "Official only" : "Including third-party"}
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {sources.map((s) => {
            const items = CONTENT_ITEMS.filter((c) => c.source_id === s.id);
            return (
              <article key={s.id} className="card-elevated p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <AuthorityBadge authority={s.authority} />
                  <StatusPill label={s.platform.replace("_", " ")} />
                  <StatusPill
                    label={`reliability: ${s.reliability}`}
                    tone={s.reliability === "high" ? "good" : "warn"}
                  />
                  <StatusPill
                    label={`ingestion: ${s.ingestion_permitted.replace(/_/g, " ")}`}
                    tone={s.ingestion_permitted === "yes" ? "good" : "warn"}
                  />
                </div>
                <h2 className="mt-3 font-display text-xl font-semibold text-foreground">
                  {s.name}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                <p className="mt-3 rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Usage &amp; copyright: </span>
                  {s.usage_notes}
                </p>

                {items.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {items.map((c) => (
                      <li
                        key={c.id}
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-xs"
                      >
                        <span className="text-foreground">{c.title}</span>
                        <StatusPill
                          label={`transcript: ${c.transcript_status.replace(/_/g, " ")}`}
                          tone={c.transcript_status === "available" ? "good" : "warn"}
                        />
                        <StatusPill label={`lang: ${c.language}`} />
                        <StatusPill
                          label={`embeddings: ${c.embedding_status}`}
                          tone={c.embedding_status === "indexed" ? "good" : "neutral"}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      trackSourceView({
                        id: s.id,
                        title: s.name,
                        url: s.url,
                        platform: s.platform,
                      })
                    }
                  >
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      Open original <ExternalLink className="ml-1.5 size-3.5" />
                    </a>
                  </Button>
                  <span className="truncate text-xs text-muted-foreground">{s.url}</span>
                </div>
              </article>
            );
          })}
        </div>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Recently viewed sources
            </h2>
            {recent.length > 0 && (
              <Button size="sm" variant="ghost" onClick={clear}>
                Clear
              </Button>
            )}
          </div>
          {recent.length ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {recent.map((r) => (
                <li key={r.id} className="card-elevated flex items-center gap-3 p-3 text-xs">
                  <StatusPill label={r.platform.replace("_", " ")} />
                  <span className="truncate text-foreground">{r.title}</span>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-primary hover:underline"
                  >
                    Open
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing yet — opening a source stores it locally in your browser.
            </p>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
