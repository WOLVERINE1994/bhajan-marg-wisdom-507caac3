import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { StatusPill } from "@/components/badges";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { useRecentSources, useSavedGuidance } from "@/lib/local-store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Guidance — Bhajan Marg Wisdom AI" },
      {
        name: "description",
        content:
          "Your saved answers and recently viewed satsang sources, stored locally in your own browser.",
      },
      { property: "og:title", content: "Saved Guidance — Bhajan Marg Wisdom AI" },
      {
        property: "og:description",
        content: "Keep cited answers and sources for later study. Stored on your device only.",
      },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const saved = useSavedGuidance();
  const recent = useRecentSources();

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <h1 className="font-display text-3xl font-semibold text-foreground">Saved guidance</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Stored locally in this browser only. Nothing is uploaded.
        </p>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Answers ({saved.items.length})
            </h2>
            {saved.items.length > 0 && (
              <Button size="sm" variant="ghost" onClick={saved.clear}>
                Clear all
              </Button>
            )}
          </div>

          {saved.items.length ? (
            <div className="mt-4 space-y-3">
              {saved.items.map((s) => (
                <article key={s.id} className="card-elevated p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill
                      label={s.mode.replace(/_/g, " ")}
                      tone={s.mode === "INSUFFICIENT_SOURCE_EVIDENCE" ? "warn" : "good"}
                    />
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.savedAt).toLocaleString()}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-auto"
                      aria-label="Remove"
                      onClick={() => saved.remove(s.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <p className="mt-3 font-display text-lg text-foreground">{s.question}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                  {s.citationTitles.length > 0 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Cited: {s.citationTitles.join(" · ")}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nothing saved yet.{" "}
              <Link to="/ask" className="text-primary hover:underline">
                Ask a question
              </Link>{" "}
              and tap Save on an answer.
            </p>
          )}
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Recently viewed sources ({recent.items.length})
            </h2>
            {recent.items.length > 0 && (
              <Button size="sm" variant="ghost" onClick={recent.clear}>
                Clear
              </Button>
            )}
          </div>
          {recent.items.length ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {recent.items.map((r) => (
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
            <p className="mt-4 text-sm text-muted-foreground">No sources opened yet.</p>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
