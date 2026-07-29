import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientOnlyFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { createPost } from "@/lib/posts.functions";
import { PLATFORM_META, PLATFORMS, type Platform } from "@/lib/platform-constraints";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ImagePlus, Send, Clock, X, Sparkles, Check, Linkedin, Twitter, Instagram, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/composer")({
  head: () => ({ meta: [{ title: "Studio Composer · Broadcast" }] }),
  component: Composer,
});

const triggerPublish = createClientOnlyFn((postId: string) =>
  import("@/lib/publisher.client").then(({ publishPostById }) => publishPostById(postId)),
);

function Composer() {
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<Platform[]>(["linkedin", "twitter"]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<Platform>("linkedin");

  const mutation = useMutation({
    mutationFn: (mode: "now" | "schedule") =>
      createPost({
        data: {
          content: content.trim(),
          mediaUrls,
          targetPlatforms: selected,
          scheduledFor:
            mode === "schedule" && scheduledFor ? new Date(scheduledFor).toISOString() : null,
        },
      }),
    onSuccess: (row) => {
      toast.success(row.status === "SCHEDULED" ? "Post successfully scheduled!" : "Publishing initialized");
      setContent("");
      setMediaUrls([]);
      setScheduledFor("");
      qc.invalidateQueries({ queryKey: ["posts"] });

      if (row.status === "PUBLISHING") {
        triggerPublish(row.id)
          ?.catch((e) => console.error("publish failed", e))
          .finally(() => qc.invalidateQueries({ queryKey: ["posts"] }));
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const overLimit = useMemo(
    () => selected.filter((p) => content.length > PLATFORM_META[p].charLimit),
    [content, selected],
  );

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Not signed in");
      const path = `${uid}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage
        .from("post-media")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      const { data: signed } = await supabase.storage
        .from("post-media")
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      if (signed?.signedUrl) setMediaUrls((m) => [...m, signed.signedUrl]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const canSubmit =
    content.trim().length > 0 &&
    selected.length > 0 &&
    overLimit.length === 0 &&
    !mutation.isPending;

  return (
    <div className="space-y-6">
      <header className="border-b border-border/40 pb-5">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Studio Composer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Craft once, optimize character budgets, and dispatch across networks.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Composition Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Master Post Content
              </Label>
              <span className="text-xs font-mono text-muted-foreground">
                {content.length} chars
              </span>
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share across your social presence?"
              rows={8}
              className="min-h-[220px] resize-y rounded-xl border border-border/60 bg-card/40 p-4 text-base leading-relaxed focus:border-primary focus:ring-primary/20"
            />

            {/* Media Attachments Gallery */}
            {mediaUrls.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Attached Assets</Label>
                <div className="flex flex-wrap gap-3">
                  {mediaUrls.map((u, i) => (
                    <div key={u} className="group relative">
                      <img
                        src={u}
                        alt="Upload preview"
                        className="size-24 rounded-xl border border-border/60 object-cover shadow-sm transition-transform group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaUrls((m) => m.filter((_, idx) => idx !== i))}
                        className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/40">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-card/80 transition-all">
                <ImagePlus className="size-4 text-primary" />
                {uploading ? "Uploading media..." : "Add Image"}
                <input type="file" accept="image/*" hidden onChange={onUpload} />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Input
                    id="sched"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-56 bg-card/40 border-border/60 text-xs focus:border-primary"
                  />
                </div>

                {scheduledFor ? (
                  <Button
                    disabled={!canSubmit}
                    onClick={() => mutation.mutate("schedule")}
                    className="bg-brand-gradient font-semibold shadow-glow"
                  >
                    <Clock className="mr-2 size-4" /> Schedule
                  </Button>
                ) : (
                  <Button
                    disabled={!canSubmit}
                    onClick={() => mutation.mutate("now")}
                    className="bg-brand-gradient font-semibold shadow-glow"
                  >
                    <Send className="mr-2 size-4" /> Post Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Target Platforms & Live Simulator Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Platform Toggles */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-base font-bold flex items-center justify-between">
              <span>Target Channels</span>
              <span className="text-xs text-muted-foreground font-normal">{selected.length} selected</span>
            </h3>

            <div className="space-y-2.5">
              {PLATFORMS.map((p) => {
                const meta = PLATFORM_META[p];
                const on = selected.includes(p);
                const remaining = meta.charLimit - content.length;
                const over = remaining < 0;

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
                      setActivePreviewPlatform(p);
                    }}
                    className={
                      "flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-200 " +
                      (on
                        ? "border-primary/50 bg-primary/10 shadow-sm"
                        : "border-border/50 bg-card/20 hover:border-border hover:bg-card/40")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid size-7 place-items-center rounded-lg text-white font-bold text-xs"
                        style={{ background: meta.colorVar }}
                      >
                        {p === "linkedin" && <Linkedin className="size-4" />}
                        {p === "twitter" && <Twitter className="size-4" />}
                        {p === "instagram" && <Instagram className="size-4" />}
                      </span>
                      <div>
                        <div className="text-sm font-bold">{meta.label}</div>
                        <div className="text-[11px] text-muted-foreground">{meta.hashtagHint}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={
                          "font-mono text-xs font-semibold " +
                          (over ? "text-destructive" : remaining < 50 ? "text-warning" : "text-muted-foreground")
                        }
                      >
                        {remaining}
                      </span>
                      <div
                        className={`grid size-5 place-items-center rounded-full border transition-colors ${
                          on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                      >
                        {on && <Check className="size-3" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {overLimit.length > 0 && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/15 p-3 text-xs text-destructive font-medium">
                Content exceeds limit for: {overLimit.map((p) => PLATFORM_META[p].label).join(", ")}.
              </div>
            )}
          </div>

          {/* Live Post Simulator */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold flex items-center gap-2">
                <Eye className="size-4 text-primary" /> Live Card Preview
              </h3>
              <span className="text-xs font-mono uppercase text-primary font-bold">
                {PLATFORM_META[activePreviewPlatform].label}
              </span>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-brand-gradient grid place-items-center font-bold text-xs text-primary-foreground">
                  BS
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Your Social Profile</p>
                  <p className="text-[10px] text-muted-foreground">@broadcast_studio · Just now</p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                {content || <span className="text-muted-foreground italic">Post text preview will appear here...</span>}
              </p>

              {mediaUrls.length > 0 && (
                <div className="rounded-lg overflow-hidden border border-border/40">
                  <img src={mediaUrls[0]} alt="Media preview" className="w-full max-h-48 object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

