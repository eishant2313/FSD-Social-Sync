import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { listPosts } from "@/lib/posts.functions";
import { listConnectedAccounts } from "@/lib/accounts.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLATFORM_META, type Platform } from "@/lib/platform-constraints";
import {
  PencilLine,
  Calendar,
  Link2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Send,
  Zap,
  Globe,
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
  head: () => ({ meta: [{ title: "Dashboard · SocialSync Quantum Studio" }] }),
  component: Dashboard,
});

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: LucideIcon }> = {
    PUBLISHED: {
      label: "Published",
      cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      icon: CheckCircle2,
    },
    SCHEDULED: {
      label: "Scheduled",
      cls: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
      icon: Clock,
    },
    PUBLISHING: {
      label: "Publishing",
      cls: "bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse",
      icon: Clock,
    },
    FAILED: {
      label: "Failed",
      cls: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
      icon: AlertTriangle,
    },
    DRAFT: {
      label: "Draft",
      cls: "bg-slate-800/60 text-slate-400 border border-slate-700/50",
      icon: PencilLine,
    },
  };
  const s = map[status] ?? map.DRAFT;
  const Icon = s.icon;
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md " +
        s.cls
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
        <div className="flex h-64 items-center justify-center text-slate-400 font-mono text-xs">
          <Zap className="size-5 text-emerald-400 animate-spin mr-2" /> Loading Quantum Workspace…
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
      {/* Dashboard Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl flex items-center gap-3">
            Dashboard Pulse
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              Live Sync
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time analytics, queue status, and multi-network publishing health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-glow-emerald px-5"
          >
            <Link to="/composer">
              <PencilLine className="size-4 mr-2" />
              New Studio Post
            </Link>
          </Button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className="grid gap-5 sm:grid-cols-3">
        <div className="surface-glass p-6 surface-glass-hover relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">
              Published This Week
            </span>
            <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center">
              <Send className="size-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-extrabold text-white">{publishedThisWeek}</span>
            <span className="inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              <TrendingUp className="size-3 mr-1" /> Active
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Across LinkedIn, X & Instagram</p>
        </div>

        <div className="surface-glass p-6 surface-glass-hover relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">
              Scheduled Queue
            </span>
            <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 grid place-items-center">
              <Clock className="size-4 text-sky-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-extrabold text-white">{scheduledCount}</span>
            <span className="text-xs font-mono text-sky-400">Next 7 days</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Queued for automated delivery</p>
        </div>

        <div className="surface-glass p-6 surface-glass-hover relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">
              Connected Networks
            </span>
            <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 grid place-items-center">
              <Globe className="size-4 text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-extrabold text-white">
              {connectedCount}
              <span className="text-xl text-slate-500 font-normal"> / 3</span>
            </span>
            <span className="text-xs font-mono text-purple-400 font-semibold">
              {connectedCount === 3 ? "Fully Connected" : "Action Needed"}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Active publishing channels</p>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Posts */}
        <div className="surface-glass p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-sky-400" />
              <h2 className="text-lg font-bold text-white">Upcoming Queue</h2>
            </div>
            <Link
              to="/calendar"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              View Calendar <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                <Calendar className="size-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-400">No posts currently queued</p>
                <p className="text-xs text-slate-500 mt-1">
                  Use the Composer Studio to schedule your next post.
                </p>
              </div>
            ) : (
              upcoming.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-white/10 bg-slate-950/60 p-4 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(p.target_platforms as Platform[]).map((pl) => (
                        <span
                          key={pl}
                          className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase shadow-sm"
                          style={{ background: PLATFORM_META[pl].colorVar, color: "white" }}
                        >
                          {PLATFORM_META[pl].label}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                      in {p.scheduled_for ? formatDistanceToNow(new Date(p.scheduled_for)) : "—"}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-slate-300 leading-relaxed font-sans">
                    {p.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="surface-glass p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Recent Activity Stream</h2>
            </div>
            <span className="text-xs font-mono text-slate-500">Live feed</span>
          </div>

          <div>
            {recent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                <PencilLine className="size-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-400">No activity logged yet</p>
                <p className="text-xs text-slate-500 mt-1">Your published posts will appear here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {recent.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-200">
                        {p.content || "(empty post)"}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
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

      {/* Account Connection Banner */}
      {connectedCount < 3 && (
        <div className="surface-glass p-6 border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-purple-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 grid place-items-center shrink-0">
              <Link2 className="size-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Unlock Full Multi-Channel Reach</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                You have {connectedCount} of 3 platforms connected. Link all your networks to broadcast everywhere seamlessly.
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold rounded-xl text-xs shrink-0"
          >
            <Link to="/accounts">
              <Link2 className="size-4 mr-1.5" /> Manage Accounts
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
