import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileAudio, Plus, ScissorsLineDashed, ShieldQuestion, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthorityBadge, StatusPill } from "@/components/badges";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CONTENT_ITEMS, DEMO_ITEM, INGESTION_JOBS, SOURCES, sourceById } from "@/data/registry";
import type { ContentItem } from "@/data/types";
import { formatDuration } from "@/lib/rag";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Ingestion Dashboard — Bhajan Marg Wisdom AI" },
      {
        name: "description",
        content:
          "Mock ingestion console: register sources, track transcription, Q&A segmentation, embeddings, human review and publication to the knowledge base.",
      },
      { property: "og:title", content: "Ingestion Dashboard — Bhajan Marg Wisdom AI" },
      {
        property: "og:description",
        content:
          "Architected pipeline view for source registration, transcripts, segmentation, embeddings and review.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [items, setItems] = useState<ContentItem[]>([...CONTENT_ITEMS, DEMO_ITEM]);
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [official, setOfficial] = useState(true);

  const addSource = () => {
    if (!/^https?:\/\//.test(url)) {
      toast.error("Enter a full https:// URL");
      return;
    }
    const item: ContentItem = {
      id: `ci_new_${items.length + 1}`,
      source_id: SOURCES[0]!.id,
      title: url.replace(/^https?:\/\//, "").slice(0, 60),
      url,
      published_at: null,
      duration_seconds: null,
      language: "unknown",
      transcript_status: "none",
      segmentation_status: "none",
      embedding_status: "none",
      review_status: "not_started",
      fetched_at: new Date().toISOString().slice(0, 10),
      content_hash: null,
      usage_notes: official
        ? "Official source — permission check required before transcript storage."
        : "Third-party discovery source — reference only, not citable as authoritative.",
      is_demo_fixture: false,
      notes: `Registered manually as ${platform} / ${official ? "OFFICIAL" : "THIRD_PARTY_DISCOVERY"}. No content fetched.`,
    };
    setItems((prev) => [item, ...prev]);
    setUrl("");
    toast.success("Source registered (metadata only — nothing ingested)");
  };

  const stage = (id: string, patch: Partial<ContentItem>, message: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    toast.message(message);
  };

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Ingestion dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Mock console for the architected pipeline. Actions here change local state only — they do
          not fetch, transcribe or publish anything, and no item is ever shown as indexed unless it
          genuinely is.
        </p>

        <section className="card-elevated mt-8 p-5">
          <h2 className="font-display text-xl font-semibold text-foreground">Add source</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr_auto_auto] sm:items-end">
            <div>
              <Label htmlFor="src-url" className="text-xs">
                Source URL
              </Label>
              <Input
                id="src-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs">Source type</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="publication">Publication</SelectItem>
                  <SelectItem value="mobile_app">Mobile app</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 pb-2 text-xs text-muted-foreground">
              <Switch checked={official} onCheckedChange={setOfficial} />
              {official ? "Official" : "Third-party"}
            </label>
            <Button onClick={addSource}>
              <Plus className="mr-1.5 size-4" /> Add source
            </Button>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Content items ({items.length})
          </h2>
          <div className="card-elevated mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Authority</TableHead>
                  <TableHead>Lang</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Fetched</TableHead>
                  <TableHead>Transcript</TableHead>
                  <TableHead>Segments</TableHead>
                  <TableHead>Embeddings</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead className="text-right">Pipeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => {
                  const src = sourceById(c.source_id);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="max-w-[220px]">
                        <p className="truncate text-xs font-medium text-foreground">{c.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{src.name}</p>
                      </TableCell>
                      <TableCell>
                        <AuthorityBadge authority={src.authority} />
                      </TableCell>
                      <TableCell className="text-xs">{c.language}</TableCell>
                      <TableCell className="text-xs">
                        {formatDuration(c.duration_seconds)}
                      </TableCell>
                      <TableCell className="text-xs">{c.fetched_at ?? "—"}</TableCell>
                      <TableCell>
                        <StatusPill
                          label={c.transcript_status.replace(/_/g, " ")}
                          tone={c.transcript_status === "available" ? "good" : "warn"}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusPill
                          label={c.segmentation_status}
                          tone={c.segmentation_status === "done" ? "good" : "neutral"}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusPill
                          label={c.embedding_status}
                          tone={c.embedding_status === "indexed" ? "good" : "neutral"}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusPill
                          label={c.review_status.replace(/_/g, " ")}
                          tone={c.review_status === "approved" ? "good" : "neutral"}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Transcribe"
                            title="Transcribe"
                            onClick={() =>
                              stage(
                                c.id,
                                { transcript_status: "queued" },
                                "Transcription queued (mock) — permission check runs first.",
                              )
                            }
                          >
                            <FileAudio className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Segment Q&A"
                            title="Segment Q&A"
                            onClick={() =>
                              stage(
                                c.id,
                                { segmentation_status: "queued" },
                                "Q&A segmentation queued (mock).",
                              )
                            }
                          >
                            <ScissorsLineDashed className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Review"
                            title="Send to human review"
                            onClick={() =>
                              stage(
                                c.id,
                                { review_status: "pending_review" },
                                "Sent to human review (mock).",
                              )
                            }
                          >
                            <ShieldQuestion className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Publish"
                            title="Publish to knowledge base"
                            onClick={() => {
                              if (c.transcript_status !== "available") {
                                toast.error(
                                  "Cannot publish: no reviewed transcript is available for this item.",
                                );
                                return;
                              }
                              stage(
                                c.id,
                                { review_status: "approved", embedding_status: "indexed" },
                                "Published to knowledge base (mock).",
                              );
                            }}
                          >
                            <Upload className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-foreground">Ingestion jobs</h2>
          <div className="mt-4 space-y-2">
            {INGESTION_JOBS.map((j) => (
              <div
                key={j.id}
                className="card-elevated flex flex-wrap items-center gap-3 p-3 text-xs"
              >
                <StatusPill label={j.kind.replace(/_/g, " ")} />
                <StatusPill
                  label={j.status}
                  tone={
                    j.status === "succeeded"
                      ? "good"
                      : j.status === "blocked" || j.status === "failed"
                        ? "bad"
                        : "warn"
                  }
                />
                <span className="text-foreground">{sourceById(j.source_id).name}</span>
                <span className="text-muted-foreground">{j.message}</span>
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                  {j.created_at}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card-elevated mt-10 p-5">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
            <CheckCircle2 className="size-5 text-success" /> Publication gate
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Permission and copyright notes recorded on the source before any fetch.</li>
            <li>Duplicate detection via content and segment hashes before embedding.</li>
            <li>Human reviewer confirms every segment&apos;s text, timestamp and attribution.</li>
            <li>
              Citation validation re-checks each quote against stored text; failures block
              publication rather than shipping an unverified quotation.
            </li>
          </ul>
        </section>
      </div>
    </SiteShell>
  );
}
