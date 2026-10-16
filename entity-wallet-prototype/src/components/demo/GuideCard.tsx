"use client";

import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";
import { GUIDE_CHAPTERS, GUIDE_STEPS, onStepScreen } from "@/lib/demoGuide";

/**
 * The guided demo's card — the script, on the screen it is about.
 *
 * It sits bottom-right, away from the harness bar on the left, because it
 * has to stay readable while the presenter clicks the page behind it. It can
 * be minimised to a chip rather than closed, since the moment it is most in
 * the way (a wide form, the scope builder's right-hand panel) is also a
 * moment the presenter will want it back.
 *
 * Drawn as scaffolding, like the rest of the harness: the warning dot the
 * prototype marker uses, and "Guided demo" in the eyebrow, so nobody in the
 * room mistakes it for onboarding help the product would ship.
 */
export function GuideCard() {
  const router = useRouter();
  const pathname = usePathname();
  const { harness, hydrated, setGuideStep, setPersona } = useDemo();
  const [minimised, setMinimised] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const index = harness.guideStep ?? null;
  const step = index !== null ? GUIDE_STEPS[index] : undefined;

  const enter = (next: number, navigate: boolean) => {
    const target = GUIDE_STEPS[next];
    if (!target) return;
    if (target.persona) setPersona(target.persona);
    setGuideStep(next);
    if (navigate && target.route && !onStepScreen(target, pathname)) router.push(target.route);
  };

  /* Follow the presenter: when a click in the product lands on the next
     step's screen, move on. Only the next step is watched — a detour to some
     other page leaves the guide where it was. */
  useEffect(() => {
    if (index === null || !step) return;
    const next = GUIDE_STEPS[index + 1];
    if (!next || (!next.route && !next.match)) return;
    if (onStepScreen(next, pathname) && !onStepScreen(step, pathname)) enter(index + 1, false);
    // Runs on navigation only; `enter` is recreated every render.
  }, [pathname]);

  /* Move focus to the new step's title when it changes by button, so a
     keyboard user hears the new instruction rather than nothing. */
  useEffect(() => {
    if (!minimised) titleRef.current?.focus({ preventScroll: true });
  }, [index, minimised]);

  /* Make room rather than cover. A floating card sat on top of whatever
     the page put bottom-right — on a laptop that was the sign-up form's own
     Continue button, so following the guide meant hiding it first. While the
     card is open the page is inset by its size (see ndi-effects.css). */
  const showing = hydrated && index !== null && !!step && !minimised;
  useEffect(() => {
    const root = document.documentElement;
    if (showing) root.dataset.guide = "open";
    else delete root.dataset.guide;
    return () => {
      delete root.dataset.guide;
    };
  }, [showing]);

  if (!hydrated || index === null || !step) return null;

  const chapter = GUIDE_CHAPTERS[step.chapter];
  const last = index === GUIDE_STEPS.length - 1;
  const elsewhere = !onStepScreen(step, pathname);
  const progress = ((index + 1) / GUIDE_STEPS.length) * 100;

  if (minimised) {
    return (
      <button
        type="button"
        onClick={() => setMinimised(false)}
        className="ndi-hairline-btn pointer-events-auto fixed bottom-[68px] right-3 z-[72] inline-flex h-9 items-center gap-2 rounded-full border border-grid bg-[var(--chrome-fill-strong)] px-3.5 font-display text-[12.5px] font-medium backdrop-blur-[20px] min-[641px]:bottom-4 min-[641px]:right-4"
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ndi-warning)" }} />
        Guide · step {index + 1} of {GUIDE_STEPS.length}
        <Icon name="chevronDown" size={13} strokeWidth={2} style={{ transform: "rotate(180deg)" }} />
      </button>
    );
  }

  return (
    <section
      aria-label="Guided demo"
      className="pointer-events-auto fixed inset-x-3 bottom-[68px] z-[72] flex max-h-[46dvh] flex-col overflow-hidden rounded-2xl border border-grid bg-[var(--chrome-fill-strong)] shadow-[var(--shadow-card)] backdrop-blur-[20px] backdrop-saturate-[140%] min-[1100px]:inset-x-auto min-[1100px]:bottom-4 min-[1100px]:right-4 min-[1100px]:top-4 min-[1100px]:max-h-none min-[1100px]:w-[392px]"
    >
      {/* Progress through the whole story, not just this chapter. */}
      <div aria-hidden="true" className="h-[3px] w-full bg-[rgb(var(--tint)/0.08)]">
        <div className="h-full" style={{ width: `${progress}%`, background: "var(--ndi-mint)" }} />
      </div>

      <div className="flex items-start justify-between gap-3 px-4 pt-3">
        <p className="flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          <span aria-hidden="true" className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: "var(--ndi-warning)" }} />
          <span className="truncate">
            Guided demo · {step.chapter + 1}/{GUIDE_CHAPTERS.length} {chapter.title}
          </span>
        </p>
        <div className="-mr-1.5 -mt-1 flex flex-none items-center">
          <button
            type="button"
            onClick={() => setMinimised(true)}
            aria-label="Minimise the guide"
            className="ndi-navrow flex h-8 w-8 items-center justify-center rounded-[8px]"
            data-active="0"
          >
            <Icon name="chevronDown" size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setGuideStep(null)}
            aria-label="End the guided demo"
            className="ndi-navrow flex h-8 w-8 items-center justify-center rounded-[8px]"
            data-active="0"
          >
            <Icon name="close" size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-3 pt-1.5">
        <h2
          ref={titleRef}
          tabIndex={-1}
          aria-live="polite"
          className="m-0 font-display text-[16px] font-semibold leading-[1.3] text-strong outline-none"
        >
          {step.title}
        </h2>
        <p className="m-0 text-[13px] leading-[1.6] text-muted">{step.happening}</p>

        <div
          className="flex flex-col gap-1 rounded-[10px] border-l-[3px] px-3 py-2.5"
          style={{ borderColor: "var(--ndi-mint)", background: "var(--ndi-mint-08)" }}
        >
          <p className="m-0 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">Do this</p>
          <p className="m-0 text-[13px] leading-[1.6] text-body">{withBold(step.doThis)}</p>
        </div>

        {step.say ? (
          <p className="m-0 border-l-2 border-grid pl-3 text-[12.5px] italic leading-[1.55] text-faint">
            Say: &ldquo;{step.say}&rdquo;
          </p>
        ) : null}

        {elsewhere && step.route ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-dashed border-grid px-3 py-2">
            <span className="text-[12.5px] text-muted">This step is on another screen.</span>
            <button
              type="button"
              onClick={() => enter(index, true)}
              className="ndi-plainlink inline-flex items-center gap-1 text-[12.5px] font-medium text-accent"
            >
              Take me there
              <Icon name="arrowRight" size={13} strokeWidth={2} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-subtle px-4 py-2.5">
        <button
          type="button"
          onClick={() => enter(index - 1, true)}
          disabled={index === 0}
          className="ndi-hairline-btn inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 font-display text-[13px] font-medium disabled:opacity-40"
        >
          <Icon name="arrowLeft" size={14} strokeWidth={2} />
          Back
        </button>
        <span className="font-mono text-[11px] text-faint">
          {index + 1} / {GUIDE_STEPS.length}
        </span>
        <button
          type="button"
          onClick={() => (last ? setGuideStep(null) : enter(index + 1, true))}
          className="inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 font-display text-[13px] font-semibold"
          style={{ background: "var(--grad-mint)", color: "var(--text-on-mint)" }}
        >
          {last ? "Finish" : "Next"}
          {last ? null : <Icon name="arrowRight" size={14} strokeWidth={2} />}
        </button>
      </div>
    </section>
  );
}

/** `**text**` → bold. The script's only markup: on-screen names. */
function withBold(text: string): ReactNode {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-strong">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
