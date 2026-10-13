import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icons";

/**
 * The head of a signed-out card: a centred title, and for signup the two dots
 * that say how far in you are.
 *
 * Centred rather than left-aligned like the in-app page headers, because these
 * cards are the only thing on the screen — there is no column of content for a
 * flush-left title to line up with.
 */
export function AuthCardHeader({
  title,
  subtitle,
  steps,
}: {
  title: string;
  subtitle?: string;
  /** [current, total], 1-based. Omitted for a single-step card. */
  steps?: [number, number];
}) {
  return (
    <header className="relative z-[4] mb-6 flex flex-col items-center gap-3 text-center">
      {/* The step count reads as the eyebrow above the title, which is where
          this design system puts a label, and it says where you are in words
          rather than leaving two numbered discs to imply it. */}
      {steps ? <AuthSteps current={steps[0]} total={steps[1]} /> : null}

      <div>
        <h1 className="m-0 font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong [text-wrap:balance]">
          {title}
        </h1>
        {subtitle ? (
          <p className="m-0 mt-1.5 text-[14px] leading-[1.5] text-muted">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}

/**
 * Progress across a two-card flow: a mono count, then one hairline track per
 * step.
 *
 * It was a row of numbered discs joined by a 20px dash. At two steps that
 * shape has nothing to number — a disc reading "2" next to a disc reading "1"
 * tells you neither what either step is nor which you are on without decoding
 * the fill, and the connector was too short to read as a rail, so it looked
 * like a stray hyphen. The count states the position outright; the segments
 * carry it at a glance and grow to n steps without ever becoming a diagram.
 */
function AuthSteps({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex w-full max-w-[168px] flex-col items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
        Step {current} <span className="opacity-50">of</span> {total}
      </span>

      <span
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={`Step ${current} of ${total}`}
        className="flex w-full gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="h-[3px] flex-1 rounded-full transition-[background,box-shadow] duration-[--dur] ease-ndi"
            style={
              i + 1 <= current
                ? { background: "var(--grad-mint)", boxShadow: "var(--glow-sm)" }
                : { background: "var(--border-grid)" }
            }
          />
        ))}
      </span>
    </div>
  );
}

/** The one line under a card: the way out to the other flow. */
export function AuthFooterLink({
  prompt,
  action,
  onClick,
}: {
  prompt: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <p className="relative z-[4] m-0 mt-5 text-center text-[13.5px] text-muted">
      {prompt}{" "}
      <button type="button" onClick={onClick} className="ndi-plainlink font-medium text-accent">
        {action}
      </button>
    </p>
  );
}

/** Inline error, as the sample shows it: a bar above the field it concerns. */
export function AuthError({ message, onDismiss }: { message: ReactNode; onDismiss: () => void }) {
  return (
    <p
      role="alert"
      className="relative z-[4] m-0 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-[1.5]"
      style={{
        borderColor: "var(--text-danger)",
        background: "rgb(var(--tint) / 0.03)",
        color: "var(--text-danger)",
      }}
    >
      <Icon name="shieldAlert" size={15} strokeWidth={2} className="mt-px flex-none" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ndi-plainlink -mr-1 flex-none"
      >
        <Icon name="close" size={14} strokeWidth={2} />
      </button>
    </p>
  );
}

/**
 * A non-error notice inside a signed-out card: a notice that must be read
 * before acting (SCR-ONB-01's proxy warning), or a degraded state that is
 * not the person's fault (a request that did not send).
 *
 * Separate from AuthError because the two must not look alike. UX-EW-01's
 * error-banner rule — say what happened, whether anything was saved, and what
 * to do next — applies to both, but a connection dropping is not something
 * the person did, and red would say it was.
 */
export function AuthNotice({
  children,
  tone = "info",
  role,
}: {
  children: ReactNode;
  tone?: "info" | "warning";
  role?: "status" | "alert";
}) {
  return (
    <div
      role={role}
      className="relative z-[4] m-0 flex items-start gap-2.5 rounded-xl border border-grid px-3.5 py-3 text-[13px] leading-[1.55] text-body"
      style={{ background: "rgb(var(--tint) / 0.04)" }}
    >
      <Icon
        name="info"
        size={15}
        strokeWidth={2}
        className="mt-px flex-none"
        style={{ color: tone === "warning" ? "var(--ndi-warning)" : "var(--accent)" }}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
