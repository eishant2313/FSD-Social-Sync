import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

const authSearchSchema = z.object({
  mode: z.enum(["signin", "signup"]).catch("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: authSearchSchema,
  head: () => ({
    meta: [
      { title: "Sign In · SocialSync Quantum Studio" },
      {
        name: "description",
        content: "Sign in to SocialSync to compose, schedule, and broadcast content across networks.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
        });
        if (error) throw error;
        toast.success("Check your inbox to confirm your email, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background bg-hero-mesh grid lg:grid-cols-12 selection:bg-emerald-500 selection:text-slate-950">
      {/* Left Ambient Showcase Side (Hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-12 border-r border-white/10 relative overflow-hidden bg-slate-950/40">
        <Link to="/" className="flex items-center gap-3 group w-fit">
          <span className="grid size-10 place-items-center rounded-xl bg-neon-gradient shadow-glow-emerald">
            <Zap className="size-5 text-slate-950 fill-slate-950" />
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            Social<span className="text-gradient">Sync</span>
          </span>
        </Link>

        <div className="space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles className="size-3.5 text-emerald-400" /> Quantum Multi-Publishing
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Streamline your multi-network presence.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Connect LinkedIn, X, and Instagram in seconds. Plan posts, preview formats live, and schedule automated broadcasts effortlessly.
          </p>

          <div className="space-y-3 pt-4 font-mono text-xs">
            {[
              "Real-time per-platform character limit validation",
              "Multi-image attachments & signed cloud storage",
              "Durable background delivery & status tracking",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          © {new Date().getFullYear()} SocialSync Quantum Studio. Secured by Supabase.
        </div>
      </div>

      {/* Right Form Side */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md surface-glass p-8 sm:p-10 border-white/10 shadow-2xl relative">
          <div className="mb-8 text-center sm:text-left">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-6">
              <span className="grid size-8 place-items-center rounded-lg bg-neon-gradient">
                <Zap className="size-4 text-slate-950 fill-slate-950" />
              </span>
              <span className="text-lg font-bold text-white">SocialSync</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-white">
              {mode === "signin" ? "Welcome back to Quantum" : "Create your studio account"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {mode === "signin"
                ? "Sign in to access your composer and scheduled feeds."
                : "Join thousands of content creators scheduling cross-platform."}
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onGoogle}
              variant="outline"
              className="w-full border-white/10 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-xl py-5 font-semibold text-xs transition-all"
              disabled={loading}
            >
              Continue with Google
            </Button>

            <div className="relative text-center text-[11px] text-slate-500 font-mono my-4">
              <span className="bg-slate-900 px-3 relative z-10 rounded-full border border-white/5">
                OR EMAIL ACCESS
              </span>
              <div className="absolute inset-x-0 top-1/2 -z-0 h-px bg-white/10" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-300">
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950 border-white/10 text-slate-100 text-sm rounded-xl py-5 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950 border-white/10 text-slate-100 text-sm rounded-xl py-5 focus:border-emerald-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl py-5 text-sm shadow-glow-emerald mt-2"
                disabled={loading}
              >
                {loading
                  ? "Authenticating..."
                  : mode === "signin"
                    ? "Sign In to Studio"
                    : "Create Quantum Account"}
              </Button>
            </form>

            <p className="text-center text-xs text-slate-400 pt-4">
              {mode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-emerald-400 font-semibold hover:underline"
                    onClick={() => setMode("signup")}
                  >
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    className="text-emerald-400 font-semibold hover:underline"
                    onClick={() => setMode("signin")}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
