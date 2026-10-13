# NDI Studio — Entity Wallet demo

A clickable, **frontend-only** demo of the Bhutan NDI **Entity Wallet**, built
inside the NDI-reskinned Studio console.

The Entity Wallet extends Bhutan NDI so an organisation can act as a **holder**
— receiving, holding and presenting verifiable credentials as a legal entity —
and can delegate scoped authority to its officers and agents. It is grounded in
the controllership model of the National Digital Identity Act of Bhutan 2023.

> **This is a prototype. There is no backend and no network layer.** Every
> register lookup, approval, revocation and verification decision is a fixture.
> The running demo says so too: the `prototype · data simulated` marker on
> every screen links to a page listing exactly which parts are simulated and
> what each would need to be real. See [What's real vs simulated](#whats-real-vs-simulated).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run typecheck
```

## The two things this demo has to explain

Authority is delegated two ways, and the UI's job is to make both legible as
faces of one product rather than two products:

- **Pattern A — delegation by access.** A Controller operates the entity's
  **server-side custodial** wallet through this console, within a scope the
  entity granted, subject to an approval policy. The entity's keys never leave
  the server; the Controller never holds them.
- **Pattern B — delegation by credential.** The entity issues Role and
  Capability credentials into a person's **own** wallet. That person acts at an
  external counterparty, and the authority is checked at the point of use,
  returning a signed PASS / FAIL with reasons.

Both share one legal root, one audit trail and one administration surface. Every
Pattern B credential traces back to an active controllership relation.

Three boundaries the UI must never blur: a Controller **acts for** the entity
and never **is** the entity (dual attribution everywhere); the personal wallet
only ever authenticates and evidences the *person*, never receives entity keys;
and an entity presentation is a **portal task** in this console, not a deep link
to a device, because the entity has no device.

## The story

One entity, one grant, one delegation, one failure — six acts. The cast:
**Pelden Trading Pvt. Ltd.**, with **Dorji Wangchuk** as Owner / Root Authority,
**Rinzin Dema** as Controller, and **Pema Choden** as a clearing agent
holding delegated authority; counterparties are Bank of Bhutan and BNSW.

| Act | What the audience learns |
|---|---|
| 1 · The entity becomes real | An organisation can hold credentials, and the platform never self-asserts its identity — a government register confirms it |
| 2 · Authority is granted, narrowly | Authority is a scoped, legally-grounded, *accepted* relation — not a role dropdown |
| 3 · The Controller works, under approval | Least disclosure, an approval gate, dual attribution in the audit trail |
| 4 · Authority is delegated to a person's wallet | The entity issues authority with public constraints a verifier can read |
| 5 · Authority is checked at the point of use | PASS, then FAIL with a real reason, on the same authority chain |
| 6 · There is recourse | Revocation carries a reason and an appeal |

Act 5 is the centre of the demo: a PASS beside a FAIL-with-a-reason on the same
chain explains delegated authority better than any diagram.

The prototype is delivered flow by flow, and this branch is Flow 1 — how
people get onto the platform: NDI's root administrator signing in, root
inviting a platform admin who sets up from the link, and a company's
director signing up for an account of their own. Demo controls → **Walk a
flow** starts each one as the right person, from the state it needs.

**New to it? Press Guided demo** (bottom-left of any screen): it walks those
three onboardings on screen and tells you what to press at each step. It
stops on the director's empty account, because that is where Flow 1 ends;
registering the company is Flow 2's branch.

**Presenting it? Read [`docs/running-the-demo.md`](docs/running-the-demo.md)** —
what is built, the act-by-act script, the Gate 2 flow walks, and what to say
when someone asks whether any of it is real.

Full spine, per-screen build depth and slice order: **[`docs/demo-plan.md`](docs/demo-plan.md)**.
Standing engineering rules: **[`CLAUDE.md`](CLAUDE.md)**.

## Stack

Next.js 16 (App Router), React 19, Tailwind v4 (CSS-first, **no config file**) —
the same stack as the Bhutan NDI website, so these components drop into the
Studio without translation. `next`, `react` and `react-dom` are the only runtime
dependencies, and that is a rule, not an accident.

## Structure

```
src/app/globals.css            tokens + @theme bridge — copied from the website's globals.css
src/app/layout.tsx             Host Grotesk / Inter / DM Mono via next/font, Atmosphere, DemoProvider
src/app/<path>/page.tsx        route stubs: metadata + one view, nothing else
src/styles/ndi-effects.css     the auth-relevant subset of the website's ndi-effects.css
src/components/layout/         AppShell (TopBar + Sidebar + footer), AuthShell, Atmosphere, ThemeToggle
src/components/ui/             the primitive kit — buttons, DataTable, Panel, StatusPill, Stepper, icons
src/features/<area>/           the actual screens, grouped by domain
src/lib/demoData.ts            types + SEED — every fixture in the demo
src/lib/demoStore.tsx          the whole data layer: one React context, localStorage-persisted
src/lib/theme.ts               pre-paint theme script, so a light visitor never sees a dark flash
public/media/logos/            the product lockup and marks
```

### The data layer

`demoStore.tsx` is a single client context exposing the seeded state plus the
actions that mutate it, persisted to `localStorage` under `ndi-studio-demo`.
There is no API, no auth and no socket. Wiring a real backend later means
replacing the action bodies in that one file — but that is explicitly not this
project's job.

This is the correct architecture for a comprehension demo, not a limitation of
one: with no server, **every wait is a design choice you author**. Round-trips
are tuned to ~1.5–2s with a visible skip, from a single constants file, because
a demo where the register check, the parked approval and the verification
decision all resolve instantly has demoed a CRUD app and thrown away the entire
trust argument.

### Navigation

The sidebar is hard-coded in `src/components/layout/Sidebar.tsx` (there is no
`constants/data.ts` here). It carries the Entity Wallet and nothing else —
Dashboard, Wallet, Approvals, Members, Controllership, Delegated authority,
Appeals, and NDI administration for the platform's administrators. The
inherited Studio issuer/verifier items (Users, Connections, Credentials,
Schemas, Trust, Ecosystems, Billing, invitations, developer settings) are no
longer in the nav; their routes still exist but nothing in the demo links to
them.

Which rows exist depends on who the demo is being driven as: they are
**absent** for a persona who may not use them, never disabled. A Controller
who can see a Controllership group they cannot open has been told that
administering their own authority is something they might do, which is the one
idea the product most needs them not to have. Approvals is filtered by the
persona's actual scope rather than a role list, so the nav and the authority
viewer cannot drift apart.

Held credentials live under `/wallet/*` rather than `/credentials/*`: the
existing `/credentials` tree is the **issuer** flow, and the entity's *held*
credentials are a different idea that must not collide with it.

## Design system

- **No colour is hard-coded in a component.** Restyle by editing `globals.css`
  only. Utilities like `bg-raised`, `text-muted`, `border-grid`, `font-display`
  come from the `@theme` blocks.
- **Tailwind v4 is CSS-first** — there is deliberately no `tailwind.config`,
  matching the website.
- **`ndi-effects.css` is a subset.** Pulling in another website effect
  (spotlight cards, circuit field, reveal-on-scroll) means copying that section
  across plus its one-line hook.
- `@property` registration for `--gradient-angle` is load-bearing for
  `ShinyButton`; without it the conic angle jumps instead of interpolating.
- Breakpoints are `min-[641px]` / `min-[901px]` arbitrary values, matching the
  website rather than Tailwind's defaults. The sidebar becomes a drawer below
  901px.
- 44px+ touch targets, hover displacement neutralised under `@media (hover:
  none)`, motion collapsed under `prefers-reduced-motion`.
- **Status is never colour-only** — `StatusPill` puts the meaning in the label
  and lets the dot reinforce it. Extend its map rather than bypassing it.

### Where this deviates from the website, and why

Places the website had no precedent, so the treatment is extrapolated from its
existing vocabulary — flag these if you'd rather they changed:

- **`HairlineButton`** — the website ships no outline/secondary button. This
  applies the chip's checked state and the mobile sheet's social-tile hover
  (1px mint border over a 2% white fill, hover to mint 8% + `--glow-sm`).
- **Disabled CTA** — the website's only disabled submit uses
  `disabled:opacity-70` mid-submit. A permanently disabled Next button at
  reduced opacity still read as pressable, so disabled drops the gradient for a
  flat `--surface-raised` fill.
- **Status line, not a toast** — the website has no toast component; status is
  inline `role="status"` with an icon. This is also the better call for a demo,
  so no toast primitive is planned.
- **Attached header, not the website's floating pill** — the Studio keeps its
  original anchored top bar, re-skinned in the NDI palette. An app shell reads
  as a workspace when its chrome is anchored; the pill belongs to a marketing
  page.

The left-rail illustrations (`scenes.tsx`) and auth headline copy are new — the
originals were generic blue stock art, and the site has no auth pages to borrow
from. Worth a review pass.

### Logo assets

| File | Use |
|---|---|
| `ndi-studio-on-dark.svg` / `ndi-studio-on-light.svg` | The product lockup — mark + "NDI STUDIO". What the header shows. |
| `ndi-mark-mint.png` | Mark only, 2496×2436, from the website repo. For favicons and tight spaces. |

## What's real vs simulated

Everything below the UI is simulated. Specifically, and worth saying out loud
before any walkthrough:

| Shown | Reality |
|---|---|
| A government register listing the organisations a person represents | Two fixed rows plus an authored delay. No register integration exists. |
| NDI manually reviewing an organisation the register could not match | A queue in browser storage. Uploaded files are reduced to their names. |
| Verification and invitation emails | Nothing is sent. A dashed prototype panel stands in for the inbox. |
| Approval-as-signature from a personal wallet | Fixture. The QR is a deliberate non-scannable stand-in (`QrPlaceholder`). |
| Revocation propagating to a verifier | Fixture. Nothing propagates anywhere. |
| The Bhutan National Single Window as a verifier | A stand-in page drawn as BNSW. The Single Window is not live yet — still in procurement as of August 2026; customs runs on DRC's eCMS today. |
| A signed PASS / FAIL verification decision | Derived live by `src/lib/avs.ts`, a named stand-in for the Authority Verification API. It walks the real chain and fails closed, but there is no service behind it. |
| An immutable, hash-chained audit trail | An array in `localStorage`. Clearing site data clears it. |
| A credential arriving in someone's personal wallet | A row in browser storage, plus a "simulate accepting" button. No phone is contacted. |
| Scope and approval enforcement | Rendered from fixtures. Enforcement belongs on the server and is not built. |

A fuller version of this table ships as a page inside the demo. Keep both
honest: the shell's `prototype · data simulated` marker and this section are the
difference between a useful prototype and a misled stakeholder.
