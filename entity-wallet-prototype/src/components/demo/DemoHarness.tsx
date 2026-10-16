"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";
import { FLOW_ENTRIES, FLOW_GROUPS, type FlowEntry } from "@/lib/demoStory";
import { PERSONAS } from "@/lib/demoData";

import { GuideCard } from "./GuideCard";
import { useScreenRegistry } from "./screenState";

/**
 * The demo harness: the marker, the guided demo, the spec'd flows, the
 * persona switcher, the state switcher and reset, in one bar.
 *
 * Deliberately not part of the product chrome. It sits in its own fixed bar
 * rather than in the top bar or the sidebar, because the audience for this
 * demo includes people signing the thing off, and a persona switcher that
 * looks like a product feature invites the question "so users can become
 * other users?". Everything here is visibly scaffolding.
 *
 * Collapsed by default. The marker stays visible either way — that part is
 * not a control, it is a disclosure, and it does not get to be dismissed.
 */
export function DemoHarness() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    harness,
    people,
    setPersona,
    setStateOverride,
    clearStateOverrides,
    resetDemo,
    restoreStoryState,
    setSelfServiceSignup,
    setGuideStep,
    startDayZero,
    startPlatformReady,
    startFirstDay,
    startTeamReady,
    hydrated,
  } = useDemo();

  /* The guided demo always starts from the platform's day zero: it begins
     before any business, with root setting NDI up, and a demo someone else
     half-ran would contradict the first thing it says. */
  const startGuide = () => {
    resetDemo();
    startDayZero();
    setGuideStep(0);
    setOpen(false);
  };
  const guiding = (harness.guideStep ?? null) !== null;
  const { registered } = useScreenRegistry();
  const [open, setOpen] = useState(false);

  /* The auth screens are pre-sign-in and have no persona. Showing a switcher
     there would suggest the choice matters before anyone is signed in.
     /welcome is signed in, but as the account being created in FLOW-ONB-01,
     which is not a persona — the switcher would offer to become someone the
     screen is not about. */
  const onAuthScreen =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/verify-email-success") ||
    /* The invitee opening their link is not a persona either: whether they
       have an account at all is the question SCR-INV-04 is answering. */
    pathname.startsWith("/invitation/");

  /** In story order, from the one list of who is drivable. The id is kept
   *  alongside so the switcher passes a PersonaId rather than a bare string. */
  const personas = [
    ...PERSONAS.flatMap((id) => {
      const person = people.find((p) => p.id === id);
      /* Nobody without an account can be driven as: on the platform's day
         zero that is almost everyone, and they appear as they sign up. */
      return person && person.hasAccount !== false ? [{ id: person.id, person }] : [];
    }),
    /* Then whoever joined by an invitation at an address the story does not
       know — each has a record of their own, and appears once they accept. */
    ...people
      .filter((p) => p.joinedBy && p.hasAccount !== false && !(PERSONAS as string[]).includes(p.id))
      .map((person) => ({ id: person.id, person })),
  ];

  const walk = (f: FlowEntry) => {
    resetDemo();
    if (f.start === "dayZero") startDayZero();
    else if (f.start === "platformReady") startPlatformReady();
    else if (f.start === "firstDay") startFirstDay();
    else if (f.start === "teamReady") startTeamReady();
    else restoreStoryState();
    if (f.persona) setPersona(f.persona);
    if (f.selfService !== undefined) setSelfServiceSignup(f.selfService);
    setOpen(false);
    router.push(f.route);
  };

  /* The marker renders on the server along with everything else, and is not
     gated on hydration. It is a disclosure rather than a control: a claim
     about what this page is that should survive slow JavaScript, a failed
     bundle and a screenshot taken before the client caught up.

     The panel is, in effect, gated anyway — `open` starts false, so nothing
     that reads persisted persona or act state can paint before the store has
     been read. The one thing worth waiting for is the act summary, which
     would otherwise show act 1 as Dorji for a frame before swapping to
     whichever act the story was left on. */
  return (
    /* `ndi-demo-harness` insets the bar past the sidebar on desktop. The bar
       is fixed to the viewport, so without it the marker and the panel sat on
       top of the nav rail rather than beside it — and the rail is exactly
       where somebody's eye is when they go looking for the demo controls.
       Which screens have a rail is not knowable from here (the verifier,
       onboarding and the what's-real page all render without one), so the
       rule keys off the shell's own presence in the document rather than a
       list of routes that would rot. */
    <div className="ndi-demo-harness pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-start gap-2 p-3 min-[641px]:p-4">
      <GuideCard />
      {open && hydrated ? (
        <div className="pointer-events-auto max-h-[calc(100dvh-80px)] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-grid bg-[var(--chrome-fill-strong)] p-3.5 shadow-[var(--shadow-card)] backdrop-blur-[20px] backdrop-saturate-[140%]">
          {/* ---- Guided demo ---- */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-3.5 py-3" style={{ background: "var(--ndi-mint-08)" }}>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="font-display text-[13.5px] font-semibold text-body">New to the demo?</p>
              <p className="text-[12.5px] leading-[1.5] text-muted">
                The guided demo walks the whole story and tells you what to press.
              </p>
            </div>
            <button
              type="button"
              onClick={startGuide}
              className="inline-flex h-9 flex-none items-center gap-1.5 rounded-[10px] px-3.5 font-display text-[13px] font-semibold"
              style={{ background: "var(--grad-mint)", color: "var(--text-on-mint)" }}
            >
              {guiding ? "Restart the guide" : "Start the guide"}
            </button>
          </div>

          {/* ---- The spec'd flows ---- */}
          <p className="font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
            Walk a flow
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {FLOW_GROUPS.map((g) => (
              <div key={g.id} className="flex flex-col gap-1.5">
                <p className="flex flex-wrap items-baseline gap-x-2 text-[12.5px]">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">{g.code}</span>
                  <span className="font-display font-medium text-muted">{g.title}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {FLOW_ENTRIES.filter((f) => f.group === g.id).map((f) => (
                    <button
                      key={f.label}
                      type="button"
                      onClick={() => walk(f)}
                      className="ndi-hairline-btn rounded-[9px] border border-grid px-2.5 py-1.5 font-display text-[12.5px] font-medium"
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ---- Persona ---- */}
          {!onAuthScreen ? (
            <>
              <div className="my-3 h-px bg-[var(--border-subtle)]" />
              <p className="font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
                Driving as
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {personas.map(({ id, person }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPersona(id)}
                    aria-pressed={harness.persona === id}
                    /* Names only, with the role on hover: eight two-line
                       cards took more room than the rest of the panel. */
                    title={person.title}
                    className="ndi-navrow rounded-[9px] px-2.5 py-1.5 font-display text-[12.5px] font-medium"
                    data-active={harness.persona === id ? "1" : "0"}
                  >
                    {person.name}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {/* ---- State switcher ----
              Folded away: it is a reviewer's tool for checking every state a
              screen declares (the rule that a state nobody can reach is not
              built), not something a demo audience needs to see. */}
          <div className="my-3 h-px bg-[var(--border-subtle)]" />
          <details className="group">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="chevronRight" size={12} strokeWidth={2.2} className="transition-transform duration-200 group-open:rotate-90" />
                For reviewers · this screen&rsquo;s states
              </span>
              {Object.keys(harness.stateOverrides).length > 0 ? (
                <span className="font-display text-[11px] font-medium normal-case tracking-normal text-accent">
                  {Object.keys(harness.stateOverrides).length} pinned
                </span>
              ) : null}
            </summary>
            {Object.keys(harness.stateOverrides).length > 0 ? (
              <button
                type="button"
                onClick={clearStateOverrides}
                className="ndi-plainlink mt-2 font-display text-[12px] font-medium text-muted"
              >
                Clear all
              </button>
            ) : null}
          {/* The acts beyond onboarding need the story three months on —
              appointed controllers, parked approvals, an authority to revoke.
              Out of the prototype's focus, so not a flow above; kept here so
              those screens can still be reviewed. */}
          <button
            type="button"
            onClick={() => {
              resetDemo();
              restoreStoryState();
              setPersona("dorji");
              setOpen(false);
              router.push("/dashboard");
            }}
            className="ndi-plainlink mt-2 flex items-center gap-1.5 font-display text-[12px] font-medium text-muted"
          >
            Beyond onboarding: open the story three months on
            <Icon name="arrowRight" size={12} strokeWidth={2} />
          </button>
          {registered ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {registered.states.map((s, i) => {
                const active = (harness.stateOverrides[registered.screen] ?? registered.states[0]) === s;
                return (
                  <button
                    key={s}
                    type="button"
                    /* The first entry is the natural state, so choosing it
                       removes the override rather than pinning it. */
                    onClick={() => setStateOverride(registered.screen, i === 0 ? null : s)}
                    aria-pressed={active}
                    className="ndi-navrow rounded-[9px] px-2.5 py-1.5 font-display text-[12.5px] font-medium"
                    data-active={active ? "1" : "0"}
                  >
                    {s.replace(/_/g, " ")}
                    {i === 0 ? <span className="text-faint"> · default</span> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-1.5 text-[12.5px] leading-[1.5] text-faint">
              This screen has not declared any states yet.
            </p>
          )}
          </details>

          {/* ---- Reset ---- */}
          <div className="my-3 h-px bg-[var(--border-subtle)]" />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] leading-[1.5] text-faint">
              Every register, approval and decision here is a fixture.
            </p>
            <button
              type="button"
              onClick={() => {
                /* Day zero starts where the story does: root signing in. */
                resetDemo();
                setOpen(false);
                router.push("/sign-in");
              }}
              className="ndi-hairline-btn inline-flex h-9 flex-none items-center gap-1.5 rounded-[10px] px-3 font-display text-[13px] font-medium"
            >
              <Icon name="refresh" size={14} strokeWidth={2} />
              Reset demo
            </button>
          </div>
        </div>
      ) : null}

      {/* ---- The marker, and the way in ---- */}
      {/* Each control keeps its label on one line; on a phone the row wraps
          rather than squeezing "Prototype · data simulated" into two broken
          lines beside two squeezed buttons. */}
      <div className="pointer-events-auto flex flex-wrap items-center gap-2 whitespace-nowrap">
        {/* A link, not a label. The marker's whole job is to stop somebody
            concluding that the register integration exists, and "prototype"
            on its own does not tell them which parts are simulated — the
            page behind it does. One click from every screen. */}
        <Link
          href="/whats-real"
          className="ndi-navrow inline-flex items-center gap-2 rounded-full border border-grid bg-[var(--chrome-fill-strong)] px-3 py-1.5 backdrop-blur-[20px]"
          data-active="0"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 flex-none rounded-full"
            style={{ background: "var(--ndi-warning)" }}
          />
          <span className="font-display text-[11.5px] font-medium tracking-[0.02em]">
            Prototype · data simulated
          </span>
          <Icon name="arrowRight" size={11} strokeWidth={2.2} className="flex-none opacity-60" />
        </Link>

        {/* The way in for someone who has never seen the demo: one obvious
            button, beside the controls rather than inside them. Hidden
            while the guide runs — its own card is the control then. */}
        {hydrated && !guiding ? (
          <button
            type="button"
            onClick={startGuide}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 font-display text-[12px] font-semibold"
            style={{ background: "var(--grad-mint)", color: "var(--text-on-mint)" }}
          >
            <svg aria-hidden="true" viewBox="0 0 10 10" className="h-2.5 w-2.5" style={{ fill: "currentColor" }}>
              <path d="M2 1l7 4-7 4z" />
            </svg>
            Guided demo
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="ndi-hairline-btn inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-display text-[12px] font-medium"
        >
          {open ? "Hide" : "Demo controls"}
          <Icon
            name="chevronDown"
            size={13}
            strokeWidth={2}
            className="transition-transform duration-200 ease-ndi"
            style={{ transform: `rotate(${open ? 0 : 180}deg)` }}
          />
        </button>
      </div>
    </div>
  );
}
