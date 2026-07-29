import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { Suspense } from "react";
import { listPosts, deletePost } from "@/lib/posts.functions";
import { PLATFORM_META, type Platform } from "@/lib/platform-constraints";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar as CalendarIcon, Clock, CheckCircle2, AlertTriangle, PencilLine } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const postsQO = queryOptions({ queryKey: ["posts"], queryFn: () => listPosts() });

export const Route = createFileRoute("/_authenticated/calendar")({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQO),
  head: () => ({ meta: [{ title: "Content Calendar · Broadcast" }] }),
  component: () => (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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

  const groupIcons = {
    scheduled: Clock,
    publishing: Clock,
    published: CheckCircle2,
    failed: AlertTriangle,
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-border/40 pb-5">
        <h1 className="font-display text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <CalendarIcon className="size-7 text-primary" /> Content Calendar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track upcoming scheduled posts, active deliveries, and historical archives.
        </p>
      </header>

      {(["scheduled", "publishing", "published", "failed"] as const).map((key) => {
        const Icon = groupIcons[key];
        const count = groups[key].length;
        return (
          <section key={key} className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Icon className="size-4 text-primary" /> {key} ({count})
              </h2>
            </div>

            {count === 0 ? (
              <p className="text-xs text-muted-foreground/60 italic py-2">No entries in {key}.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {groups[key].map((p) => (
                  <div key={p.id} className="glass-card glass-card-hover p-5 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {(p.target_platforms as Platform[]).map((pl) => (
                          <span
                            key={pl}
                            className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-white shadow-xs"
                            style={{ background: PLATFORM_META[pl].colorVar }}
                          >
                            {PLATFORM_META[pl].label}
                          </span>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => del.mutate(p.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    <p className="line-clamp-3 text-sm leading-relaxed text-foreground">{p.content}</p>

                    <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono">
                        {p.scheduled_for
                          ? `Scheduled: ${format(new Date(p.scheduled_for), "MMM d, yyyy · h:mm a")}`
                          : p.published_at
                            ? `Published: ${format(new Date(p.published_at), "MMM d, yyyy · h:mm a")}`
                            : `Created: ${format(new Date(p.created_at), "MMM d, yyyy")}`}
                      </span>
                    </div>
                    {p.error && <p className="text-xs text-destructive font-medium">{p.error}</p>}
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

