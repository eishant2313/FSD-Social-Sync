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
import { CheckCircle2, Plug, Link2, Linkedin, Twitter, Instagram } from "lucide-react";
import { toast } from "sonner";

const acctsQO = queryOptions({ queryKey: ["accounts"], queryFn: () => listConnectedAccounts() });

export const Route = createFileRoute("/_authenticated/accounts")({
  loader: ({ context }) => context.queryClient.ensureQueryData(acctsQO),
  head: () => ({ meta: [{ title: "Connected Accounts · Broadcast" }] }),
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

const SETUP_NOTES: Record<Platform, string> = {
  linkedin:
    "Connect your LinkedIn profile or company page to publish directly from Broadcast.",
  twitter:
    "Connect your X (Twitter) account to publish tweets and threads.",
  instagram:
    "Connect your Instagram Business or Creator account to schedule posts.",
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
      toast.success("Account connected successfully!");
      setDialogFor(null);
      setHandle("");
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const disc = useMutation({
    mutationFn: (platform: Platform) => disconnectAccount({ data: { platform } }),
    onSuccess: () => {
      toast.success("Account disconnected");
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <header className="border-b border-border/40 pb-5">
        <h1 className="font-display text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Link2 className="size-7 text-primary" /> Connected Networks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage integrations for LinkedIn, X (Twitter), and Instagram publishing.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {PLATFORMS.map((p) => {
          const meta = PLATFORM_META[p];
          const acct = accounts.find((a) => a.platform === p);
          const connected = !!acct?.connected;
          return (
            <div key={p} className="glass-card glass-card-hover p-6 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-10 place-items-center rounded-xl text-white font-bold"
                      style={{ background: meta.colorVar }}
                    >
                      {p === "linkedin" && <Linkedin className="size-5" />}
                      {p === "twitter" && <Twitter className="size-5" />}
                      {p === "instagram" && <Instagram className="size-5" />}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold">{meta.label}</h3>
                      <p className="text-xs text-muted-foreground">{meta.charLimit} char limit</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 rounded-xl bg-card/40 p-3 border border-border/40 text-sm">
                  {connected ? (
                    <>
                      <CheckCircle2 className="size-4 text-success shrink-0" />
                      <span className="font-medium truncate text-foreground">{acct?.display_name ?? "Connected"}</span>
                    </>
                  ) : (
                    <>
                      <Plug className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Not connected</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                {connected ? (
                  <Button
                    variant="outline"
                    className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => disc.mutate(p)}
                  >
                    Disconnect Channel
                  </Button>
                ) : (
                  <Button className="w-full bg-brand-gradient font-semibold shadow-glow" onClick={() => setDialogFor(p)}>
                    Connect {meta.label}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!dialogFor} onOpenChange={(o) => !o && setDialogFor(null)}>
        <DialogContent className="glass-panel border-border/60">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Connect {dialogFor ? PLATFORM_META[dialogFor].label : ""}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {dialogFor ? SETUP_NOTES[dialogFor] : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="handle" className="text-xs font-semibold">Account Handle / Profile Identifier</Label>
            <Input
              id="handle"
              placeholder="@yourprofile"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              maxLength={80}
              className="bg-card/40 border-border/60 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground">
              Enter your social handle to authorize and label this connection.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDialogFor(null)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-gradient font-semibold shadow-glow"
              disabled={!handle.trim() || connect.isPending}
              onClick={() =>
                dialogFor && connect.mutate({ platform: dialogFor, displayName: handle.trim() })
              }
            >
              Confirm & Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

