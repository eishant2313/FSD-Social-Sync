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
import { Radio, LayoutDashboard, PencilLine, CalendarDays, Link2, LogOut, Plus, User, Sparkles } from "lucide-react";
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
  { to: "/composer", label: "Composer", icon: PencilLine },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/accounts", label: "Accounts", icon: Link2 },
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

  return (
    <div className="flex min-h-screen bg-background bg-hero text-foreground">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border/60 bg-sidebar/80 backdrop-blur-xl text-sidebar-foreground md:flex">
        <div className="flex h-20 items-center justify-between px-6 border-b border-sidebar-border/40">
          <Link to="/dashboard" className="flex items-center gap-3 font-display font-bold text-lg">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-gradient shadow-glow-cyan">
              <Radio className="size-4 text-primary-foreground" />
            </span>
            <span>Broadcast</span>
          </Link>
          <span className="flex size-2 rounded-full bg-success animate-pulse" title="Live Sync Active" />
        </div>

        <div className="px-4 py-4">
          <Button asChild size="sm" className="w-full bg-brand-gradient font-semibold shadow-glow justify-start gap-2">
            <Link to="/composer">
              <Plus className="size-4" /> New Post
            </Link>
          </Button>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-2">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={
                  "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 " +
                  (active
                    ? "bg-primary/15 text-primary shadow-sm border border-primary/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")
                }
              >
                <Icon className={`size-4 transition-transform group-hover:scale-110 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span>{label}</span>
                {active && (
                  <span className="absolute right-3 size-1.5 rounded-full bg-primary shadow-glow-cyan" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border/50 p-4 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-card/40 p-2.5 border border-border/40">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/20 text-primary font-bold text-xs">
              <User className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">{email.split("@")[0]}</p>
              <p className="truncate text-[10px] text-muted-foreground">{email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={signOut}
          >
            <LogOut className="mr-2 size-3.5" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/60 backdrop-blur-md px-5 md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2.5 font-bold font-display">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-gradient">
              <Radio className="size-4 text-primary-foreground" />
            </span>
            Broadcast Studio
          </Link>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="size-4" />
          </Button>
        </header>

        {/* Dynamic Route Container */}
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8 overflow-y-auto">
          <Outlet />
        </div>

        {/* Mobile Bottom Floating Navigation */}
        <nav className="sticky bottom-0 z-40 grid grid-cols-4 border-t border-border/50 bg-background/80 backdrop-blur-xl p-1.5 md:hidden">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={
                  "flex flex-col items-center justify-center py-2 text-[10px] font-medium transition-colors " +
                  (active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground")
                }
              >
                <Icon className={`size-4 ${active ? "text-primary" : ""}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

