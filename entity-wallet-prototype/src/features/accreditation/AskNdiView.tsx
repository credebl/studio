"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { WalletHandoff } from "@/components/ui/WalletHandoff";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { VERIFICATION_ORG_NAME, inOrg, type AccCapability, type AskItem, type IssueType } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS, WALLET_HANDOFF_MS } from "@/lib/demoTiming";

import { IssueTypesEditor, ItemChooser, scopeSentence } from "./shared";

/**
 * SCR-ACC-06 — Verify customers or issue credentials. FLOW-ACC-02 steps 1–5.
 *
 * TWO CHOICES, EACH WITH AN EXAMPLE
 *
 * A business owner does not arrive knowing what "verify" means on NDI. Each
 * choice says what it is in a sentence and gives an example a shopkeeper
 * would recognise — checking someone is over 18; giving people a training
 * certificate. Then the item chooser, with the yes-or-no checks first and a
 * plain reason to ask for less: NDI checks it, and customers see it.
 *
 * WRITTEN BY THE BUSINESS, DECIDED AS WRITTEN
 *
 * The page says before sending that NDI will approve or decline the
 * request exactly as written and won't change it (UXD-30), and that
 * approval puts the business on NDI's public list (UXD-29). If NDI
 * declines, its reason comes back in its own words and "change and ask
 * again" reopens this page with the request as it was.
 */
type Face =
  | "live"
  | "default"
  | "choosing_verify"
  | "choosing_issue"
  | "step_up"
  | "loading"
  | "submitted"
  | "already_asked"
  | "error"
  | "offline"
  | "no_permission";

const DRAFT_KEY = "ndi-acc-request-draft";

