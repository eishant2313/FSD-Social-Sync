import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listConnectedAccounts,
  stubConnectAccount,
  disconnectAccount,
} from "@/lib/accounts.functions";
import { PLATFORM_META, PLATFORMS, type Platform } from "@/lib/platform-constraints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Plug, Link2, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";

const acctsQO = queryOptions({ queryKey: ["accounts"], queryFn: () => listConnectedAccounts() });

export const Route = createFileRoute("/_authenticated/accounts")({
  loader: ({ context }) => context.queryClient.ensureQueryData(acctsQO),
  head: () => ({ meta: [{ title: "Connected Networks · SocialSync Quantum" }] }),
  component: () => (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-slate-400 font-mono text-xs">
          <Zap className="size-5 text-emerald-400 animate-spin mr-2" /> Loading Connected Networks…
        </div>
      }
    >
      <Inner />
    </Suspense>
  ),
});

const SETUP_NOTES: Record<Platform, string> = {
  linkedin:
    "Connect your LinkedIn profile or company page to publish multi-image & text posts directly.",
  twitter:
    "Connect your X (Twitter) handle to schedule tweets and threads seamlessly.",
  instagram:
    "Connect your Instagram Business or Creator account to broadcast visual media.",
};

function Inner() {
  const qc = useQueryClient();
  const { data: accounts } = useSuspenseQuery(acctsQO);

  const [dialogFor, setDialogFor] = useState<Platform | null>(null);
  const [handle, setHandle] = useState("");

  const connect = useMutation({
    mutationFn: (p: { platform: Platform; displayName: string }) =>
      stubConnectAccount({ data: { platform: p.platform, displayName: p.displayName } }),
    onSuccess: () => {
      toast.success("Network connection established!");
      setDialogFor(null);
      setHandle("");
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const disc = useMutation({
    mutationFn: (platform: Platform) => disconnectAccount({ data: { platform } }),
    onSuccess: () => {
      toast.success("Network disconnected.");
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl flex items-center gap-3">
            Connected Networks
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-semibold text-purple-400 border border-purple-500/30">
              <ShieldCheck className="size-3" /> OAuth Secured
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage active publishing targets and authentication credentials.
          </p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {PLATFORMS.map((p) => {
          const meta = PLATFORM_META[p];
          const acct = accounts.find((a) => a.platform === p);
          const connected = !!acct?.connected;
          return (
            <div
              key={p}
              className={
                "surface-glass p-6 flex flex-col justify-between surface-glass-hover relative overflow-hidden transition-all " +
                (connected ? "border-emerald-500/30" : "border-white/10")
              }
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-4 rounded-full shadow-md"
                      style={{ background: meta.colorVar }}
                    />
                    <h3 className="text-lg font-bold text-white">{meta.label}</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-950/60 px-2 py-1 rounded-md border border-white/5">
                    {meta.charLimit} chars
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {SETUP_NOTES[p]}
                </p>

                <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3.5 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">Status</span>
                    {connected ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                        <CheckCircle2 className="size-3.5 text-emerald-400" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
                        <Plug className="size-3.5" /> Disconnected
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs font-mono text-slate-200 truncate">
                    {connected ? (acct?.display_name ?? "Connected") : "No account linked"}
                  </div>
                </div>
              </div>

              <div>
                {connected ? (
                  <Button
                    variant="outline"
                    className="w-full border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold rounded-xl text-xs"
                    onClick={() => disc.mutate(p)}
                  >
                    Disconnect Channel
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-glow-emerald"
                    onClick={() => setDialogFor(p)}
                  >
                    <Link2 className="size-3.5 mr-1.5" /> Connect {meta.label}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!dialogFor} onOpenChange={(o) => !o && setDialogFor(null)}>
        <DialogContent className="bg-slate-950/90 backdrop-blur-2xl border border-white/10 text-slate-100 rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="size-5 text-emerald-400" />
              Connect {dialogFor ? PLATFORM_META[dialogFor].label : ""}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {dialogFor ? SETUP_NOTES[dialogFor] : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="handle" className="text-xs font-semibold text-slate-300">
              Handle / Account Display Name
            </Label>
            <Input
              id="handle"
              placeholder="@yourhandle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              maxLength={80}
              className="bg-slate-900 border-white/10 text-slate-100 text-sm rounded-xl focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500">
              Enter your social handle to authorize and label this publishing connection.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setDialogFor(null)}
              className="text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </Button>
            <Button
              disabled={!handle.trim() || connect.isPending}
              onClick={() =>
                dialogFor && connect.mutate({ platform: dialogFor, displayName: handle.trim() })
              }
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
            >
              Authorize & Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
