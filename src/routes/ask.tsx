import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { z } from "zod";

import { AnswerCard } from "@/components/answer-card";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { EXAMPLE_PROMPTS } from "@/data/registry";
import { LibraryErrorState, LibraryNotFoundState } from "@/components/library-states";
import { wisdomLibraryQuery } from "@/lib/library-query";
import type { GeneratedAnswer } from "@/data/types";
import { generateAnswer } from "@/lib/rag";

export const Route = createFileRoute("/ask")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Ask — Bhajan Marg Wisdom AI" },
      {
        name: "description",
        content:
          "Ask in Hindi, Hinglish or English and receive a cited, clearly-labelled answer grounded in indexed public satsang sources.",
      },
      { property: "og:title", content: "Ask — Bhajan Marg Wisdom AI" },
      {
        property: "og:description",
        content:
          "Retrieval first, then a labelled synthesis. No invented quotes, no impersonation, always a link to the original.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(wisdomLibraryQuery),
  errorComponent: LibraryErrorState,
  notFoundComponent: LibraryNotFoundState,
  component: AskPage,
});

interface Turn {
  answer: GeneratedAnswer;
}

function AskPage() {
  const { q } = Route.useSearch();
  const { data: library } = useSuspenseQuery(wisdomLibraryQuery);
  const indexedRealSegments = library.transcriptSegments.filter((s) => !s.is_demo_fixture).length;
  const [input, setInput] = useState(q ?? "");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const submit = (text: string) => {
    const question = text.trim();
    if (!question) return;
    setLoading(true);
    setInput("");
    window.setTimeout(() => {
      setTurns((prev) => [{ answer: generateAnswer(question, demoMode, library) }, ...prev]);
      setLoading(false);
    }, 420);
  };

  useEffect(() => {
    if (q) setInput(q);
  }, [q]);

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="font-display text-3xl font-semibold text-foreground">Poochhein</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Hindi, Hinglish ya English — jaise aapko sahaj lage. Retrieval pehle chalta hai; uske baad
          hi koi uttar banta hai.
        </p>

        <div className="card-elevated mt-6 p-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            rows={3}
            placeholder="Jaise: Mujhe baat-baat par gussa aata hai, kaise shant rahun?"
            className="resize-none border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={demoMode} onCheckedChange={setDemoMode} />
              Include synthetic demo fixtures (to preview citation UI)
            </label>
            <Button onClick={() => submit(input)} disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 size-4" />
              )}
              Bhejein
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs leading-relaxed text-foreground">
          Knowledge base status: {indexedRealSegments} transcript segments indexed from
          official sources. Until ingestion is authorised and run, real-source questions will
          correctly return <strong>insufficient source evidence</strong>. Turn on demo fixtures to
          preview how cited answers render — those fixtures are synthetic and are never attributed to
          Maharaj Ji.
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Example prompts
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p.text}
                onClick={() => submit(p.text)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {p.text}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {turns.map((t) => (
            <AnswerCard key={t.answer.id} answer={t.answer} />
          ))}
        </div>

        {!turns.length && (
          <div className="mt-10 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="font-display text-lg text-foreground">Koi uttar abhi tak nahi</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Ask a question above, or use the{" "}
              <Link to="/finder" className="text-primary hover:underline">
                Original Satsang Finder
              </Link>{" "}
              to go straight to the official sources.
            </p>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
