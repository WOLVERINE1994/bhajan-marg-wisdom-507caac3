import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Search } from "lucide-react";
import { useState } from "react";

import { AuthorityBadge, StatusPill } from "@/components/badges";
import { CitationCard } from "@/components/answer-card";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_ITEM, DEMO_SOURCE } from "@/data/registry";
import type { RetrievedCitation } from "@/data/types";
import { findOriginalMoments, retrieveSegments, type SatsangMoment } from "@/lib/rag";
import { trackSourceView } from "@/lib/local-store";

export const Route = createFileRoute("/finder")({
  head: () => ({
    meta: [
      { title: "Original Satsang Finder — Bhajan Marg Wisdom AI" },
      {
        name: "description",
        content:
          "Search a life question and see relevant source moments and official destinations before any AI synthesis is produced.",
      },
      { property: "og:title", content: "Original Satsang Finder — Bhajan Marg Wisdom AI" },
      {
        property: "og:description",
        content: "Retrieval-first search: original sources come before any generated answer.",
      },
    ],
  }),
  component: FinderPage,
});

function FinderPage() {
  const [query, setQuery] = useState("");
  const [moments, setMoments] = useState<SatsangMoment[] | null>(null);
  const [indexed, setIndexed] = useState<RetrievedCitation[]>([]);

  const run = () => {
    const q = query.trim();
    if (!q) return;
    setMoments(findOriginalMoments(q));
    setIndexed(
      retrieveSegments(q, true).map((h, i) => ({
        citation: {
          id: `find_${h.segment.id}_${i}`,
          segment_id: h.segment.id,
          content_item_id: h.segment.content_item_id,
          source_id: DEMO_SOURCE.id,
          quote: h.segment.text,
          start_seconds: h.segment.start_seconds,
          end_seconds: h.segment.end_seconds,
          score: h.score,
          validated: true,
        },
        segment: h.segment,
        item: DEMO_ITEM,
        source: DEMO_SOURCE,
      })),
    );
  };

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Original satsang finder
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Sources first, synthesis later. Describe your situation and this page points you to the
          indexed moments and official destinations most likely to address it — with no generated
          answer at all.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="Ghar mein kalah rehta hai / I feel constant anxiety about money"
          />
          <Button onClick={run} disabled={!query.trim()}>
            <Search className="mr-1.5 size-4" /> Khojein
          </Button>
        </div>

        {moments && (
          <div className="mt-10 space-y-8">
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Indexed moments ({indexed.length})
              </h2>
              {indexed.length ? (
                <div className="mt-4 grid gap-3">
                  {indexed.map((c) => (
                    <CitationCard key={c.citation.id} c={c} />
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm leading-relaxed text-foreground">
                  No indexed satsang moment matched. No transcripts from the official sources have
                  been ingested yet, so no timestamped moment can honestly be offered. Use the
                  official destinations below.
                </p>
              )}
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Where to look in the official sources
              </h2>
              {moments[0]?.topics.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">Likely themes:</span>
                  {moments[0].topics.map((t) => (
                    <StatusPill key={t} label={t} />
                  ))}
                </div>
              ) : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {moments.map((m) => (
                  <article key={m.source.id} className="card-elevated flex flex-col p-4">
                    <AuthorityBadge authority={m.source.authority} />
                    <h3 className="mt-3 font-display text-base font-semibold text-foreground">
                      {m.source.name}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {m.reason}
                    </p>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="mt-4 w-fit"
                      onClick={() =>
                        trackSourceView({
                          id: m.source.id,
                          title: m.source.name,
                          url: m.url,
                          platform: m.source.platform,
                        })
                      }
                    >
                      <a href={m.url} target="_blank" rel="noopener noreferrer">
                        Open original <ExternalLink className="ml-1.5 size-3.5" />
                      </a>
                    </Button>
                  </article>
                ))}
              </div>
            </section>

            <p className="text-sm text-muted-foreground">
              Want a labelled synthesis of what was retrieved?{" "}
              <Link to="/ask" search={{ q: query }} className="text-primary hover:underline">
                Continue on the Ask page
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
