"use client";

import Link from "next/link";

import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon, type IconName } from "@/components/ui/icons";

/**
 * The page behind the prototype marker.
 *
 * WHY THIS IS A SCREEN AND NOT A PARAGRAPH IN THE README
 *
 * This demo shows a government register confirming a representative in a few
 * seconds, revocation reaching a counterparty instantly, and a signed
 * verification decision. Somebody in the room will conclude those are built —
 * and the person most likely to conclude it is the person deciding whether to
 * fund building them. A note in a repository nobody opens does not reach that
 * person; a page one click from the marker on every screen does.
 *
 * It is written to be handed over rather than narrated, because the question
 * usually arrives after the demo, by email, from somebody who was not there.
 *
 * HOW IT IS ORGANISED
 *
 * By what would have to be built, not by screen, because that is the question
 * being asked underneath "is this real?" — what is left to do. And the honest
 * answer includes the parts that *are* real: the model, the vocabulary and the
 * flow are genuine work product, and undersellling them is its own kind of
 * inaccuracy.
 */
interface Row {
  shown: string;
  reality: string;
  /** What would have to exist for this to be real. */
  needs: string;
}

const SIMULATED: { area: string; icon: IconName; rows: Row[] }[] = [
  {
    area: "Identity and the register",
    icon: "fingerprint",
    rows: [
      {
        shown: "A wallet proof request answered on a phone",
        reality:
          "An authored pause and a deliberately non-scannable code, on a card drawn after the NDI integration page. \"Simulate the scan\" stands in for the phone; the video guide and store badges go nowhere. No wallet is contacted and nothing is signed.",
        needs: "The existing NDI wallet proof-request flow, wired to this console.",
      },
      {
        shown: "The root administrator signing straight in to NDI's organisation",
        reality:
          "Root's account and Bhutan NDI's organisation are fixtures in the demo data. Signing in only matches the address to a person — any password works, and nothing is checked.",
        needs: "Root and NDI's organisation seeded by the deployment itself, with a hardware-backed second factor on root's account.",
      },
      {
        shown: "Platform admins and their decisions",
        reality:
          "Invitations and approvals live in your browser. \"The root account approves nothing\" and \"only an admin can decide\" are checked by the demo store, which is not a boundary.",
        needs: "Role checks and the audit of every decision enforced by the platform's services.",
      },
      {
        shown: "Issuer logos on credential cards",
        reality: "Initials in a seal. No real agency or bank logo is used.",
        needs: "Issuer display metadata, including logos, from the trust registry.",
      },
      {
        shown: "Self-service sign-up switched on or off",
        reality:
          "A demo control, so both ways onto the platform can be shown. In the product it is a deployment setting nobody using the console can change.",
        needs: "The FLOW-ONB-01 P3 setting, read at request time and enforced by the server.",
      },
      {
        shown: "The Corporate Regulatory Authority confirming a representative",
        reality:
          "A handful of fixed records and a four-second delay. No register is queried: typing one of the listed registration numbers decides the answer, and \"can't be reached\" or \"setting up stalls\" are buttons rather than faults.",
        needs:
          "Each authority's issuer agent raising the identity request and answering from its own register, and the authority designations (which type, which authority) from FLOW-ORG-02.",
      },
      {
        shown: "Setting up the organisation's wallet \"in a few minutes\"",
        reality:
          "A couple of seconds, and nothing is created: the registration added automatically is a fixture. Closing the page and coming back works because the stage is kept in your browser.",
        needs: "Agent and wallet provisioning, the brokered credential offer with automatic acceptance, and completion that survives the page closing.",
      },
      {
        shown: "Accepting an appointment with one NDI wallet approval, from \"Bhutan NDI Verification\"",
        reality:
          "No request is sent and nothing is signed. The name is a stand-in — the real one is set when NDI's verification organisation is created — and the acceptance wording is a placeholder awaiting GovTech's drafting.",
        needs:
          "NDI's dedicated verification organisation, a proof request whose challenge carries the appointment, and the versioned acceptance and attestation texts.",
      },
      {
        shown: "\"Tell us you're waiting\" and \"email me when it's done\"",
        reality: "Recorded in your browser. Nobody is emailed.",
        needs: "An interest store keeping the type and an address only, and a notification service.",
      },
    ],
  },
  {
    area: "Accounts and invitations",
    icon: "mail",
    rows: [
      {
        shown: "A verification email, and the link inside it",
        reality:
          "No email is sent. The dashed prototype panel stands in for the inbox, and the send limit is counted in your browser.",
        needs: "A mail service with delivery and bounce reporting, and single-use signed links.",
      },
      {
        shown: "An account with a password",
        reality: "Nothing is stored anywhere but your browser, and the password is not kept at all.",
        needs: "The platform's identity provider, with the password policy enforced server-side.",
      },
      {
        shown: "An invitation delivered, bouncing, or accepted",
        reality:
          "No invitation is sent; \"open the invitation as …\" stands in for the email, and the bounce in the story three months on is a seeded fixture. Setting up an account from the link keeps only the name — the link is trusted to prove the address because a real one would be single-use and signed. Acceptance re-checks are store logic, not a server.",
        needs: "Invitation service with expiry, revocation, single-use signed links and the acceptance-time re-checks run server-side.",
      },
      {
        /* Not simulated so much as not specified. Kind A was here too until
           FLOW-ONB-02 v0.6 specified it; Kind W still isn't. Listed so nobody
           at the showcase takes it as the spec. */
        shown: "NDI inviting an existing organisation to keep its own records",
        reality:
          "An invitation kind the prototype added. FLOW-ONB-02 specifies member, agency and administrator invitations; an existing organisation starts verification without being invited. It reuses the agency invitation's 30-day expiry. Invitees of it, and of administrator invitations, set up their account on the invitation instead of through sign-up — a departure from FLOW-ONB-02, whose version sends them through sign-up.",
        needs: "A decision on whether this belongs in FLOW-ONB-02 (or another flow), and on the set-up-from-the-link shortcut.",
      },
      {
        shown: "The root account, held by two custodians",
        reality:
          "One persona anyone can drive. The custodians and any reason typed in are kept in your browser, and \"every administrator is told\" is an entry in the activity feed — no alert goes anywhere, and there is no split credential.",
        needs: "A role account whose credential and MFA are split between two named custodians, the S9 limits checked server-side, and the alerting and custody register behind them.",
      },
      {
        shown: "Two administrators approving a designation or a new administrator",
        reality:
          "Dual control is enforced by the demo store, which also refuses and logs a self-approval or an approval by the root account — but the store is not a boundary.",
        needs: "Dual control enforced by the service, with the approver recorded in the audit trail.",
      },
    ],
  },
  {
    area: "Authority and enforcement",
    icon: "lockRounded",
    rows: [
      {
        shown: "Scope refusing an out-of-scope action",
        reality:
          "Every allow, deny and park in this demo is a value written into a fixture. Nothing is enforced — the screens render decisions they were handed.",
        needs:
          "Server-side enforcement: a guard that resolves active relations from the database and denies by default, plus a service-layer re-check before the agent call.",
      },
      {
        shown: "An approval holding an operation back, then releasing it",
        reality:
          "State in your browser. The re-validation at execution is modelled, but nothing is executed.",
        needs: "An approval-policy engine and a parked-operation store with real TTLs.",
      },
      {
        shown: "An approval signed from a wallet",
        reality:
          "A pause. The payload fingerprint shown is real in shape and random in content — nothing commits to anything.",
        needs: "Approval-as-presentation: the operation hash embedded in a proof request.",
      },
    ],
  },
  {
    area: "Delegated authority",
    icon: "send",
    rows: [
      {
        shown: "A credential arriving in someone's personal wallet",
        reality:
          "A row in browser storage, and a button labelled “simulate accepting”. Nobody's phone receives anything.",
        needs: "Role and Capability issuance carrying the public constraint schema.",
      },
      {
        shown: "A signed PASS / FAIL decision at a counterparty",
        reality:
          "Derived live, in the browser, by a stand-in that walks the real chain and fails closed. The logic is genuine; the service is not, and the signature is a random string of the right shape.",
        needs:
          "The Authority Verification API itself, independently scaled, plus a live status query on the revocation agent.",
      },
      {
        /* The one row here about a counterparty rather than about NDI. It is
           needed because the verifier page is drawn as the Single Window
           convincingly enough — its own chrome, "not part of NDI Studio" — that
           the natural conclusion is that BNSW exists and is ready to integrate.
           It is neither yet, and delegation is fast-follow scope precisely
           because it waits on a counterparty like this one. */
        shown: "The Bhutan National Single Window checking an authority",
        reality:
          "The Single Window is not live yet — its main system was still being procured when this was built (August 2026). The page is a stand-in drawn as BNSW because that is the eventual counterparty. Customs today runs on the Department of Revenue & Customs' eCMS, which licenses clearing agents and is the likely interim integration.",
        needs:
          "BNSW itself, or an eCMS integration in the meantime — and an agreed service level with whichever it is for the Authority Verification API.",
      },
      {
        shown: "Revocation reaching a verifier within a minute",
        reality: "Instant, because both sides are the same browser tab. Nothing propagates anywhere.",
        needs: "Status lists, and cache invalidation on the revocation agent.",
      },
    ],
  },
  {
    area: "Approval to verify or issue",
    icon: "certificate",
    rows: [
      {
        shown: "Organisations seen verifying or issuing without approval",
        reality:
          "A fixed list in the demo data. There is no capability gate observing anything, and the enforcement date is a date in a fixture.",
        needs: "The capability gate in observe mode, logging who verifies and issues, then switched to enforce on a decided date.",
      },
      {
        shown: "Two administrators, and the organisation accepting by name",
        reality:
          "\"The proposer can't approve it\", \"no approve against a recommended decline\" and \"only the owner accepts\" are checked by the demo store, which is not a boundary. The wallet approval is the same simulated scan as everywhere else.",
        needs: "Dual control enforced by the platform's services against distinct principals, and the identity-anchored acceptance on the real wallet proof flow.",
      },
      {
        shown: "Being added to NDI's public list of trusted organisations",
        reality:
          "\"Publishing your listing\" is a pause, then a state change in your browser. Nothing is written to any registry, and nobody else can see the list.",
        needs: "The Trust Registry write, with the 30-day lapse if it fails, and the public lookup.",
      },
      {
        shown: "A public identity set up in a moment",
        reality: "A random string shaped like a did:ethr identifier. No key is made and nothing is anchored.",
        needs: "DID creation on the national network, held in NDI's hosted keys.",
      },
      {
        shown: "Requests refused for asking outside what was approved",
        reality: "Fixture counts on the status page, shown only from the state switcher. Nothing is checked at the point of asking.",
        needs: "Scope checks at the capability gate, and the refusal log behind the count.",
      },
    ],
  },
  {
    area: "Designating an authority",
    icon: "shieldCheck",
    rows: [
      {
        shown: "Which authority confirms which kind of business",
        reality:
          "Designations and adoptions in your browser decide which types can be verified. The Corporate Regulatory Authority's is seeded as done; nothing reads a register or a schema.",
        needs: "The designation register and the adoption records in the Entity-Wallet Service, read by FLOW-ORG-01 P3 on every verification.",
      },
      {
        shown: "Activation checks — issuing identity, set-up, entitlements",
        reality:
          "Read from fields on the organisation in the demo data. \"Grant them\" flips a list in your browser; no marketplace is asked and no member is added.",
        needs: "Reads of org_agents, the ledger namespace and the marketplace entitlements, and adding NDI's service principal as VERIFIER.",
      },
      {
        shown: "Adopting what people will be asked, and stopping it",
        reality:
          "Version numbers and states in your browser. No schema is published, no proof request is stored, and stopping something changes only which types the demo treats as connected.",
        needs: "Write-once schema publication, the versioned proof request and authorisation written in one transaction, and the service account's permission enforced at the agent.",
      },
      {
        shown: "The second approver is always a named administrator",
        reality:
          "UX-EW-02 lets the root account approve a designation; FLOW-ONB-02 v0.6 is later and says the root account approves nothing. The prototype follows the later document.",
        needs: "The two documents agreeing.",
      },
    ],
  },
  {
    area: "Receiving a credential",
    icon: "credentials",
    rows: [
      {
        shown: "Pelden shares its registration with the tax office, and the office checks it",
        reality:
          "A timer moves the request from sending to waiting. No proof is requested or presented, no signature is checked, and the office's \"Verified\" panel reads Pelden's registration straight from the demo data.",
        needs: "The organisation's agent presenting the whole credential to the issuer's proof request, verified at the issuer before the request reaches anyone (FLOW-CRD-01 steps 4–8).",
      },
      {
        shown: "The tax office issues, and Pelden accepts",
        reality:
          "Issuing writes an offer into your browser; accepting copies it into Pelden's held credentials. Nothing is signed, nothing is stored in a wallet, and the 30-day offer window is a date nothing enforces except the accept button.",
        needs: "A credential offer over DIDComm to the organisation's agent, stored on acceptance, with the issuer's standing checked against NDI's list at that moment.",
      },
      {
        shown: "\"Have it ask for a bank account too\"",
        reality:
          "A prototype control. No issuer system exists to ask for more; the button writes the wider ask into the request so the consent screen can be shown.",
        needs: "The issuer's proof request, compared with what the business agreed to before anything more is shared.",
      },
      {
        shown: "Integration settings — webhook, secret, clients, delivery log",
        reality:
          "Fields in your browser. No URL is called, no secret exists behind the mask, and the test event and its latency are made up on the spot.",
        needs: "Signed webhook delivery from an outbox with retries, client credentials for the issuer's system, and the fallback to the officers' queue.",
      },
      {
        shown: "Creating a new offering",
        reality:
          "Not built. Existing offerings can be paused, retired or given a new version; a new one needs a prerequisite chooser limited to the office's approval to verify, which the prototype doesn't model.",
        needs: "SCR-CRD-07's composer, reading the issuer's verifier scope.",
      },
    ],
  },
  {
    area: "The record",
    icon: "fileText",
    rows: [
      {
        shown: "An append-only, hash-chained audit trail",
        reality:
          "An array in your browser's local storage. The fingerprints are random, the chain is not verified, and clearing site data erases the lot.",
        needs:
          "A dedicated append-only store, append-only at database-privilege level, with a per-organisation hash chain and externally anchored checkpoints.",
      },
      {
        shown: "An evidence bundle export",
        reality: "A confirmation message. No file is produced.",
        needs: "Export, and a format a third party can check without access to this console.",
      },
    ],
  },
];

