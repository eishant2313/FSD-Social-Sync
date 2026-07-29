import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { listPosts } from "@/lib/posts.functions";
import { listConnectedAccounts } from "@/lib/accounts.functions";
import { Button } from "@/components/ui/button";
import { PLATFORM_META, type Platform } from "@/lib/platform-constraints";
import {
  PencilLine,
  Calendar,
  Link2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const postsQO = queryOptions({ queryKey: ["posts"], queryFn: () => listPosts() });
const acctsQO = queryOptions({ queryKey: ["accounts"], queryFn: () => listConnectedAccounts() });

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(postsQO),
      context.queryClient.ensureQueryData(acctsQO),
    ]),
  head: () => ({ meta: [{ title: "Studio Dashboard · Broadcast" }] }),
  component: Dashboard,
});

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: LucideIcon }> = {
    PUBLISHED: { label: "Published", cls: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
    SCHEDULED: { label: "Scheduled", cls: "bg-primary/15 text-primary border-primary/30", icon: Clock },
    PUBLISHING: { label: "Publishing", cls: "bg-warning/15 text-warning border-warning/30 animate-pulse", icon: Clock },
    FAILED: { label: "Failed", cls: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertTriangle },
    DRAFT: { label: "Draft", cls: "bg-muted/40 text-muted-foreground border-border/40", icon: PencilLine },
  };
  const s = map[status] ?? map.DRAFT;
  const Icon = s.icon;
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md " + s.cls
      }
    >
      <Icon className="size-3.5" />
      {s.label}
    </span>
  );
}

function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const { data: posts } = useSuspenseQuery(postsQO);
  const { data: accounts } = useSuspenseQuery(acctsQO);

  const connectedCount = accounts.filter((a) => a.connected).length;
  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const publishedThisWeek = posts.filter(
    (p) =>
      p.status === "PUBLISHED" &&
      p.published_at &&
      Date.now() - new Date(p.published_at).getTime() < 7 * 864e5,
  ).length;

  const upcoming = posts.filter((p) => p.status === "SCHEDULED").slice(0, 5);
  const recent = posts.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Studio Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time status of your content pipeline and social accounts.
          </p>
        </div>
        <Button asChild className="bg-brand-gradient font-semibold shadow-glow transition-all hover:scale-[1.02]">
          <Link to="/composer">
            <PencilLine className="mr-2 size-4" /> Compose Post
          </Link>
        </Button>
      </header>

      {/* Metrics Summary Widgets */}
      <section className="grid gap-5 sm:grid-cols-3">
        <div className="glass-card glass-card-hover p-6">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Published (7d)</span>
            <div className="grid size-9 place-items-center rounded-xl bg-success/15 text-success">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-4xl font-extrabold">{publishedThisWeek}</span>
            <span className="text-xs font-medium text-success">Posts delivered</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Queued & Scheduled</span>
            <div className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-4xl font-extrabold">{scheduledCount}</span>
            <span className="text-xs font-medium text-primary">Pending release</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Connected Channels</span>
            <div className="grid size-9 place-items-center rounded-xl bg-accent/15 text-accent">
              <Link2 className="size-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-4xl font-extrabold">{connectedCount}</span>
            <span className="text-sm font-semibold text-muted-foreground">/ 3 active</span>
          </div>
        </div>
      </section>

      {/* Content Columns */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Posts */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Clock className="size-4 text-primary" /> Scheduled Queue
              </h2>
              <Link to="/calendar" className="text-xs font-semibold text-primary hover:underline flex items-center">
                Calendar view <ArrowUpRight className="ml-1 size-3" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {upcoming.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border/50">
                  <p>No posts currently queued.</p>
                  <Button asChild variant="link" size="sm" className="mt-2 text-primary">
                    <Link to="/composer">Schedule a new post</Link>
                  </Button>
                </div>
              ) : (
                upcoming.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border/50 bg-card/40 p-4 transition-all hover:bg-card/70">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {(p.target_platforms as Platform[]).map((pl) => (
                          <span
                            key={pl}
                            className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase shadow-xs"
                            style={{ background: PLATFORM_META[pl].colorVar, color: "white" }}
                          >
                            {PLATFORM_META[pl].label}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        in {p.scheduled_for ? formatDistanceToNow(new Date(p.scheduled_for)) : "—"}
                      </span>
                    </div>
                    <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-foreground">{p.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <Send className="size-4 text-accent" /> Recent Activity Log
            </h2>
          </div>

          <div className="mt-4">
            {recent.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border/50">
                <p>Your publishing activity will appear here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/40">
                {recent.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{p.content || "(empty post)"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <StatusPill status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Account Sync Banner */}
      {connectedCount < 3 && (
        <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-primary">
          <div className="space-y-1">
            <h3 className="font-display text-base font-bold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Connect your social profiles
            </h3>
            <p className="text-xs text-muted-foreground">
              You currently have {connectedCount} of 3 networks connected. Link LinkedIn, X and Instagram for one-click publishing.
            </p>
          </div>
          <Button asChild size="sm" className="bg-primary text-primary-foreground font-semibold">
            <Link to="/accounts">
              <Link2 className="mr-1.5 size-4" /> Manage Accounts
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

