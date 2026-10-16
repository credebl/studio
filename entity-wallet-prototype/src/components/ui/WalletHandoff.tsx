"use client";

import { useState } from "react";

import { QrPlaceholder } from "./QrPlaceholder";
import { Icon } from "./icons";

/**
 * Pattern 8.1 — the bridge to somebody's personal wallet. One component, used
 * at every web-to-wallet moment, so a person learns it once.
 *
 * There are four of these moments and they look alike on purpose: stepping up
 * to prove who you are at onboarding, signing an approval, receiving an
 * issued credential, and authorising one specific transaction at a
 * counterparty. Building each separately is how you end up with four
 * different QR treatments and a user who has to work out, every time, what is
 * being asked of them.
 *
 * WHY IT LOOKS LIKE THE INTEGRATION PAGE
 *
 * The scan card is drawn after the NDI integration page every relying party
 * already embeds — "Scan with Bhutan NDI Wallet", the framed code with the
 * mark in its centre, the two steps, the store badges and the support line.
 * People in Bhutan have met that card on other services; meeting the same one
 * here says "this is the NDI Wallet asking", not "this console invented its
 * own QR". Recognition is a security property at this moment: a hand-off that
 * looks unfamiliar is one people either abandon or learn to approve blindly.
 *
 * THE SCAN, AND THE ONE PLACE A LINK REPLACES IT
 *
 * The console is a web portal mostly used at a desk, so the hand-off is a
 * scan. An "open mobile wallet" link used to sit under every code and was
 * taken out: at a desk it leads nowhere. It comes back in one form only,
 * `sameDevice`, which swaps the code for the link instead of adding it —
 * SCR-ORG-03 has a same-device state, because someone verifying their
 * organisation from their phone cannot scan the phone they are holding.
 * The cloud-wallet link stays out of scope for this release.
 *
 * WHAT IT ALWAYS SAYS
 *
 * `sharing` is not optional and there is no default. Every hand-off states
 * what will leave the wallet and why, beside the code, before the scan. A
 * wallet prompt that arrives without the web page having said what it is for
 * trains people to approve whatever their phone shows them — which is the
 * exact habit this whole product depends on them not having.
 *
 * THE BOUNDARY THIS COMPONENT MUST NEVER BLUR
 *
 * The personal wallet only ever authenticates and evidences the *person*. It
 * never receives the entity's keys or the entity's credentials. So the copy
 * here is always about proving who someone is or committing to something they
 * have read — never about the organisation's credentials moving onto a phone,
 * because they do not.
 */
export type HandoffStatus =
  | "awaiting_scan"
  | "waiting"
  | "verifying"
  | "confirmed"
  | "expired"
  | "failed";

const STATUS_COPY: Record<HandoffStatus, { label: string; detail: string }> = {
  awaiting_scan: {
    label: "Waiting to be scanned",
    detail: "Scan the code with the Bhutan NDI Wallet on your phone.",
  },
  waiting: {
    label: "Waiting for your wallet",
    detail: "The request has reached your wallet. Answer it there.",
  },
  verifying: {
    label: "Checking what came back",
    detail: "This can take a moment — it is a real check, not a formality.",
  },
  confirmed: { label: "Confirmed", detail: "Nothing more to do here." },
  expired: {
    label: "The request expired",
    detail: "Nothing was shared. Start again when you are ready.",
  },
  failed: { label: "That did not work", detail: "Nothing was shared." },
};