const REAL = [
  "The authority model — controllership, scope, approval policy, the Role and Capability chain, and how they relate.",
  "The plain-language scope grammar, and the claim that a person can read an authority in five seconds.",
  "Every screen, state and refusal, including the ones nobody clicks their way to.",
  "The order of the flows, and which surface each step belongs to.",
  "The rule that the console renders decisions rather than making them — the demo is built that way so the real thing can be too.",
];

export function WhatsRealView() {
  return (
    <div className="min-h-dvh" style={{ background: "var(--surface-sunken)" }}>
      <main className="mx-auto flex w-full max-w-[900px] flex-col gap-6 px-4 py-8 min-[641px]:px-6 min-[901px]:py-12">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusPill status="pending" label="Prototype" />
            <span className="text-[12.5px] text-faint">Nothing below the interface is built</span>
          </div>
          <h1 className="font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.025em] text-strong">
            What&rsquo;s real, and what is simulated
          </h1>
          <p className="max-w-[64ch] text-[14px] leading-[1.7] text-muted">
            This is a front-end prototype of the Entity Wallet. Its job is to
            make us agree on what the product should be before anyone builds
            it. The screens and the model behind them are real work; everything
            underneath them is a fixture in your browser. This page says which
            is which, so nobody has to guess.
          </p>
        </div>

        {/* ---- What is real ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <Icon name="check" size={17} strokeWidth={2.3} className="flex-none text-accent" />
              <h2 className="font-display text-[16px] font-semibold text-strong">
                Real, and decided
              </h2>
            </div>
            <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
              These are conclusions, not placeholders. Changing them is a design
              decision rather than an implementation detail.
            </p>
            <ul className="mt-1 flex flex-col gap-2">
              {REAL.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Icon
                    name="check"
                    size={13}
                    strokeWidth={2.6}
                    className="mt-[5px] flex-none text-accent"
                  />
                  <span className="max-w-[64ch] text-[13.5px] leading-[1.6] text-body">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        {/* ---- What is not ---- */}
        {SIMULATED.map((group) => (
          <Panel key={group.area}>
            <div className="relative z-[4] flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px] border border-grid"
                  style={{ background: "rgb(var(--tint) / 0.04)" }}
                >
                  <Icon name={group.icon} size={15} strokeWidth={1.9} />
                </span>
                <h2 className="font-display text-[16px] font-semibold text-strong">
                  {group.area}
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {group.rows.map((row, i) => (
                  <div
                    key={row.shown}
                    className={`flex flex-col gap-2 ${i > 0 ? "border-t border-subtle pt-4" : ""}`}
                  >
                    <p className="font-display text-[13.5px] font-medium leading-[1.4] text-body">
                      {row.shown}
                    </p>
                    <p className="max-w-[64ch] text-[13px] leading-[1.6] text-muted">
                      {row.reality}
                    </p>
                    <p className="max-w-[64ch] text-[12.5px] leading-[1.55] text-faint">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
                        Would need
                      </span>{" "}
                      · {row.needs}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        ))}

        {/* ---- The blunt version ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <h2 className="font-display text-[16px] font-semibold text-strong">
              The short answer
            </h2>
            <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-body">
              There is no server, no database, no register integration, no
              Authority Verification API and no wallet. There is no network layer at
              all — the application makes no requests. Every organisation,
              person, credential, approval and decision you see lives in your
              browser&rsquo;s local storage and can be wiped with one button.
            </p>
            <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
              What it is good for: agreeing the model, testing whether people
              can read an authority, and finding out which screens are wrong
              while they are still cheap to change.
            </p>
            <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
              What it is not evidence of: that any of it works, or how long the
              real thing takes to build.
            </p>
          </div>
        </Panel>

        <div className="flex flex-wrap items-center gap-4 pb-2">
          <Link
            href="/dashboard"
            className="ndi-hairline-btn inline-flex h-11 items-center gap-2 rounded-[10px] border border-grid px-4 font-display text-[13.5px] font-medium"
          >
            <Icon name="arrowLeft" size={14} strokeWidth={2} />
            Back to the demo
          </Link>
          <span className="text-[12.5px] text-faint">
            This page is linked from the prototype marker on every screen.
          </span>
        </div>
      </main>
    </div>
  );
}
