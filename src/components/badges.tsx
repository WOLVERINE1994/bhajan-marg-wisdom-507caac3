import { BadgeCheck, CircleAlert, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AnswerMode, SourceAuthority } from "@/data/types";

const MODE_META: Record<
  AnswerMode,
  { label: string; icon: typeof BadgeCheck; className: string; hint: string }
> = {
  DIRECT_TEACHING: {
    label: "Direct teaching",
    icon: BadgeCheck,
    className: "border-success/40 bg-success/10 text-success",
    hint: "Short verbatim excerpt reproduced from the cited source.",
  },
  SYNTHESIZED_FROM_TEACHINGS: {
    label: "Synthesized from teachings",
    icon: Sparkles,
    className: "border-primary/40 bg-primary/10 text-primary",
    hint: "AI-generated synthesis based on cited teachings.",
  },
  INSUFFICIENT_SOURCE_EVIDENCE: {
    label: "Insufficient source evidence",
    icon: CircleAlert,
    className: "border-warning/50 bg-warning/12 text-warning-foreground",
    hint: "No sufficiently relevant indexed source was found.",
  },
};

export function ModeBadge({ mode, confidence }: { mode: AnswerMode; confidence?: number }) {
  const meta = MODE_META[mode];
  const Icon = meta.icon;
  return (
    <span
      title={meta.hint}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        meta.className,
      )}
    >
      <Icon className="size-3.5" />
      {meta.label}
      {typeof confidence === "number" && (
        <span className="font-mono text-[10px] opacity-70">{Math.round(confidence * 100)}%</span>
      )}
    </span>
  );
}

export function AuthorityBadge({ authority }: { authority: SourceAuthority }) {
  const official = authority === "OFFICIAL";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        official
          ? "border-success/40 bg-success/10 text-success"
          : "border-rose/40 bg-rose/10 text-rose",
      )}
    >
      {official ? <BadgeCheck className="size-3.5" /> : <CircleAlert className="size-3.5" />}
      {official ? "Official" : "Third-party discovery"}
    </span>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        tone === "good" && "border-success/40 bg-success/10 text-success",
        tone === "warn" && "border-warning/50 bg-warning/12 text-warning-foreground",
        tone === "bad" && "border-destructive/40 bg-destructive/10 text-destructive",
        tone === "neutral" && "border-border bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