export function WalletHandoff({
  value,
  title,
  purpose,
  sharing,
  status,
  /** Overrides the stock line for this status, when a screen knows better. */
  statusDetail,
  onRetry,
  onCancel,
  onSkip,
  onSimulateScan,
  notSharing,
  sameDevice = false,
}: {
  /** What the code encodes. Only has to be distinctive, not resolvable. */
  value: string;
  title: string;
  /** Why this is being asked, in one sentence. */
  purpose: string;
  /** Exactly what leaves the wallet. Required — see the note above. */
  sharing: string[];
  status: HandoffStatus;
  statusDetail?: string;
  onRetry?: () => void;
  onCancel?: () => void;
  /** Present in the demo so a presenter is never stuck behind a wait. */
  onSkip?: () => void;
  /**
   * The code cannot be scanned, so while it waits the presenter needs a way
   * to stand in for the phone. Drawn as a prototype control, never as
   * product — see SimulatedStep.
   */
  onSimulateScan?: () => void;
  /** What the request does not ask for, where saying so matters (SCR-ORG-03). */
  notSharing?: string[];
  /** Opened on the phone that holds the wallet: a link instead of a code. */
  sameDevice?: boolean;
}) {
  /* On the phone itself there is nothing to scan: the wait is for the
     person to open the wallet, and the card's button is the stand-in. */
  const copy =
    sameDevice && status === "awaiting_scan"
      ? { label: "Waiting for you to open the wallet", detail: "Open Bhutan NDI Wallet on this phone and answer the request there." }
      : STATUS_COPY[status];
  const settled = status === "confirmed" || status === "expired" || status === "failed";
  const bad = status === "expired" || status === "failed";

  return (
    <div className="@container relative z-[4]">
      <div className="grid gap-6 @min-[720px]:grid-cols-[minmax(0,340px)_minmax(0,1fr)] @min-[720px]:items-start">
        {/* Side by side when there is room. Stacked, what will be shared
            comes first: the page says what the scan is for before the code
            asks anyone to scan it. */}
        <div className="order-2 @min-[720px]:order-1">
          {sameDevice ? (
            <OpenWalletCard closed={settled} onOpen={onSimulateScan} />
          ) : (
            <ScanCard value={settled ? null : value} dimmed={settled} />
          )}
        </div>

        {/* ---- What is happening, and what it costs you ---- */}
        <div className="order-1 flex min-w-0 flex-col gap-4 @min-[720px]:order-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-[15px] font-semibold leading-[1.3] text-strong">{title}</h3>
            <p className="max-w-[52ch] text-[13px] leading-[1.6] text-muted">{purpose}</p>
          </div>

          <div className="rounded-[12px] border border-grid px-3.5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">What you will share</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {sharing.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] leading-[1.5] text-body">
                  <Icon name="arrowRight" size={13} strokeWidth={2} className="mt-[4px] flex-none text-faint" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {notSharing?.length ? (
              <>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Not shared</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {notSharing.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] leading-[1.5] text-muted">
                      <Icon name="close" size={13} strokeWidth={2} className="mt-[4px] flex-none text-faint" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <p className="mt-2.5 text-[12px] leading-[1.5] text-faint">
              Your wallet proves who you are. It never receives the organisation&rsquo;s keys or
              credentials.
            </p>
          </div>

          {/* ---- Live status ---- */}
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-2.5 rounded-[12px] border px-3.5 py-3"
            style={{
              borderColor: bad ? "color-mix(in srgb, var(--ndi-danger) 35%, transparent)" : "var(--border-grid)",
              background: bad
                ? "color-mix(in srgb, var(--ndi-danger) 7%, transparent)"
                : status === "confirmed"
                  ? "var(--ndi-mint-08)"
                  : "rgb(var(--tint) / 0.04)",
            }}
          >
            {status === "verifying" || status === "waiting" ? (
              <Icon name="refresh" size={15} strokeWidth={2} className="mt-px flex-none animate-spin text-accent" />
            ) : (
              <Icon
                name={status === "confirmed" ? "check" : bad ? "close" : "info"}
                size={15}
                strokeWidth={2.2}
                className="mt-px flex-none"
                style={{
                  color: bad ? "var(--ndi-danger)" : status === "confirmed" ? "var(--accent)" : "var(--text-faint)",
                }}
              />
            )}
            <div className="flex min-w-0 flex-col gap-0.5">
              <p
                className="font-display text-[13px] font-medium leading-[1.4]"
                style={{
                  color: bad ? "var(--ndi-danger)" : status === "confirmed" ? "var(--accent)" : "var(--text-body)",
                }}
              >
                {copy.label}
              </p>
              <p className="text-[12.5px] leading-[1.5] text-muted">{statusDetail ?? copy.detail}</p>
            </div>
          </div>

          {onSimulateScan && status === "awaiting_scan" && !sameDevice ? (
            <div
              className="flex flex-col gap-2.5 rounded-[12px] border border-dashed px-3.5 py-3"
              style={{ borderColor: "var(--border-strong)", background: "rgb(var(--tint) / 0.03)" }}
            >
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                <span aria-hidden="true" className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: "var(--ndi-warning)" }} />
                Prototype · stands in for {sameDevice ? "answering in the wallet app" : "scanning with your phone"}
              </p>
              <div>
                <button
                  type="button"
                  onClick={onSimulateScan}
                  className="ndi-hairline-btn inline-flex h-10 items-center gap-2 rounded-[10px] px-3.5 font-display text-[13px] font-medium"
                >
                  <Icon name="scan" size={14} strokeWidth={2} />
                  {sameDevice ? "Simulate answering" : "Simulate the scan"}
                </button>
              </div>
            </div>
          ) : null}

          {/* ---- Ways out ---- */}
          {(onRetry && bad) || (onCancel && !settled) || (onSkip && !settled) ? (
            <div className="flex flex-wrap items-center gap-2.5">
              {onRetry && bad ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="ndi-hairline-btn inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-grid px-3.5 font-display text-[12.5px] font-medium"
                >
                  <Icon name="refresh" size={13} strokeWidth={2} />
                  Try again
                </button>
              ) : null}
              {onCancel && !settled ? (
                <button type="button" onClick={onCancel} className="ndi-plainlink text-[12.5px] font-medium text-muted">
                  Cancel
                </button>
              ) : null}
              {onSkip && !settled ? (
                <button type="button" onClick={onSkip} className="ndi-plainlink ml-auto text-[12.5px] font-medium text-faint">
                  Skip the wait
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * The same-device face: the wallet is on this phone, so the card opens it
 * rather than showing a code to scan. Opening it is the scan's stand-in —
 * the app cannot be launched from a prototype — so it goes through the same
 * simulate handler and says so.
 */
function OpenWalletCard({ closed, onOpen }: { closed: boolean; onOpen?: () => void }) {
  return (
    <section
      aria-label="Open Bhutan NDI Wallet"
      className="flex flex-col items-center gap-4 rounded-[28px] px-5 py-7 text-center @min-[720px]:px-6"
      style={{ background: "var(--scan-card)" }}
    >
      <p className="font-display text-[16.5px] font-semibold text-strong">
        Open <span className="text-accent">Bhutan NDI</span> Wallet
      </p>
      <p className="max-w-[30ch] text-[13px] leading-[1.55] text-muted">
        The request is waiting in the wallet app on this phone.
      </p>
      <button
        type="button"
        onClick={onOpen}
        disabled={closed || !onOpen}
        className="inline-flex h-11 items-center gap-2 rounded-full border-2 px-6 font-display text-[13.5px] font-medium text-accent disabled:opacity-40"
        style={{ borderColor: "var(--ndi-mint)" }}
      >
        <Icon name="wallet" size={15} strokeWidth={2} />
        Open the wallet
      </button>
      <p className="text-[11.5px] leading-[1.4] text-faint">Prototype — opening it answers the request</p>
    </section>
  );
}

/**
 * The integration page's card. Everything on it is what the real one carries;
 * the two things a prototype cannot honestly do are said on the card itself —
 * the code does not scan, and there is no video to watch.
 */
function ScanCard({ value, dimmed }: { value: string | null; dimmed: boolean }) {
  const [videoNote, setVideoNote] = useState(false);

  return (
    <section
      aria-label="Scan with Bhutan NDI Wallet"
      className="flex flex-col items-center gap-5 rounded-[28px] px-5 py-7 text-center @min-[720px]:px-6"
      style={{ background: "var(--scan-card)" }}
    >
      <p className="font-display text-[16.5px] font-semibold text-strong">
        Scan with <span className="text-accent">Bhutan NDI</span> Wallet
      </p>

      <div className="flex flex-col items-center gap-2">
        <div
          className="relative w-[200px] rounded-[20px] border-[3px] p-3"
          style={{ borderColor: "var(--ndi-mint)", background: "var(--qr-paper)", opacity: dimmed ? 0.4 : 1 }}
        >
          {value ? (
            <>
              <QrPlaceholder value={value} bare />
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 flex h-[46px] w-[46px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px]"
                style={{ background: "var(--ndi-mark-disc)", borderColor: "var(--qr-paper)" }}
              >
                <img src="/media/logos/ndi-mark-mint.png" alt="" width={28} height={28} className="h-7 w-7" />
              </span>
            </>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center">
              <span className="text-[12.5px]" style={{ color: "var(--qr-ink)" }}>
                Code closed
              </span>
            </div>
          )}
        </div>
        {/* Said plainly rather than hidden in a caption. A code that looks
            scannable and is not wastes somebody's time in a meeting. */}
        <p className="text-[11.5px] leading-[1.4] text-faint">Not a working code — this is a prototype</p>
      </div>

      <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-5 text-left text-[13px] leading-[1.55] text-muted">
        <li>Open Bhutan NDI Wallet on your phone</li>
        <li>
          Tap the scan button{" "}
          <span
            aria-hidden="true"
            className="mx-0.5 inline-flex h-[22px] w-[22px] translate-y-[5px] items-center justify-center rounded-full"
            style={{ background: "var(--ndi-mint)", color: "var(--text-on-mint)" }}
          >
            <Icon name="scan" size={12} strokeWidth={2.4} />
          </span>{" "}
          located on the menu bar and scan the QR code
        </li>
      </ol>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setVideoNote((v) => !v)}
          aria-expanded={videoNote}
          className="inline-flex h-10 items-center gap-2.5 rounded-full border-2 px-5 font-display text-[13px] font-medium text-accent"
          style={{ borderColor: "var(--ndi-mint)" }}
        >
          Watch video guide
          <span
            aria-hidden="true"
            className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
            style={{ background: "var(--ndi-mint)" }}
          >
            <svg viewBox="0 0 10 10" className="ml-px h-2 w-2" style={{ fill: "var(--scan-card)" }}>
              <path d="M2 1l7 4-7 4z" />
            </svg>
          </span>
        </button>
        {videoNote ? (
          <p role="status" className="text-[12px] leading-[1.5] text-faint">
            Prototype — the video guide isn&rsquo;t included here.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-[13px] text-muted">
          Don&rsquo;t have the Bhutan NDI Wallet? <span className="whitespace-nowrap font-semibold text-accent">Download now</span>
        </p>
        {/* Badges, not links: the prototype does not send anyone off to a
            store mid-demo. The real card links each to its listing. */}
        <div className="flex flex-wrap justify-center gap-2.5">
          <StoreBadge store="play" />
          <StoreBadge store="apple" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="font-display text-[13px] font-semibold text-accent">Get support</p>
        <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[13px] text-body">
          <a href="mailto:ndifeedback@bhutanndi.bt" className="ndi-plainlink inline-flex items-center gap-1.5">
            <Icon name="mail" size={14} strokeWidth={2} className="text-accent" />
            ndifeedback@bhutanndi.bt
          </a>
          <a href="tel:1199" className="ndi-plainlink inline-flex items-center gap-1.5">
            <Icon name="phone" size={14} strokeWidth={2} className="text-accent" />
            1199
          </a>
        </p>
      </div>
    </section>
  );
}

function StoreBadge({ store }: { store: "play" | "apple" }) {
  const play = store === "play";
  return (
    <span
      role="img"
      aria-label={play ? "Get it on Google Play" : "Download on the App Store"}
      className="inline-flex h-[42px] items-center gap-2 rounded-[8px] border px-3 text-left"
      style={{ background: "var(--store-badge)", color: "var(--store-badge-ink)", borderColor: "var(--store-badge-edge)" }}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px] flex-none" style={{ fill: "currentColor" }}>
        {play ? (
          <path d="M4.2 2.4c-.3.3-.4.7-.4 1.2v16.8c0 .5.1.9.4 1.2l9.3-9.6-9.3-9.6zm10.6 8.3 2.6-2.7-10.8-6.2c-.4-.2-.8-.3-1.1-.2l9.3 9.1zm0 2.6-9.3 9.1c.3.1.7 0 1.1-.2l10.8-6.2-2.6-2.7zm5.5-3.6-2.9-1.7-2.9 3 2.9 3 2.9-1.7c.9-.5.9-2.1 0-2.6z" />
        ) : (
          <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8zM14.1 5.8c.6-.8 1.1-1.8 1-2.8-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.3z" />
        )}
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[9px] tracking-[0.02em]">{play ? "GET IT ON" : "Download on the"}</span>
        <span className="mt-0.5 font-display text-[16px] font-medium tracking-[-0.01em]">
          {play ? "Google Play" : "App Store"}
        </span>
      </span>
    </span>
  );
}
