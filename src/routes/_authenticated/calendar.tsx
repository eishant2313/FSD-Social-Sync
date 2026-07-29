import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { Suspense } from "react";
import { listPosts, deletePost } from "@/lib/posts.functions";
import { PLATFORM_META, type Platform } from "@/lib/platform-constraints";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar as CalendarIcon, Clock, CheckCircle2, AlertTriangle, PlusCircle, Zap } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const postsQO = queryOptions({ queryKey: ["posts"], queryFn: () => listPosts() });

export const Route = createFileRoute("/_authenticated/calendar")({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQO),
  head: () => ({ meta: [{ title: "Schedule Calendar · SocialSync Quantum" }] }),
  component: () => (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-slate-400 font-mono text-xs">
          <Zap className="size-5 text-emerald-400 animate-spin mr-2" /> Loading Calendar Workspace…
        </div>
      }
    >
      <Inner />
    </Suspense>
  ),
});

function Inner() {
  const { data: posts } = useSuspenseQuery(postsQO);
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: (id: string) => deletePost({ data: { id } }),
    onSuccess: () => {
      toast.success("Post removed from calendar");
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const groups = {
    scheduled: posts.filter((p) => p.status === "SCHEDULED"),
    publishing: posts.filter((p) => p.status === "PUBLISHING"),
    published: posts.filter((p) => p.status === "PUBLISHED"),
    failed: posts.filter((p) => p.status === "FAILED"),
  };

  const groupLabels: Record<string, { label: string; icon: any; color: string }> = {
    scheduled: { label: "Scheduled Queue", icon: Clock, color: "text-sky-400" },
    publishing: { label: "Currently Publishing", icon: Clock, color: "text-amber-400" },
    published: { label: "Published Archive", icon: CheckCircle2, color: "text-emerald-400" },
    failed: { label: "Failed Broadcasts", icon: AlertTriangle, color: "text-rose-400" },
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl flex items-center gap-3">
            Schedule Calendar
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold text-sky-400 border border-sky-500/30">
              <CalendarIcon className="size-3" /> Timeline View
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitor and manage your scheduled broadcasts and past published feeds.
          </p>
        </div>

        <Button
          asChild
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-glow-emerald px-5"
        >
          <Link to="/composer">
            <PlusCircle className="size-4 mr-1.5" /> Schedule New
          </Link>
        </Button>
      </header>

      {(["scheduled", "publishing", "published", "failed"] as const).map((key) => {
        const meta = groupLabels[key];
        const Icon = meta.icon;
        const items = groups[key];
        return (
          <section key={key} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Icon className={`size-4 ${meta.color}`} />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                {meta.label} <span className="text-slate-500">({items.length})</span>
              </h2>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono italic pl-6">No entries in this queue.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((p) => (
                  <div
                    key={p.id}
                    className="surface-glass p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex flex-wrap gap-1.5">
                          {(p.target_platforms as Platform[]).map((pl) => (
                            <span
                              key={pl}
                              className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm"
                              style={{ background: PLATFORM_META[pl].colorVar, color: "white" }}
                            >
                              {PLATFORM_META[pl].label}
                            </span>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => del.mutate(p.id)}
                          className="size-7 p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                      <p className="line-clamp-3 text-xs text-slate-200 leading-relaxed font-sans mb-3">
                        {p.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>
                        {p.scheduled_for
                          ? `Scheduled: ${format(new Date(p.scheduled_for), "PP · p")}`
                          : p.published_at
                            ? `Published: ${format(new Date(p.published_at), "PP · p")}`
                            : `Created: ${format(new Date(p.created_at), "PP · p")}`}
                      </span>
                    </div>
                    {p.error && (
                      <p className="mt-2 text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        {p.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
