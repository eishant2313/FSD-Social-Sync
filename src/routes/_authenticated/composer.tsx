import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientOnlyFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { createPost } from "@/lib/posts.functions";
import { PLATFORM_META, PLATFORMS, type Platform } from "@/lib/platform-constraints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ImagePlus,
  Send,
  Clock,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Eye,
  MessageSquare,
  Repeat2,
  Heart,
  Share2,
  Wand2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/composer")({
  head: () => ({ meta: [{ title: "Composer Studio · SocialSync Quantum" }] }),
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
  const [previewPlatform, setPreviewPlatform] = useState<Platform>("linkedin");

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
      toast.success("Post queued for broadcast!");
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

  // Quick AI Prompt Helpers
  function applyAIHelper(action: "punchy" | "tags" | "calltoaction") {
    if (!content.trim()) {
      toast.error("Type your draft first to apply AI enhancement.");
      return;
    }
    if (action === "punchy") {
      setContent((c) => `⚡ ${c.trim()}\n\nKey takeaway: Built for speed & consistency.`);
      toast.success("Applied Punchy Tone!");
    } else if (action === "tags") {
      setContent((c) => `${c.trim()}\n\n#socialsync #tech #buildinpublic #productivity`);
      toast.success("Added Trending Hashtags!");
    } else if (action === "calltoaction") {
      setContent((c) => `${c.trim()}\n\nWhat are your thoughts? Drop a comment below! 👇`);
      toast.success("Added Call to Action!");
    }
  }

  const canSubmit =
    content.trim().length > 0 &&
    selected.length > 0 &&
    overLimit.length === 0 &&
    !mutation.isPending;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl flex items-center gap-3">
            Composer Studio
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
              <Sparkles className="size-3" /> Multi-Platform Engine
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Write once, optimize for each platform, and broadcast everywhere in one click.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Editor Pane (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          <div className="surface-glass p-6">
            {/* AI Helper Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Wand2 className="size-3.5 text-emerald-400" /> AI Enhancers
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyAIHelper("punchy")}
                  className="rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 transition-colors"
                >
                  ⚡ Make Punchy
                </button>
                <button
                  type="button"
                  onClick={() => applyAIHelper("tags")}
                  className="rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-2.5 py-1 text-[11px] font-semibold text-purple-300 transition-colors"
                >
                  # Add Hashtags
                </button>
                <button
                  type="button"
                  onClick={() => applyAIHelper("calltoaction")}
                  className="rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-2.5 py-1 text-[11px] font-semibold text-sky-300 transition-colors"
                >
                  👇 Add CTA
                </button>
              </div>
            </div>

            {/* Textarea Input */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to broadcast today? Type your message here..."
              rows={8}
              className="min-h-[220px] resize-y bg-slate-950/80 border-white/10 text-slate-100 text-base placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/30 rounded-xl p-4 leading-relaxed"
            />

            {/* Media Upload Previews */}
            {mediaUrls.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {mediaUrls.map((u, i) => (
                  <div key={u} className="relative group">
                    <img
                      src={u}
                      alt="Uploaded media"
                      className="size-24 rounded-xl border border-white/10 object-cover shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaUrls((m) => m.filter((_, idx) => idx !== i))}
                      className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-rose-500 text-white shadow-lg transition-transform group-hover:scale-110"
                      aria-label="Remove image"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Editor Actions Footer */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:border-emerald-500/30 transition-all">
                <ImagePlus className="size-4 text-emerald-400" />
                {uploading ? "Uploading..." : "Attach Image"}
                <input type="file" accept="image/*" hidden onChange={onUpload} />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/10">
                  <Clock className="size-3.5 text-sky-400" />
                  <Input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-48 border-none bg-transparent text-xs text-slate-200 focus-visible:ring-0 p-0 h-auto"
                  />
                </div>

                {scheduledFor ? (
                  <Button
                    disabled={!canSubmit}
                    onClick={() => mutation.mutate("schedule")}
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow-md px-5"
                  >
                    <Clock className="size-4 mr-1.5" /> Schedule Post
                  </Button>
                ) : (
                  <Button
                    disabled={!canSubmit}
                    onClick={() => mutation.mutate("now")}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-glow-emerald px-6"
                  >
                    <Send className="size-4 mr-1.5" /> Broadcast Now
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Network Selection Matrix */}
          <div className="surface-glass p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4">
              Target Networks & Character Constraints
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
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
                      setPreviewPlatform(p);
                    }}
                    className={
                      "flex flex-col justify-between rounded-xl border p-4 text-left transition-all " +
                      (on
                        ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/5"
                        : "border-white/10 bg-slate-950/40 hover:border-white/20")
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full shadow-sm"
                          style={{ background: meta.colorVar }}
                        />
                        <span className="text-xs font-bold text-white">{meta.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={on}
                        readOnly
                        className="rounded accent-emerald-500"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] mt-2">
                      <span className="text-slate-400 font-mono">Limit: {meta.charLimit}</span>
                      <span
                        className={
                          "font-mono font-bold " + (over ? "text-rose-400" : "text-emerald-400")
                        }
                      >
                        {remaining} left
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {overLimit.length > 0 && (
              <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="size-4 text-rose-400 shrink-0" />
                <span>
                  Character limit exceeded for{" "}
                  {overLimit.map((p) => PLATFORM_META[p].label).join(", ")}. Please trim content before publishing.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Live Visual Platform Preview Pane (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="surface-glass p-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Live Platform Preview
                </h2>
              </div>
              <div className="flex gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPreviewPlatform(p)}
                    className={
                      "px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors capitalize " +
                      (previewPlatform === p
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-slate-200")
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Realistic Social Media Card */}
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-2xl space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-gradient-to-tr from-emerald-400 to-indigo-500 font-bold text-slate-950 text-sm shadow-md">
                    SS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      SocialSync Pro <CheckCircle2 className="size-3 text-emerald-400" />
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      @socialsync_studio · Just now
                    </p>
                  </div>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    background: PLATFORM_META[previewPlatform].colorVar,
                    color: "white",
                  }}
                >
                  {PLATFORM_META[previewPlatform].label}
                </span>
              </div>

              {/* Card Content Body */}
              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[80px]">
                {content || (
                  <span className="text-slate-500 italic">
                    Preview will render here as you type in the editor...
                  </span>
                )}
              </div>

              {/* Media Attachments Preview */}
              {mediaUrls.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-white/10 max-h-48">
                  <img
                    src={mediaUrls[0]}
                    alt="Attached media preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Simulated Interactions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-slate-500 text-[11px]">
                <div className="flex items-center gap-1">
                  <MessageSquare className="size-3.5" /> 12
                </div>
                <div className="flex items-center gap-1">
                  <Repeat2 className="size-3.5" /> 8
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="size-3.5 text-rose-400/80" /> 45
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="size-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
