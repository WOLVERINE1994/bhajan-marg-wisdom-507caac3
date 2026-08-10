import { Bookmark, ExternalLink, Info } from "lucide-react";
import { toast } from "sonner";

import { ModeBadge, AuthorityBadge, StatusPill } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { GeneratedAnswer, RetrievedCitation } from "@/data/types";
import { formatTs } from "@/lib/rag";
import { trackSourceView, useSavedGuidance } from "@/lib/local-store";

export function CitationCard({ c }: { c: RetrievedCitation }) {
  const isExternal = c.item.url.startsWith("http");
  return (
    <article className="card-elevated p-4">
      <div className="flex flex-wrap items-center gap-2">
        <AuthorityBadge authority={c.source.authority} />
        <StatusPill label={c.source.platform.replace("_", " ")} />
        {c.item.is_demo_fixture && <StatusPill label="Synthetic demo fixture" tone="warn" />}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          match {Math.round(c.citation.score * 100)}%
        </span>
      </div>

      <h4 className="mt-3 font-display text-base font-semibold text-foreground">{c.item.title}</h4>
      <p className="mt-1 text-xs text-muted-foreground">
        {c.source.name}
        {c.item.published_at ? ` · ${c.item.published_at}` : ""}
        {c.segment.start_seconds != null ? ` · timestamp${formatTs(c.segment.start_seconds)}` : ""}
        {` · ${c.segment.language}`}
      </p>

      <blockquote className="mt-3 rounded-lg border-l-2 border-gold bg-muted/60 p-3 text-sm leading-relaxed text-foreground">
        {c.segment.text}
      </blockquote>

      <div className="mt-3 flex items-center gap-2">
        <Button
          asChild={isExternal}
          size="sm"
          variant="outline"
          disabled={!isExternal}
          onClick={() =>
            trackSourceView({
              id: c.item.id,
              title: c.item.title,
              url: c.item.url,
              platform: c.source.platform,
            })
          }
        >
          {isExternal ? (
            <a href={c.item.url} target="_blank" rel="noopener noreferrer">
              Open original <ExternalLink className="ml-1.5 size-3.5" />
            </a>
          ) : (
            <span>No original (synthetic fixture)</span>
          )}
        </Button>
      </div>
    </article>
  );
}

export function AnswerCard({ answer }: { answer: GeneratedAnswer }) {
  const { add } = useSavedGuidance();
  const isDirect = answer.mode === "DIRECT_TEACHING";

  return (
    <section className="card-elevated overflow-hidden">
      <header className="flex flex-wrap items-center gap-2 border-b border-border/70 bg-paper-deep/50 px-4 py-3 sm:px-5">
        <ModeBadge mode={answer.mode} confidence={answer.confidence} />
        <StatusPill label={`lang: ${answer.detected_language}`} />
        {answer.safety_flags
          .filter((f) => f !== "none")
          .map((f) => (
            <StatusPill key={f} label={f.replace(/_/g, " ")} tone="bad" />
          ))}
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto"
          onClick={() => {
            add({
              id: answer.id,
              question: answer.question,
              mode: answer.mode,
              body: answer.body,
              citationTitles: answer.citations.map((c) => c.item.title),
              savedAt: new Date().toISOString(),
            });
            toast.success("Saved to your guidance list");
          }}
        >
          <Bookmark className="mr-1.5 size-3.5" /> Save
        </Button>
      </header>

      <div className="px-4 py-5 sm:px-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Aapka sawaal
        </p>
        <p className="mt-1 font-display text-lg text-foreground">{answer.question}</p>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/8 p-3 text-xs leading-relaxed text-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            {isDirect
              ? "Verbatim short excerpt from the cited source. Not a paraphrase, not a personal message, and not spoken to you."
              : "AI-generated synthesis based on cited teachings. This is not the voice of Maharaj Ji and does not represent him."}
          </span>
        </div>

        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-foreground">
          {answer.body.split("\n\n").map((para, i) =>
            para.startsWith(">") ? (
              <blockquote
                key={i}
                className="border-l-2 border-gold bg-muted/60 px-3 py-2 text-sm italic"
              >
                {para.replace(/^>\s?/gm, "")}
              </blockquote>
            ) : (
              <p key={i} className={para.startsWith("**") ? "font-semibold text-destructive" : ""}>
                {para.replace(/\*\*/g, "")}
              </p>
            ),
          )}
        </div>

        {answer.citations.length > 0 && (
          <>
            <Separator className="my-5" />
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Cited sources ({answer.citations.length})
            </h3>
            <div className="mt-3 grid gap-3">
              {answer.citations.map((c) => (
                <CitationCard key={c.citation.id} c={c} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