export function AskNdiView() {
  const router = useRouter();
  const { organizations, relations, accreditations, activeOrgId, harness, personById, requestCapability, hydrated } = useDemo();
  const forced = useScreenState("SCR-ACC-06", [
    "live",
    "default",
    "choosing_verify",
    "choosing_issue",
    "step_up",
    "loading",
    "submitted",
    "already_asked",
    "error",
    "offline",
    "no_permission",
  ]) as Face;

  const [capability, setCapability] = useState<AccCapability | null>(null);
  const [purpose, setPurpose] = useState("");
  const [ask, setAsk] = useState<AskItem[]>([]);
  const [issue, setIssue] = useState<IssueType[]>([]);
  const [busy, setBusy] = useState<false | "sending" | "identity">(false);
  const [outcome, setOutcome] = useState<"submitted" | "E3" | "E6" | "offline" | null>(null);
  const [saved, setSaved] = useState(false);
  const [stepUp, setStepUp] = useState<"awaiting_scan" | "waiting">("awaiting_scan");

  /* "Change and ask again" reopens the declined request as it was; a
     saved draft otherwise. Read once from the address. */
  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get("from");
    const prior = from ? accreditations.find((a) => a.id === from) : undefined;
    if (prior) {
      setCapability(prior.capability);
      setPurpose(prior.purpose);
      setAsk(prior.ask);
      setIssue(prior.issue);
      return;
    }
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { capability: AccCapability | null; purpose: string; ask: AskItem[]; issue: IssueType[] };
        setCapability(d.capability);
        setPurpose(d.purpose);
        setAsk(d.ask);
        setIssue(d.issue);
      }
    } catch {
      /* Nothing to resume. */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (forced === "choosing_verify") setCapability("verifier");
    if (forced === "choosing_issue") setCapability("issuer");
  }, [forced]);

  const org = organizations.find((o) => o.id === activeOrgId);
  const name = org?.name ?? "Your organisation";
  const short = name.replace(/ (Pvt\. )?Ltd\.$/, "");
  const root = relations.find((r) => inOrg(org?.id ?? "")(r) && r.isRootAuthority && r.state === "ACTIVE");
  const rootName = root ? personById(root.personId).name : "its representative";
  const existing = capability ? accreditations.find((a) => a.orgId === activeOrgId && a.capability === capability && ["SUBMITTED", "IN_REVIEW", "PROPOSED", "PENDING_ACCEPTANCE", "LISTING", "ACTIVE"].includes(a.state)) : undefined;

  const natural: Face =
    root?.personId !== harness.persona
      ? "no_permission"
      : outcome === "submitted"
        ? "submitted"
        : outcome === "E3" || existing
          ? "already_asked"
          : outcome === "E6"
            ? "error"
            : busy
              ? "loading"
              : capability === "verifier"
                ? "choosing_verify"
                : capability === "issuer"
                  ? "choosing_issue"
                  : "default";
  const face: Face = forced === "live" ? natural : forced;

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const header = (
    <PageHeader crumbs={[{ label: name }, { label: "Verify or issue", href: "/verify-or-issue" }, { label: "Ask NDI" }]} title="Verify customers or issue credentials" />
  );
  const message = (text: React.ReactNode, action?: React.ReactNode) => (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status">
            <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-body">{text}</p>
            {action ? <div>{action}</div> : null}
          </div>
        </Panel>
      </div>
    </AppShell>
  );

  if (face === "no_permission") return message(`Only ${rootName}, who represents ${short}, can ask for this.`);
  if (face === "already_asked")
    return message("You've already asked for this. Here's where it stands.", <GradientButton onClick={() => router.push("/verify-or-issue")}>Go to status</GradientButton>);
  if (face === "submitted")
    return message(
      <>
        <Icon name="check" size={15} strokeWidth={2.4} className="mr-1.5 inline text-accent" />
        Sent. NDI will review it and a second administrator will decide. You&rsquo;ll see where it stands on your
        status page.
      </>,
      <GradientButton onClick={() => router.push("/verify-or-issue")}>Go to status</GradientButton>,
    );
  if (face === "loading")
    return message(busy === "identity" || forced === "loading" ? "Setting up your organisation's public identity…" : "Sending…");

  const ready = Boolean(capability && purpose.trim() && (capability === "verifier" ? ask.length : issue.length));

  const send = () => {
    if (!capability) return;
    if (face === "offline") {
      setOutcome("offline");
      return;
    }
    setBusy("sending");
    window.setTimeout(() => setBusy("identity"), LOCAL_MS);
    window.setTimeout(() => {
      setBusy(false);
      if (face === "error") {
        setOutcome("E6");
        return;
      }
      const r = requestCapability({ capability, purpose, ask: capability === "verifier" ? ask : [], issue: capability === "issuer" ? issue : [] });
      if (r.ok) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* Nothing saved. */
        }
        setOutcome("submitted");
      } else setOutcome(r.error === "E3" ? "E3" : r.error === "E6" ? "E6" : null);
    }, LOCAL_MS * 3);
  };

  const choices: { value: AccCapability; title: string; text: string; icon: "verify" | "issue" }[] = [
    {
      value: "verifier",
      title: "Verify customers",
      text: "Ask customers to share information from their NDI wallet — for example, to check they're over 18.",
      icon: "verify",
    },
    {
      value: "issuer",
      title: "Issue credentials",
      text: "Give people credentials they keep in their NDI wallet — for example, training certificates.",
      icon: "issue",
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
        {header}

        <div role="radiogroup" aria-label="What you want to do" className="grid gap-4 min-[761px]:grid-cols-2">
          {choices.map((c) => {
            const on = capability === c.value;
            return (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setCapability(c.value)}
                className="flex flex-col gap-2 rounded-[16px] border p-5 text-left transition-colors duration-150"
                style={{
                  borderColor: on ? "var(--accent)" : "var(--border-grid)",
                  background: on ? "var(--ndi-mint-04)" : "transparent",
                }}
              >
                <span className="flex items-center gap-2.5">
                  <Icon name={c.icon} size={18} strokeWidth={1.8} className="text-accent" />
                  <span className="font-display text-[16px] font-semibold text-strong">{c.title}</span>
                  {on ? <Icon name="check" size={15} strokeWidth={2.4} className="ml-auto text-accent" /> : null}
                </span>
                <span className="text-[13.5px] leading-[1.55] text-muted">{c.text}</span>
              </button>
            );
          })}
        </div>

        {face === "step_up" ? (
          <Panel>
            <WalletHandoff
              value="ndi-acc-step-up"
              title={`${VERIFICATION_ORG_NAME} is asking who you are`}
              purpose="Confirm with your NDI wallet. It's been a while since you last did, and this is sent in your name."
              sharing={["Your identity, from your citizen credential"]}
              notSharing={["Anything else in your wallet"]}
              status={stepUp}
              onSimulateScan={() => {
                setStepUp("waiting");
                window.setTimeout(() => setStepUp("awaiting_scan"), WALLET_HANDOFF_MS);
              }}
            />
          </Panel>
        ) : null}

        {capability ? (
          <Panel>
            <form
              className="relative z-[4] flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (ready && !busy) send();
              }}
            >
              {capability === "verifier" ? (
                <div className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>What you&rsquo;ll ask customers for</span>
                  <p className="m-0 text-[13px] leading-[1.6] text-muted">
                    Ask only for what you need. NDI checks this, and your customers will see what you ask for.
                  </p>
                  <ItemChooser value={ask} onChange={setAsk} />
                </div>
              ) : (
                <div className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>What you&rsquo;ll issue</span>
                  <IssueTypesEditor value={issue} onChange={setIssue} />
                </div>
              )}

              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>What it&rsquo;s for</span>
                <textarea
                  className={`${FIELD_CLASS} resize-y py-3`}
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder={capability === "verifier" ? "For example: checking customers are over 18 before selling tobacco" : "For example: certificates for people who finish our safety course"}
                />
              </label>

              <div className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3.5" style={{ background: "rgb(var(--tint) / 0.03)" }} aria-live="polite">
                <p className="m-0 text-[13.5px] leading-[1.6] text-body">{scopeSentence(short, capability, ask, issue)}</p>
                <p className="m-0 text-[13px] leading-[1.6] text-muted">
                  NDI checks that {short} is verified, that what you&rsquo;ve said it&rsquo;s for is specific, and that
                  you&rsquo;re asking for no more than that needs
                  {capability === "issuer" ? ", and that you're entitled to issue each credential" : ""}. It aims to
                  decide within 10 working days.
                </p>
                <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                  If NDI approves, {short} is added to NDI&rsquo;s public list of trusted organisations.
                </p>
                <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                  NDI will approve or decline this as you&rsquo;ve written it. They won&rsquo;t change it.
                </p>
              </div>

              {face === "error" && outcome === "E6" ? (
                <p role="alert" className="m-0 text-[13.5px] text-body">
                  We couldn&rsquo;t set up what your organisation needs to be listed. Nothing has been sent — try again.
                </p>
              ) : face === "error" ? (
                <p role="status" className="m-0 text-[13px] text-muted">
                  (Sending will fail here, to show what that looks like.)
                </p>
              ) : null}
              {face === "offline" ? (
                <p role="status" className="m-0 text-[13.5px] text-body">
                  {outcome === "offline"
                    ? "You're offline. Nothing has been sent, and what you entered is still here — try again when you're back."
                    : "You're offline. You can keep writing; sending waits until you're back."}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-2.5">
                <GradientButton type="submit" disabled={!ready || Boolean(busy) || face === "step_up"}>
                  {face === "error" && outcome === "E6" ? "Try again" : "Send to NDI"}
                </GradientButton>
                <HairlineButton
                  onClick={() => {
                    try {
                      localStorage.setItem(DRAFT_KEY, JSON.stringify({ capability, purpose, ask, issue }));
                      setSaved(true);
                    } catch {
                      /* Storage unavailable: nothing saved. */
                    }
                  }}
                >
                  Save and resume later
                </HairlineButton>
                <HairlineButton onClick={() => router.push("/verify-or-issue")}>Cancel</HairlineButton>
                {saved ? (
                  <span role="status" className="text-[12.5px] text-muted">
                    Saved in this browser.
                  </span>
                ) : null}
              </div>
            </form>
          </Panel>
        ) : null}
      </div>
    </AppShell>
  );
}
