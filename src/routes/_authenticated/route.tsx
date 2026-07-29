import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Zap,
  LayoutDashboard,
  PencilLine,
  CalendarDays,
  Link2,
  LogOut,
  Sparkles,
  Search,
  Bell,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedShell,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/composer", label: "Composer Studio", icon: PencilLine },
  { to: "/calendar", label: "Schedule Calendar", icon: CalendarDays },
  { to: "/accounts", label: "Connected Networks", icon: Link2 },
] as const;

function AuthedShell() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string>(user.email ?? "");

  useEffect(() => setEmail(user.email ?? ""), [user.email]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const userInitial = (email[0] || "U").toUpperCase();

  return (
    <div className="flex min-h-screen bg-background bg-hero-mesh">
      {/* Floating Glass Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-slate-950/60 backdrop-blur-2xl text-slate-200 md:flex">
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <span className="grid size-10 place-items-center rounded-xl bg-neon-gradient shadow-glow-emerald transition-transform group-hover:scale-105">
              <Zap className="size-5 text-slate-950 fill-slate-950" />
            </span>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                Social<span className="text-gradient">Sync</span>
              </span>
              <span className="text-[10px] block font-mono text-emerald-400 tracking-wider font-semibold uppercase">
                Quantum Studio
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Navigation
          </div>
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={
                  "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 " +
                  (active
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent")
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`size-4.5 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                  {label}
                </div>
                {active && (
                  <span className="size-1.5 rounded-full bg-emerald-400 shadow-glow-emerald" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="border-t border-white/10 p-4 bg-slate-900/40">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/40 p-3 border border-white/5 mb-3">
            <div className="relative grid size-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 text-sm font-bold text-white shadow-md">
              {userInitial}
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{email}</p>
              <p className="text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
                <ShieldCheck className="size-3" /> Pro Workspace
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
            onClick={signOut}
          >
            <LogOut className="size-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/70 backdrop-blur-xl px-6">
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search posts, platforms, schedule..."
                className="w-64 sm:w-80 rounded-xl bg-slate-900/70 border border-white/10 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-glow-emerald"
            >
              <Link to="/composer">
                <PlusCircle className="size-4 mr-1.5" />
                Quick Compose
              </Link>
            </Button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-slate-300">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-slate-400">3 Networks Live</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="sticky bottom-0 z-40 grid grid-cols-4 border-t border-white/10 bg-slate-950/90 backdrop-blur-2xl md:hidden">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={
                  "flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors " +
                  (active ? "text-emerald-400 font-semibold" : "text-slate-400 hover:text-slate-200")
                }
              >
                <Icon className={`size-5 ${active ? "text-emerald-400" : ""}`} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
