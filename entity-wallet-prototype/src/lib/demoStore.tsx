"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { verifyAuthority, type VerificationRequestInput } from "./avs";
import { INVITATION_DAYS } from "./deployment";
import { scopeFor } from "@/features/appointment/presets";
import {
  NDI_ORG,
  PELDEN,
  PERSONAS,
  SEED,
  dayZeroState,
  firstRunState,
  platformReadyState,
  inOrg,
  isPlatformAdmin,
  roleIn,
  type Attribute,
  type AuthorityKind,
  type BulkUpload,
  type Certificate,
  type Connection,
  type ControllershipRelation,
  type CredDef,
  type Credential,
  type DelegatedAuthority,
  type DemoState,
  type Did,
  type Ecosystem,
  type EcosystemInvitation,
  type Invitation,
  type LedgerKind,
  type LegalBasis,
  type Member,
  type Organization,
  type OrgInvitation,
  type Person,
  type PersonId,
  type Schema,
  type Scope,
  type ScopeFilter,
  type OrgKind,
  type AppointmentDocument,
  type PresetId,
  standsNow,
  REGISTER_RECORDS,
  type Verification,
  type VerificationDecision,
} from "./demoData";

const STORAGE_KEY = "ndi-studio-demo";

/**
 * What a browser that has never run the demo sees, and what Reset returns
 * to: the platform's day zero — root's account and NDI's organisation, the
 * organisations already on NDI, and nothing else.
 *
 * It used to be the seed itself, which is the story three months in:
 * Pelden with its staff, controllers appointed, approvals waiting. Anyone
 * opening the prototype without pressing Guided demo — the link sent round
 * after a meeting, say — met a sign-in panel listing a dozen accounts and a
 * dashboard with seven tasks open, and the onboarding the prototype exists
 * to show had apparently already happened. The lived-in story is still the
 * seed, and still one click away for the acts beyond onboarding
 * (`restoreStoryState`); it is just no longer the front door.
 */
const FRESH: DemoState = dayZeroState(SEED);

/**
 * Bump this whenever a change to the SEED would leave a saved demo showing
 * something now known to be wrong.
 *
 * Saved state is otherwise merged over the seed, which is right for additive
 * changes — a new collection just appears — but wrong for corrections: a
 * browser that ran the demo last week would keep the old values until someone
 * pressed Reset, and the presenter is the one person who would not notice.
 * A save from a different seed version is discarded and the demo starts
 * fresh, which costs a presenter nothing they meant to keep.
 *
 *   1 — the original seed
 *   2 — DIDs corrected from did:indy to did:polygon
 *   3 — the running example: Pelden Trading, with Dorji as the director.
 *       Dorji and Rinzin swapped roles, so a version-2 save that says
 *       "driving as rinzin" meant the owner and would now mean the controller
 *       — the exact silent wrongness this guard exists to prevent.
 *   4 — Flow 1: people carry their membership role, and NDI's two platform
 *       administrators exist. The merge over the seed is shallow, so a
 *       version-3 save would bring back a people list with neither — an
 *       empty Members page and no one to approve a designation.
 *   5 — Flow 2 as list-then-select. The switcher key "A3" moved from the
 *       registration screen to the new choose-your-organisation screen, so a
 *       version-4 save holding an A3 override of "verified" would force the
 *       new screen into a state it does not have.
 *   6 — one organisation. A version-5 save would bring back the inherited
 *       Bhutan NDI and Royal University rows the seed no longer has.
 *   7 — the activity feed is Pelden's own history, not the inherited
 *       Studio issuer feed a version-6 save would keep showing.
 *   8 — organisations carry capabilities and members, and the platform's
 *       own people (root, platform admins, Bank of Bhutan's owner) exist. A
 *       version-7 organisation has no capabilities, and every nav rule
 *       reading them would treat Pelden as having no wallet.
 *   9 — Bhutan NDI's own organisation, and root's account made by the
 *       deployment. A version-8 save has neither, so root would sign in to
 *       no organisation at all.
 *  10 — NDI's staff renamed (Anand Acharya is root, Kinzang Dorji an admin)
 *       and moved to @bhutanndi.bt, so a version-9 save would show the old
 *       names beside the new guide copy.
 *  11 — Pelden's first day has one member, members who accept get records
 *       of their own, and activity entries carry their organisation. A
 *       version-10 save taken on the first day still lists the seed's
 *       colleagues in the controllership picker — the leak this fixes.
 *  12 — NDI is Anand (root) and Kinzang (platform admin) only: Kinley Wangdi
 *       and the inherited Studio staff list are gone, so a version-11 save
 *       would still offer to drive as someone the story no longer has.
 *  13 — Root is named "Root", not Anand Acharya, and approves nothing;
 *       Tshendu joins Kinzang as the second platform admin (FLOW-ONB-02
 *       v0.6). A version-12 save keeps the old name and one admin.
 *  14 — Flow 2 follows FLOW-ORG-01: one identifier, the authority decides,
 *       no manual review and no wallet requests to NDI. A version-13 save
 *       carries an onboarding with no stage and review cases nothing reads.
 */
const SEED_VERSION = 14;

/**
 * Appends one audit row, carrying the hash chain forward.
 *
 * Newest first, matching how the trail is read. The hashes are fixtures — this
 * is an array in localStorage, not a hash-chained store — but the *shape* has
 * to be right, because the integrity indicator is part of what the audit
 * screen has to show and a row with nowhere to put a hash cannot show it.
 *
 * Dual attribution is not optional here: every row takes an entity and an
 * acting person, so there is no way to write a row that records only one.
 */
function appendAudit(
  state: DemoState,
  entry: {
    operation: string;
    summary: string;
    actorId: string;
    relationId?: string | null;
    scopeVersion?: number | null;
    approvedById?: string | null;
    relyingPartyDid?: string | null;
    disclosedDigest?: string | null;
  },
): DemoState["auditEntries"] {
  const previous = state.auditEntries[0];
  const rowHash = `sha256:${Math.random().toString(16).slice(2, 10)}`;
  const entity =
    state.organizations.find((o) => o.id === state.activeOrgId)?.name ?? "The entity";

  return [
    {
      id: rid("au"),
      seq: (previous?.seq ?? 0) + 1,
      operation: entry.operation,
      summary: entry.summary,
      entity,
      actorId: entry.actorId,
      relationId: entry.relationId ?? null,
      scopeVersion: entry.scopeVersion ?? null,
      approvedById: entry.approvedById ?? null,
      relyingPartyDid: entry.relyingPartyDid ?? null,
      disclosedDigest: entry.disclosedDigest ?? null,
      at: new Date().toISOString(),
      prevHash: previous?.rowHash ?? "sha256:00000000",
      rowHash,
    },
    ...state.auditEntries,
  ];
}

/**
 * Accepting an offer, whether directly or because an approver released it.
 *
 * Shared rather than duplicated because the two paths must produce the same
 * result: the same credential in the wallet, the same audit row, differing
 * only in whether an approver is named on it. Two copies of this drift, and
 * the drift shows up as an audit trail that records approved operations
 * differently from automatic ones.
 */
function applyOfferAcceptance(
  state: DemoState,
  offerId: string,
  approverId: string | null,
): DemoState {
  const offer = state.offers.find((o) => o.id === offerId);
  if (!offer) return state;

  const relation = state.relations.find(
    (r) => r.personId === state.harness.persona && r.state === "ACTIVE",
  );

  return {
    ...state,
    offers: state.offers.map((o) => (o.id === offerId ? { ...o, state: "accepted" } : o)),
    heldCredentials: [
      {
        id: rid("hc"),
        type: offer.type,
        issuer: offer.issuer,
        issuerDid: offer.issuerDid,
        issuerTrusted: offer.issuerTrusted,
        /* Straight from the offer payload. The credential type and its
           attributes are what was actually offered, never anything a user
           typed — see the note at the top of demoData.ts. */
        attributes: offer.attributes,
        isFoundational: false,
        receivedAt: today(),
        expiresAt: offer.attributes.find((a) => a.name === "valid_until")?.value ?? null,
        status: "active",
      },
      ...state.heldCredentials,
    ],
    auditEntries: appendAudit(state, {
      operation: "credential:accept",
      summary: `Accepted ${offer.type} from ${offer.issuer}`,
      actorId: relation?.personId ?? state.harness.persona,
      relationId: relation?.id ?? null,
      scopeVersion: relation?.scope.version ?? null,
      approvedById: approverId,
    }),
  };
}

/**
 * Sending a presentation, whether directly or on approval.
 *
 * The audit row keeps a digest of what was disclosed and never the values.
 * That is the whole discipline of the trail: it has to prove what happened
 * without becoming a second copy of the data it was protecting.
 */
function applyPresentation(
  state: DemoState,
  requestId: string,
  attributes: string[],
  approverId: string | null,
): DemoState {
  const request = state.verificationRequests.find((v) => v.id === requestId);
  if (!request) return state;

  const relation = state.relations.find(
    (r) => r.personId === state.harness.persona && r.state === "ACTIVE",
  );

  return {
    ...state,
    verificationRequests: state.verificationRequests.map((v) =>
      v.id === requestId ? { ...v, state: "presented", disclosing: attributes } : v,
    ),
    auditEntries: appendAudit(state, {
      operation: "proof:present",
      summary: `Presented ${request.credentialType} to ${request.relyingParty} — ${
        attributes.length
      } ${attributes.length === 1 ? "attribute" : "attributes"} disclosed`,
      actorId: relation?.personId ?? state.harness.persona,
      relationId: relation?.id ?? null,
      scopeVersion: relation?.scope.version ?? null,
      approvedById: approverId,
      relyingPartyDid: request.relyingPartyDid,
      disclosedDigest: `sha256:${Math.random().toString(16).slice(2, 10)}`,
    }),
  };
}

/** Today, as the seed writes dates. Anything created in a demo is dated now. */
const today = () => new Date().toISOString().slice(0, 10);
/**
 * FLOW-ORG-01 P3 as the server would answer it: which entity types have a
 * connected authority (Flow 2 solution design §2.2). On day zero nobody has
 * designated any authority yet, so nothing is connected — the one condition
 * the demo has for it.
 */
const ROUTED_KINDS: OrgKind[] = ["company", "sole_proprietorship", "partnership"];
function connectedKinds(s: DemoState): OrgKind[] {
  return s.people.some((p) => p.platformRole === "admin" && p.hasAccount !== false) ? ROUTED_KINDS : [];
}

const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

/**
 * A DID shaped like the method it claims to be.
 *
 * This used to be `${method}:bhutan:<random>` for every method, which gave
 * did:polygon:bhutan:… and did:key:bhutan:… — shapes neither method uses.
 * Nobody reads a new DID closely in a demo, but a DID that is visibly the
 * wrong shape is the kind of detail an engineer in the room notices and then
 * stops trusting the rest. Random, not derived from anything: there are no
 * keys here to derive it from.
 */
const newDidId = (method: string): string => {
  const hex = (n: number) =>
    Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const base58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  switch (method) {
    case "did:polygon":
      return `did:polygon:0x${hex(40)}`;
    case "did:key":
      return `did:key:z6Mk${Array.from({ length: 44 }, () => base58[Math.floor(Math.random() * 58)]).join("")}`;
    case "did:web":
      return "did:web:issuer.bhutanndi.bt";
    default:
      return `${method}:${hex(32)}`;
  }
};
const rid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * FLOW-ONB-02 P7 — the named platform admins who are active: an account that
 * exists and is not locked or suspended. One definition, used wherever the
 * flow counts admins, as the spec asks.
 */
const activeAdmins = (s: DemoState) => s.people.filter((p) => p.platformRole === "admin" && p.hasAccount !== false);

/**
 * FLOW-ONB-02 P8 — whether the root account may issue another administrator
 * invitation: only while fewer than two named admins are active (S9). The
 * same answer decides whether SCR-INV-01 offers root the form at all, so the
 * screen never offers something the store would then refuse.
 *
 * There used to be a cap on pending invitations too — no more than it takes
 * to reach two. The spec dropped it on 14 Oct: the step-8 re-check already
 * stops a third admin, because a root-issued invitation accepted once two
 * are active is void (E6, AC-16), and a cap only made a mistyped address
 * harder to replace.
 */
function rootInviteBlock(s: DemoState): "two_active" | null {
  return activeAdmins(s).length >= 2 ? "two_active" : null;
}

/**
 * A person once their own wallet has proved who they are: confirmed, with the
 * masked citizenship number the proof returned. For someone the story knows
 * that is the number it already has for them; anyone else gets a fixture.
 */
function anchored(p: Person): Person {
  if (p.cidVerified) return p;
  const known = SEED.people.find((x) => x.id === p.id && x.cid !== "—");
  const cid = known?.cid ?? `•••• •••• ${String(1000 + Math.floor(Math.random() * 9000))}`;
  return { ...p, cidVerified: true, cid };
}

/**
 * FLOW-ONB-02 step 9 for a member invitation: the invitee joins the named
 * organisation at the named role, and gains nothing else (Q4).
 *
 * WHO THE MEMBER IS
 *
 * Someone the story already knows by that address — Ugyen, Rinzin — keeps
 * their record. Anyone else gets a record of their own, marked with the
 * invitation that brought them so the harness can drive as them. The first
 * version wrote every member into one shared "invitee" slot, so inviting a
 * second colleague quietly replaced the first on the Members page.
 *
 * WHAT JOINING DOES NOT DO
 *
 * It confirms nothing about who they are. Nobody has asked the register, and
 * nothing here should: identity is anchored when someone takes on authority
 * to act, not when they join (FLOW-ONB-02 §7.3). So a person joining from no
 * account is recorded as not confirmed, whatever the story's later acts say
 * about them; someone who already had an account elsewhere keeps what that
 * account says (AC-10 — one account, several organisations).
 *
 * The role goes on the organisation (`roles`), not on the person. Someone who
 * already has an account keeps their name and their role everywhere else:
 * the first version overwrote both, so inviting Bank of Bhutan's owner into
 * Pelden as an admin also made them an admin of the bank.
 */
function joinOrganisation(s: DemoState, inv: OrgInvitation, name: string, personId: PersonId): DemoState {
  const orgId = inv.orgId as string;
  const role = inv.role ?? "Member";
  const known = s.people.find((p) => p.id === personId);
  /* An existing account is named as it already is, not as typed here. */
  const shownName = known && known.hasAccount !== false ? known.name : name;
  const people: Person[] = known
    ? s.people.map((p) =>
        p.id !== personId
          ? p
          : p.hasAccount === false
            ? /* New to the platform: the story knows them, the platform does
                 not yet — no confirmed identity, so no CID either (that only
                 ever comes from their own wallet proof). */
              { ...p, name, memberRole: role, hasAccount: true, cidVerified: false, cid: "—", joinedBy: inv.id }
            : p,
      )
    : [
        ...s.people,
        {
          id: personId,
          name,
          cid: "—",
          email: inv.email,
          title: role === "Admin" ? "Administrator · joined by invitation" : "Member · joined by invitation",
          cidVerified: false,
          memberRole: role,
          hasAccount: true,
          joinedBy: inv.id,
        },
      ];
  return {
    ...s,
    people,
    organizations: s.organizations.map((o) =>
      o.id !== orgId
        ? o
        : {
            ...o,
            memberIds: o.memberIds.includes(personId) ? o.memberIds : [...o.memberIds, personId],
            members: o.memberIds.includes(personId) ? o.members : o.members + 1,
            roles: { ...o.roles, [personId]: role },
          },
    ),
    orgInvitations: s.orgInvitations.map((i) =>
      i.id === inv.id ? { ...i, state: "ACCEPTED" as const, decidedAt: today(), acceptedName: shownName } : i,
    ),
    /* The organisation's own history: its owner sees who joined, and when. */
    activity: [
      { id: rid("a"), text: `${shownName} joined as ${role === "Admin" ? "an admin" : "a member"}`, at: today(), orgId },
      ...s.activity,
    ].slice(0, 20),
  };
}

/**
 * The step-8 re-check every member acceptance runs, whichever screen it
 * came from: the invitation is still live, and the person who sent it may
 * still invite people to that organisation (S4). Null means it may go ahead.
 */
function memberInvitationRefusal(s: DemoState, inv: OrgInvitation | undefined): "E4" | "E5" | "E6" | "E7" | null {
  if (!inv || inv.kind !== "M" || !inv.orgId) return "E5";
  if (inv.state === "ACCEPTED") return "E7";
  if (inv.state === "VOID") return "E6";
  /* Expiry before the catch-all, so a lapsed invitation says it lapsed (E4)
     rather than that it was withdrawn (E5). */
  if (inv.state === "EXPIRED" || (inv.state === "PENDING" && inv.expiresAt !== null && inv.expiresAt < today())) return "E4";
  /* Declined, revoked, refused, waiting on approval — none can be accepted. */
  if (inv.state !== "PENDING") return "E5";
  const role = roleIn(
    s.organizations.find((o) => o.id === inv.orgId),
    s.people.find((p) => p.id === inv.invitedBy),
  );
  return role === "Owner" || role === "Admin" ? null : "E6";
}

/** Records the outcome of a refused member acceptance: E6 voids it, E4 expires it. */
function markRefused(s: DemoState, id: string, refusal: string): DemoState {
  if (refusal !== "E6" && refusal !== "E4") return s;
  return {
    ...s,
    orgInvitations: s.orgInvitations.map((i) =>
      i.id === id ? { ...i, state: refusal === "E6" ? ("VOID" as const) : ("EXPIRED" as const) } : i,
    ),
  };
}

interface DemoActions {
  addSchema: (input: {
    name: string;
    version: string;
    ledger: LedgerKind;
    attributes: Attribute[];
  }) => Schema;
  addCredDef: (input: { schemaId: string; tag: string; revocable: boolean }) => CredDef;
  addDid: (input: { method: string; keyType: string; alias: string }) => Did;
  setIssuerDid: (id: string) => void;
  removeDid: (id: string) => void;
  issueCredentials: (input: {
    holders: string[];
    schemaName: string;
    credDefTag: string;
    method: Credential["method"];
  }) => Credential[];
  setCredentialState: (id: string, state: Credential["state"]) => void;
  addVerification: (input: { holder: string; schemaName: string }) => Verification;
  setVerificationState: (id: string, state: Verification["state"]) => void;
  addConnection: (label: string) => Connection;
  addOrganization: (input: {
    name: string;
    description: string;
    website?: string;
    location?: string;
    visibility: Organization["visibility"];
  }) => Organization;
  updateOrganization: (id: string, patch: Partial<Organization>) => void;
  /** Removes the organization and everything it owned. See the note below. */
  deleteOrganization: (id: string) => void;
  setActiveOrg: (id: string) => void;
  respondToEcosystemInvitation: (id: string, state: EcosystemInvitation["state"]) => void;
  inviteMember: (input: { email: string; role: Member["role"] }) => Member;
  removeMember: (id: string) => void;
  addCertificate: (input: { commonName: string; keyType: string; expires: string }) => Certificate;
  removeCertificate: (id: string) => void;
  respondToInvitation: (id: string, state: Invitation["state"]) => void;
  addEcosystem: (name: string) => Ecosystem;
  inviteEcosystemMember: (organization: string) => void;
  addBulkUpload: (input: { fileName: string; records: number }) => BulkUpload;
  addApiKey: (label: string) => void;
  revokeApiKey: (id: string) => void;

  /* ---- Controllership ----
     The relation lifecycle, as an Owner and a Controller move a grant through
     it: DRAFT -> PENDING_ACCEPTANCE -> ACTIVE. */

  /** Creates a relation in DRAFT with an empty scope, ready for the builder. */
  addRelation: (input: {
    personId: string;
    legalBasis: LegalBasis;
    instrumentFileName?: string;
    instrumentReference?: string;
  }) => ControllershipRelation;
  /** Replaces a draft's scope. Bumps the version, which audit rows cite. */
  updateRelationScope: (id: string, scope: Scope) => void;
  sendRelationForAcceptance: (id: string) => void;
  /** The Controller's own acceptance. Only this makes a relation ACTIVE. */
  /**
   * The proposed controller's wallet proof, answered as they accept — where
   * identity is anchored for anyone who joined by invitation (FLOW-ONB-02
   * §7.3: "at appointment, not here"). The register's answer is a fixture.
   */
  confirmIdentity: (personId: string) => void;
  /** Refused (left unchanged) until the controller's identity is confirmed. */
  acceptRelation: (id: string) => void;

  /* ---- Flow 3 (FLOW-DEL-02, FLOW-DEL-01) ----
     The representative accepts responsibility; then gives a member
     authority from one of four presets; the member accepts with one wallet
     approval. Every refusal is decided here, not on the screen. */

  /**
   * SCR-DEL-01 — the representative accepts responsibility for the
   * organisation the authority just confirmed them for. E3 for anyone else.
   */
  acceptResponsibility: (orgId: string) => { ok: true } | { ok: false; error: "E3" | "E4" };
  /** SCR-DEL-01's decline (DEL-02/E2). Nothing moves; it can be reopened. */
  declineResponsibility: (orgId: string) => void;
  /** SCR-DEL-02 — give a member authority. Returns the appointment's id. */
  appoint: (input: {
    personId: PersonId;
    preset: PresetId;
    shareWith: string[];
    shareNeedsApproval: boolean;
    validUntil: string | null;
    document: AppointmentDocument | null;
  }) => { ok: true; id: string } | { ok: false; error: "E1" | "E3" | "E12" };
  /**
   * SCR-DEL-04 — the appointee's one wallet approval, which both confirms
   * who they are and records their acceptance (EW-FLOW3-SD/D7). `answeredAs`
   * is who the wallet proved; anyone but the appointee is E7, and the
   * reason is not given.
   */
  acceptAppointment: (id: string, answeredAs: PersonId) => { ok: true } | { ok: false; error: "E4" | "E7" | "E8" };
  /** SCR-DEL-03's decline (DEL-01/E5). */
  declineAppointment: (id: string) => void;
  declineRelation: (id: string, reason: string) => void;

  /* ---- The holder's daily loop (Pattern A) ----
     Accepting what the entity is offered, presenting what it is asked for,
     and the approval gate that sits between the two. */

  /** Takes an offered credential into the entity's wallet. */
  acceptOffer: (id: string) => void;
  declineOffer: (id: string) => void;
  /** Sends an offer to the approval queue instead of accepting it outright. */
  parkOffer: (id: string) => void;

  /** Sends a presentation, disclosing exactly these attributes. */
  presentProof: (requestId: string, attributes: string[]) => void;
  /** Parks a presentation, recording what it would disclose. */
  parkPresentation: (requestId: string, attributes: string[]) => void;
  declineVerificationRequest: (requestId: string) => void;

  /**
   * Records one approver's decision.
   *
   * When the last required signature lands, the held operation actually runs
   * — that is what makes this a gate rather than a status field.
   */
  approveOperation: (id: string, method: "web" | "wallet") => void;
  rejectOperation: (id: string, reason: string) => void;

  /* ---- Delegated authority (Pattern B) ---- */

  /** Issues a Role or Capability into a person's own wallet. Awaits their
   *  acceptance — acceptance is the holder's consent and cannot be assumed. */
  issueAuthority: (input: {
    kind: AuthorityKind;
    title: string;
    recipientId: string;
    parentId: string | null;
    taskScopes: string[];
    valueCap: { amount: number; currency: "BTN"; perTransaction: boolean } | null;
    counterparties: ScopeFilter;
    validFrom: string;
    validUntil: string;
  }) => DelegatedAuthority;
  acceptAuthority: (id: string) => void;
  /** Reversible. */
  suspendAuthority: (id: string, reason: string) => void;
  reactivateAuthority: (id: string) => void;
  /**
   * Final, and deliberately does NOT cascade a status onto its children —
   * see the note at the implementation. Raises the holder's appeal notice.
   */
  revokeAuthority: (id: string, reason: string) => void;

  /**
   * Runs a verification and keeps the decision.
   *
   * The decision comes from the stand-in verification service in `avs.ts`,
   * never from a component — see the long note in that file for why that
   * boundary matters and where it would be a real network call.
   */
  runVerification: (input: VerificationRequestInput) => VerificationDecision;

  /* ---- Appeals ---- */

  /** The holder's submission against a withdrawal. */
  submitAppeal: (id: string, submission: string) => void;
  /** An owner's decision on one. Upholding reinstates the authority. */
  decideAppeal: (id: string, outcome: "upheld_reinstated" | "rejected") => void;

  /* ---- Account creation (FLOW-ONB-01) ----
     Steps 1–8. Each maps to one step of the flow specification; nothing
     here decides whether an address is acceptable — the view renders E1 and
     E7 identically (S3), and the store records only what happened. */

  /** Step 2: record a provisional account and "send" the verification mail. */
  startSignup: (email: string) => void;
  /** Resend the verification mail. Throttled by the view against S4. */
  resendSignupMail: () => void;
  /** Step 4–5: the verification link is opened. Returns false if it was already used (E3). */
  consumeSignupLink: () => boolean;
  /** Steps 6–8: name and password set, account created, session issued. */
  completeSignup: (name: string) => void;
  /** Adds an organisation to the signing-up account. Flow 2 and Kind M call it. */
  addSignupMembership: (orgId: string, role: "Owner" | "Admin" | "Member") => void;
  /** Where to go once the account exists — set by an invitation link (A1).
   *  `email` pre-fills sign-up with the invited address, so the account is
   *  created for the address the invitation was sent to. */
  setSignupReturn: (path: string | null, email?: string) => void;
  /** Throw the session away and start again from an empty sign-up. */
  clearSignup: () => void;

  /* ---- Invitations (FLOW-ONB-02) ----
     The inviter and the approver are always the persona the console is
     driven as — never a field on the form. That mirrors INV-2: who is acting
     is derived from the session, and an id in the request is never
     authority. Results name the flow's error ids so the screens can render
     exactly the message the specification gives for each. */

  /** Kind M — the owner invites a person into the organisation (step 1).
   *  Not the inherited `inviteMember`, which belongs to the Studio users page
   *  and adds a row with no invitation behind it. */
  inviteToOrganisation: (input: { email: string; role: "Member" | "Admin" }) =>
    | { ok: true; id: string }
    /* E3 split in two, because the spec's copy differs: "{Name} is already a
       member", or an invitation to that address is already waiting. `member`
       is a name from this organisation only — nothing about accounts
       elsewhere is disclosed (S8). */
    | { ok: false; error: "E1" | "waiting" }
    | { ok: false; error: "E3"; member: string };
  /** Kind O — a platform admin proposes an organisation that does not exist yet. */
  proposeOrganisation: (input: {
    email: string;
    legalName: string;
    legalIdentity: string;
    purpose: string;
    needsSecondApproval: boolean;
  }) => { ok: true; id: string } | { ok: false; error: "E1" | "E12" };
  /**
   * Step 2 — a second administrator approves. Refuses self-approval (E11),
   * and the root account, which approves nothing (E13).
   */
  approveInvitation: (id: string) => { ok: true } | { ok: false; error: "E11" | "E13" };
  /** The second administrator declines to send it. */
  refuseInvitation: (id: string) => void;
  /**
   * Revoked by the inviter before acceptance (E5), or withdrawn before
   * approval. The root account gives a reason, which is logged (S9).
   */
  withdrawInvitation: (id: string, rootReason?: string) => void;
  /** Resend after a delivery failure (E8). The token stays the same. */
  resendInvitation: (id: string) => void;
  /** Steps 7–9 — accept, after re-checking the invitation is still good. */
  acceptInvitation: (id: string) =>
    | { ok: true }
    | { ok: false; error: "E4" | "E5" | "E6" | "E7" | "no_account" | "wrong_person" };
  /**
   * A member invitation's invitee sets up their account from the link — name
   * and password — which accepts it in the same step, after the same
   * re-checks as `acceptInvitation`. The person the story already knows by
   * that address keeps their record; anyone else gets one of their own.
   */
  setUpMember: (
    invitationId: string,
    name: string,
  ) => { ok: true; personId: PersonId } | { ok: false; error: "E4" | "E5" | "E6" | "E7" | "invalid" | "has_account" };
  /** A2 — the invitee declines. */
  declineInvitation: (id: string) => void;

  /* ---- Organisation onboarding (Flow 2, FLOW-ORG-01) ----
     Choose the type, type the identifier, answer the authority's identity
     request, wait while it decides. The authority's answers come from
     REGISTER_RECORDS, read only here: the store stands in for the authority
     and the Entity-Wallet Service, and the screens render what it returns. */

  /**
   * SCR-ORG-01 — begins, or begins again, with the type chosen. An
   * invitation or an existing organisation (Kind E) that started this is
   * carried through.
   */
  startOrgOnboarding: (kind: OrgKind, invitationId?: string | null, existingOrgId?: string | null) => void;
  /**
   * SCR-ORG-02 — steps 1–4. Creates the verification record and asks the
   * authority to raise its identity request. E3 when the registration is
   * already verified on the platform; the screen says nothing about why.
   */
  submitIdentifier: (identifier: string) => { ok: true } | { ok: false; error: "E3" | "E1" };
  /** SCR-ORG-03 — steps 5–6. The proof came back; the name is the credential's. */
  recordIdentityProof: (name: string, personId: PersonId) => void;
  /**
   * SCR-ORG-04 — steps 7–8. The authority checks its own records and
   * decides. Its answer is the store's to give and the screen's to show.
   */
  checkWithAuthority: () => "approved" | "not_confirmed";
  /** SCR-ORG-04's "notify me when it's done". */
  setVerificationNotify: (on: boolean) => void;
  /** SCR-ONB-05's "cancel" — the record is withdrawn, nothing was created. */
  cancelOrgOnboarding: () => void;
  /** SCR-ORG-06 — tell us you're waiting. Keeps the type and an address only. */
  recordOrgInterest: (kind: OrgKind, email: string) => void;
  /** Steps 9–11 — the organisation is set up, its registration accepted automatically. */
  completeOrgOnboarding: () => void;
  /** Leaves the first-run state for the story's lived-in one (acts 2–6). */
  restoreStoryState: () => void;

  /* ---- The platform's own setup ----
     Root invites platform admins; organisations ask for access and admins
     decide. Every decision is the store's, standing in for the server —
     screens render the answer, they do not make it. */

  /** The Entity Wallet's day zero: before any admin, before any business. */
  startDayZero: () => void;
  /** Day zero with one platform admin set up — see platformReadyState. */
  startPlatformReady: () => void;
  /**
   * Pelden Trading on the day it was registered, driven as Dorji — the start
   * of the member-invitation walk, without walking the whole onboarding
   * first to get there.
   */
  startFirstDay: () => void;
  /**
   * Pelden's first day after its people have joined: Ugyen and Pema have
   * accepted their invitations and hold no authority — where the controller
   * and delegate appointments start when walked on their own.
   */
  startTeamReady: () => void;
  /**
   * Sign in with an address. Resolves it to a person with an account and
   * drives the console as them; a stand-in for the server's answer, so the
   * screen only renders what comes back.
   */
  signIn: (email: string) => { ok: true; personId: PersonId | null } | { ok: false };
  /**
   * Kind A — someone is invited to administer the platform. A platform
   * admin's invitation waits for a second, distinct admin (P3, S2), and is
   * refused while fewer than two are active (E12). The root account's is
   * sent straight away, but only under S9 — fewer than two active, with the
   * custodians named, and a reason if one is given — and is otherwise
   * refused (E14).
   */
  invitePlatformAdmin: (
    email: string,
    root?: { reason: string; custodians: string },
  ) =>
    | { ok: true; id: string; queued: boolean }
    | { ok: false; error: "E1" | "E3" | "E12" | "E14" | "invalid" };
  /** P7 and P8, as the server would answer them — for SCR-INV-01 to render. */
  adminStatus: () => { active: number; rootBlock: "two_active" | null };
  /**
   * The invitee of a platform-admin invitation sets up their account from the
   * link — name and password — which accepts the invitation in the same step.
   */
  setUpPlatformAdmin: (
    invitationId: string,
    name: string,
  ) => { ok: true; personId: PersonId } | { ok: false; error: "E4" | "E5" | "E6" | "E7" | "invalid" | "has_account" };
  /**
   * A platform admin decides a request to issue or verify. There is no
   * request for a wallet: an organisation already on the platform verifies
   * itself with its authority (FLOW-ORG-01 Kind E), and NDI decides nothing
   * about it.
   */
  decideAccessRequest: (id: string, approve: boolean, reason?: string) => void;

  /* ---- Demo harness ----
     Not product surface. These drive the persona switcher, the story runner
     and the state switcher, which are what make the demo runnable by someone
     who is not the person who built it. */

  /** Switch who the console is being driven as. */
  setPersona: (persona: PersonId) => void;
  /** Jump the story to an act. 0 means "not started". */
  setAct: (act: number) => void;
  setRunnerOpen: (open: boolean) => void;
  /** Force one screen into one of its states, for review. */
  setStateOverride: (screen: string, state: string | null) => void;
  /** The deployment's self-service sign-up setting, switched for the demo. */
  setSelfServiceSignup: (on: boolean) => void;
  /** Move the guided demo to a step, or stop it with null. */
  setGuideStep: (step: number | null) => void;
  clearStateOverrides: () => void;

  /** Back to the platform's day zero (see FRESH), and the saved demo cleared. */
  resetDemo: () => void;
  /** False until the persisted state has been read, so lists can hold still. */
  hydrated: boolean;
}

/** Read-only lookups computed from state rather than stored in it. */
interface DemoDerived {
  /** The person the console is currently being driven as. */
  currentPerson: Person;
  /** Resolves an id to a person for dual attribution. Never fails. */
  personById: (id: string) => Person;
  /**
   * The entity types whose authority is connected — FLOW-ORG-01 P3, which
   * the server derives and the screen only renders. Empty on day zero:
   * until NDI has a platform administrator nobody has designated any
   * authority (that designation is FLOW-ORG-02's, and the demo folds it into
   * the platform being opened).
   */
  connectedKinds: OrgKind[];
}

type DemoContextValue = DemoState & DemoActions & DemoDerived;

const DemoContext = createContext<DemoContextValue | null>(null);

/**
 * The demo's single source of truth.
 *
 * State starts as the seed on both server and client so the first client
 * render matches the server's HTML; anything the visitor did in a previous
 * session is read from localStorage in an effect and swapped in afterwards.
 * Doing it the other way — reading storage during render — is the classic
 * hydration mismatch.
 */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(FRESH);
  const [hydrated, setHydrated] = useState(false);

  /* The actions memo is deliberately state-free so its callbacks stay stable,
     which leaves an action that has to *read* state with nowhere to read it
     from. A ref updated on every render is that place.

     Doing this inside a setState updater instead would be a real bug rather
     than a style choice: reactStrictMode is on, React invokes updaters twice
     in development, and a verification that derived its decision in there
     would record two of them per run. */
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { seedVersion?: number; state?: Partial<DemoState> };
        /* Merged over the seed rather than replacing it, so a state saved by an
           older build that lacks a newer collection still loads. A save with
           no version, or another version, predates a correction — see
           SEED_VERSION — and is dropped. */
        if (saved.seedVersion === SEED_VERSION && saved.state) {
          setState({ ...SEED, ...saved.state });
        }
      }
    } catch {
      /* Corrupt or unavailable storage just means the demo starts fresh. */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ seedVersion: SEED_VERSION, state }));
    } catch {
      /* Over quota or private mode — the demo still works for this session. */
    }
  }, [state, hydrated]);

  /* Each entry belongs to the organisation it happened in — the one being
     worked in, unless the caller names another. The feed on a dashboard is
     that organisation's history, and without the tag root inviting an
     administrator turned up in Pelden's "Recent activity". */
  const log = useCallback(
    (text: string, orgId?: string) =>
      setState((s) => ({
        ...s,
        activity: [{ id: rid("a"), text, at: today(), orgId: orgId ?? s.activeOrgId }, ...s.activity].slice(0, 20),
      })),
    [],
  );

  const actions = useMemo<DemoActions>(
    () => ({
      hydrated,

      addSchema: ({ name, version, ledger, attributes }) => {
        const schema: Schema = {
          id: `schema:bhutan:2:${name.replace(/\s+/g, "")}:${version}`,
          name,
          version,
          ledger,
          issuerDid: SEED.dids[0].id,
          attributes,
          createdAt: today(),
        };
        setState((s) => ({ ...s, schemas: [schema, ...s.schemas] }));
        log(`Schema ${name} v${version} created`);
        return schema;
      },

      addCredDef: ({ schemaId, tag, revocable }) => {
        const def: CredDef = {
          id: `creddef:bhutan:3:${tag}`,
          schemaId,
          tag,
          revocable,
          createdAt: today(),
        };
        setState((s) => ({ ...s, credDefs: [def, ...s.credDefs] }));
        log(`Credential definition ${tag} created`);
        return def;
      },

      addDid: ({ method, keyType, alias }) => {
        const did: Did = {
          id: newDidId(method),
          method,
          keyType,
          alias,
          isIssuer: false,
          createdAt: today(),
        };
        setState((s) => ({ ...s, dids: [did, ...s.dids] }));
        log(`DID created (${method})`);
        return did;
      },

      setIssuerDid: (id) => {
        setState((s) => ({
          ...s,
          dids: s.dids.map((d) => ({ ...d, isIssuer: d.id === id })),
        }));
        log("Issuing DID changed");
      },

      removeDid: (id) => setState((s) => ({ ...s, dids: s.dids.filter((d) => d.id !== id) })),

      issueCredentials: ({ holders, schemaName, credDefTag, method }) => {
        const created: Credential[] = holders.map((holder) => ({
          id: rid("cred"),
          holder,
          schemaName,
          credDefTag,
          state: "offered",
          issuedAt: today(),
          method,
        }));
        setState((s) => ({ ...s, credentials: [...created, ...s.credentials] }));
        log(
          holders.length === 1
            ? `Credential offered to ${holders[0]}`
            : `${holders.length} credentials offered`,
        );
        return created;
      },

      setCredentialState: (id, state) => {
        setState((s) => ({
          ...s,
          credentials: s.credentials.map((c) => (c.id === id ? { ...c, state } : c)),
        }));
        log(`Credential ${state}`);
      },

      addVerification: ({ holder, schemaName }) => {
        const v: Verification = {
          id: rid("ver"),
          holder,
          schemaName,
          state: "requested",
          requestedAt: today(),
        };
        setState((s) => ({ ...s, verifications: [v, ...s.verifications] }));
        log(`Presentation requested from ${holder}`);
        return v;
      },

      setVerificationState: (id, state) => {
        setState((s) => ({
          ...s,
          verifications: s.verifications.map((v) => (v.id === id ? { ...v, state } : v)),
        }));
        log(`Presentation ${state}`);
      },

      addConnection: (label) => {
        const c: Connection = { id: rid("c"), label, status: "invited", createdAt: today() };
        setState((s) => ({ ...s, connections: [c, ...s.connections] }));
        log(`Connection invited: ${label}`);
        return c;
      },

      addOrganization: ({ name, description, website, location, visibility }) => {
        const org: Organization = {
          id: rid("org"),
          name,
          description,
          role: "Owner",
          members: 1,
          createdAt: today(),
          website,
          location,
          visibility,
          capabilities: [],
          memberIds: [],
        };
        /* A newly created organization becomes the one you are working in —
           anything else means creating it and then having to go and find it. */
        setState((s) => ({
          ...s,
          organizations: [org, ...s.organizations],
          activeOrgId: org.id,
        }));
        log(`Organization ${name} created`);
        return org;
      },

      updateOrganization: (id, patch) => {
        setState((s) => ({
          ...s,
          organizations: s.organizations.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        }));
        log("Organization profile updated");
      },

      /* The ledger in this demo belongs to the organization you are working
         in — it is not scoped per organization the way a real deployment
         would be. So deleting one takes its schemas, definitions, ledger and
         connections with it, which is what the reference's cascade does and
         what the confirmation screen counts up. Reset restores the seed. */
      deleteOrganization: (id) =>
        setState((s) => {
          const organizations = s.organizations.filter((o) => o.id !== id);
          return {
            ...s,
            organizations,
            activeOrgId: organizations[0]?.id ?? "",
            schemas: [],
            credDefs: [],
            credentials: [],
            verifications: [],
            connections: [],
            bulkUploads: [],
            bulkRecords: [],
            members: s.members.filter((m) => m.role === "Owner"),
            activity: [
              { id: rid("a"), text: "Organization deleted", at: today() },
              ...s.activity,
            ].slice(0, 20),
          };
        }),

      setActiveOrg: (id) => {
        setState((s) => ({ ...s, activeOrgId: id }));
      },

      respondToEcosystemInvitation: (id, state) => {
        setState((s) => ({
          ...s,
          ecosystemInvitations: s.ecosystemInvitations.map((i) =>
            i.id === id ? { ...i, state } : i,
          ),
        }));
        log(`Ecosystem invitation ${state}`);
      },

      inviteMember: ({ email, role }) => {
        const m: Member = {
          id: rid("m"),
          name: email.split("@")[0].replace(/[._]/g, " "),
          email,
          role,
          status: "invited",
          joinedAt: today(),
        };
        setState((s) => ({ ...s, members: [...s.members, m] }));
        log(`${email} invited as ${role}`);
        return m;
      },

      removeMember: (id) => setState((s) => ({ ...s, members: s.members.filter((m) => m.id !== id) })),

      addCertificate: ({ commonName, keyType, expires }) => {
        const cert: Certificate = {
          id: rid("x509"),
          commonName,
          keyType,
          validFrom: today(),
          expires,
          status: "valid",
        };
        setState((s) => ({ ...s, certificates: [cert, ...s.certificates] }));
        log(`Certificate added for ${commonName}`);
        return cert;
      },

      removeCertificate: (id) =>
        setState((s) => ({ ...s, certificates: s.certificates.filter((c) => c.id !== id) })),

      respondToInvitation: (id, state) => {
        setState((s) => ({
          ...s,
          invitations: s.invitations.map((i) => (i.id === id ? { ...i, state } : i)),
        }));
        log(`Invitation ${state}`);
      },

      addEcosystem: (name) => {
        const eco: Ecosystem = { id: rid("eco"), name, role: "Lead", members: 1, joinedAt: today() };
        setState((s) => ({ ...s, ecosystems: [eco, ...s.ecosystems] }));
        log(`Ecosystem ${name} created`);
        return eco;
      },

      inviteEcosystemMember: (organization) => {
        setState((s) => ({
          ...s,
          ecosystemMembers: [
            ...s.ecosystemMembers,
            {
              id: rid("em"),
              organization,
              role: "Issuer",
              joinedAt: today(),
              status: "invited",
            },
          ],
        }));
        log(`${organization} invited to the ecosystem`);
      },

      addBulkUpload: ({ fileName, records }) => {
        /* A demo upload that always succeeds teaches nothing about the failure
           report, so a small share of rows fail the way real ones do. */
        const failed = Math.min(records, Math.round(records * 0.02));
        const upload: BulkUpload = {
          id: rid("bulk"),
          fileName,
          records,
          succeeded: records - failed,
          failed,
          status: failed > 0 ? "partial" : "completed",
          uploadedAt: today(),
        };
        setState((s) => ({ ...s, bulkUploads: [upload, ...s.bulkUploads] }));
        log(`Bulk upload ${fileName} ${upload.status}`);
        return upload;
      },

      addApiKey: (label) => {
        setState((s) => ({
          ...s,
          apiKeys: [
            {
              id: rid("key"),
              label,
              masked: `ndi_live_••••••••${Math.random().toString(16).slice(2, 6)}`,
              createdAt: today(),
              lastUsed: "—",
              status: "active",
            },
            ...s.apiKeys,
          ],
        }));
        log(`API key ${label} created`);
      },

      revokeApiKey: (id) =>
        setState((s) => ({
          ...s,
          apiKeys: s.apiKeys.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)),
        })),

      addRelation: ({ personId, legalBasis, instrumentFileName, instrumentReference }) => {
        const relation: ControllershipRelation = {
          id: rid("rel"),
          personId,
          legalBasis,
          instrument: instrumentFileName
            ? {
                fileName: instrumentFileName,
                /* The instrument itself is never stored — only a hash and a
                   reference to wherever the signed original lives. In a demo
                   the hash is decorative, but the shape has to be right or
                   the screen teaches the wrong model. */
                hash: `sha256:${Math.random().toString(16).slice(2, 10)}${Math.random()
                  .toString(16)
                  .slice(2, 10)}`,
                reference: instrumentReference || "—",
              }
            : null,
          scope: {
            version: 1,
            validFrom: today(),
            validUntil: null,
            grants: [],
          },
          state: "DRAFT",
          isRootAuthority: false,
          createdAt: today(),
          acceptedAt: null,
          activatedAt: null,
        };
        setState((s) => ({ ...s, relations: [relation, ...s.relations] }));
        return relation;
      },

      updateRelationScope: (id, scope) =>
        setState((s) => ({
          ...s,
          relations: s.relations.map((r) =>
            r.id === id
              ? {
                  ...r,
                  /* A new version on every save, because an audit row cites
                     the version it matched and two different scopes sharing a
                     number would make the trail unreadable. */
                  scope: { ...scope, version: r.scope.version + 1 },
                }
              : r,
          ),
        })),

      sendRelationForAcceptance: (id) =>
        setState((s) => ({
          ...s,
          relations: s.relations.map((r) =>
            r.id === id ? { ...r, state: "PENDING_ACCEPTANCE" } : r,
          ),
        })),

      confirmIdentity: (personId) =>
        setState((s) => ({ ...s, people: s.people.map((p) => (p.id === personId ? anchored(p) : p)) })),

      acceptRelation: (id) =>
        setState((s) => {
          const relation = s.relations.find((r) => r.id === id);
          if (!relation) return s;
          const person = s.people.find((p) => p.id === relation.personId);
          /* Nobody acts for the entity without a confirmed identity. The
             screen asks for the wallet proof first, but the refusal is here,
             because the screen is not the boundary. */
          if (!person?.cidVerified) return s;
          return {
            ...s,
            activity: [
              { id: rid("a"), text: `${person.name} accepted the duties of a controller`, at: today(), orgId: relation.orgId ?? PELDEN },
              ...s.activity,
            ].slice(0, 20),
            relations: s.relations.map((r) =>
              r.id === id
                ? { ...r, state: "ACTIVE", acceptedAt: today(), activatedAt: today() }
                : r,
            ),
            auditEntries: appendAudit(s, {
              operation: "relation:accept",
              summary: `${person?.name ?? "A controller"} accepted the duties of a controller`,
              actorId: relation.personId,
              relationId: relation.id,
              scopeVersion: relation.scope.version,
            }),
          };
        }),

      acceptResponsibility: (orgId) => {
        const s0 = stateRef.current;
        const root = s0.relations.find((r) => inOrg(orgId)(r) && r.isRootAuthority);
        /* Only the person the authority named. The screen shows anyone else
           the reason instead of the control, but this is the boundary. */
        if (!root || root.personId !== s0.harness.persona) return { ok: false, error: "E3" };
        if (!s0.organizations.find((o) => o.id === orgId)?.capabilities.includes("holder")) return { ok: false, error: "E4" };
        setState((s) => ({
          ...s,
          responsibilities: [
            ...s.responsibilities.filter((r) => r.orgId !== orgId),
            { orgId, state: "ACCEPTED", at: today() },
          ],
          relations: s.relations.map((r) =>
            r.id === root.id ? { ...r, state: "ACTIVE", acceptedAt: today(), activatedAt: today() } : r,
          ),
        }));
        return { ok: true };
      },

      declineResponsibility: (orgId) =>
        setState((s) => ({
          ...s,
          responsibilities: [
            ...s.responsibilities.filter((r) => r.orgId !== orgId),
            { orgId, state: "DECLINED", at: today() },
          ],
        })),

      appoint: ({ personId, preset, shareWith, shareNeedsApproval, validUntil, document }) => {
        const s0 = stateRef.current;
        const orgId = s0.activeOrgId;
        const root = s0.relations.find((r) => inOrg(orgId)(r) && r.isRootAuthority && r.state === "ACTIVE");
        /* DEL-01/P1: the representative, and nobody else, appoints. */
        if (!root || root.personId !== s0.harness.persona) return { ok: false, error: "E1" };
        /* DEL-01/E3: one appointment per person per organisation at a time. */
        if (s0.relations.some((r) => inOrg(orgId)(r) && r.personId === personId && !r.isRootAuthority && standsNow(r, today())))
          return { ok: false, error: "E3" };
        if (preset === "share" && shareWith.length === 0) return { ok: false, error: "E12" };
        const id = rid("rel");
        const now = today();
        const person = s0.people.find((p) => p.id === personId);
        setState((s) => ({
          ...s,
          relations: [
            {
              id,
              orgId,
              personId,
              legalBasis: "entity_consent",
              instrument: null,
              scope: scopeFor(preset, shareWith, shareNeedsApproval, now, validUntil),
              state: "PENDING_ACCEPTANCE",
              isRootAuthority: false,
              createdAt: now,
              acceptedAt: null,
              activatedAt: null,
              preset,
              shareNeedsApproval,
              attestation: { attestedBy: s.harness.persona, attestedAt: now },
              document,
              expiresAt: inDays(14),
              verifiedName: null,
            },
            ...s.relations,
          ],
          activity: [
            { id: rid("a"), text: `Authority offered to ${person?.name ?? "a member"}, waiting for them to accept`, at: now, orgId },
            ...s.activity,
          ].slice(0, 20),
        }));
        return { ok: true, id };
      },

      acceptAppointment: (id, answeredAs) => {
        const s0 = stateRef.current;
        const r = s0.relations.find((x) => x.id === id);
        if (!r || r.state !== "PENDING_ACCEPTANCE") return { ok: false, error: "E8" };
        if (r.expiresAt && r.expiresAt < today()) return { ok: false, error: "E4" };
        /* The wallet answered as somebody else. Deliberately not explained —
           to the person presenting, or to the representative (E7). */
        if (answeredAs !== r.personId) return { ok: false, error: "E7" };
        const person = s0.people.find((p) => p.id === r.personId);
        setState((s) => ({
          ...s,
          /* The one scan anchors them too: an appointee who joined by
             invitation is confirmed here (FLOW-ONB-02 §7.3). */
          people: s.people.map((p) => (p.id === r.personId ? anchored(p) : p)),
          relations: s.relations.map((x) =>
            x.id === id
              ? { ...x, state: "ACTIVE", acceptedAt: today(), activatedAt: today(), verifiedName: person?.name ?? null }
              : x,
          ),
          activity: [
            { id: rid("a"), text: `${person?.name ?? "The appointee"} accepted authority to act`, at: today(), orgId: r.orgId ?? PELDEN },
            ...s.activity,
          ].slice(0, 20),
        }));
        return { ok: true };
      },

      declineAppointment: (id) =>
        setState((s) => ({
          ...s,
          /* As declineRelation: there is no DECLINED state, so it ends, and
             the reason says why. */
          relations: s.relations.map((r) =>
            r.id === id && r.state === "PENDING_ACCEPTANCE" ? { ...r, state: "TERMINATED", endedReason: "declined" } : r,
          ),
        })),

      declineRelation: (id, reason) =>
        setState((s) => ({
          ...s,
          /* Declining ends the relation rather than parking it. There is no
             DECLINED state in the lifecycle and inventing one would be wrong:
             a relation the proposed controller refused is over, and the Owner
             starts a new one. The reason is what makes that legible. */
          relations: s.relations.map((r) =>
            r.id === id ? { ...r, state: "TERMINATED", endedReason: reason } : r,
          ),
        })),

      acceptOffer: (id) =>
        setState((s) => applyOfferAcceptance(s, id, null)),

      declineOffer: (id) =>
        setState((s) => ({
          ...s,
          offers: s.offers.map((o) => (o.id === id ? { ...o, state: "declined" } : o)),
        })),

      parkOffer: (id) =>
        setState((s) => {
          const offer = s.offers.find((o) => o.id === id);
          if (!offer) return s;
          const relation = s.relations.find(
            (r) => r.personId === s.harness.persona && r.state === "ACTIVE",
          );
          return {
            ...s,
            offers: s.offers.map((o) => (o.id === id ? { ...o, state: "parked" } : o)),
            parkedOperations: [
              {
                id: rid("park"),
                operation: "credential:accept" as const,
                summary: `Accept ${offer.type} from ${offer.issuer}`,
                requestedBy: s.harness.persona,
                relationId: relation?.id ?? "rel-rinzin",
                scopeVersion: relation?.scope.version ?? 1,
                targetId: offer.id,
                targetRelyingParty: null,
                payloadHash: `sha256:${Math.random().toString(16).slice(2, 10)}${Math.random()
                  .toString(16)
                  .slice(2, 10)}`,
                policy: "SINGLE_APPROVER" as const,
                requiredSignatures: 1,
                signatures: [],
                state: "parked" as const,
                decisionReason: null,
                createdAt: today(),
                expiresAt: offer.expiresAt,
              },
              ...s.parkedOperations,
            ],
          };
        }),

      presentProof: (requestId, attributes) =>
        setState((s) => applyPresentation(s, requestId, attributes, null)),

      parkPresentation: (requestId, attributes) =>
        setState((s) => {
          const request = s.verificationRequests.find((v) => v.id === requestId);
          if (!request) return s;
          const relation = s.relations.find(
            (r) => r.personId === s.harness.persona && r.state === "ACTIVE",
          );
          return {
            ...s,
            verificationRequests: s.verificationRequests.map((v) =>
              v.id === requestId ? { ...v, state: "parked", disclosing: attributes } : v,
            ),
            parkedOperations: [
              {
                id: rid("park"),
                operation: "proof:present" as const,
                summary: `Present ${request.credentialType} to ${request.relyingParty}`,
                requestedBy: s.harness.persona,
                relationId: relation?.id ?? "rel-rinzin",
                scopeVersion: relation?.scope.version ?? 1,
                targetId: request.id,
                targetRelyingParty: request.relyingParty,
                payloadHash: `sha256:${Math.random().toString(16).slice(2, 10)}${Math.random()
                  .toString(16)
                  .slice(2, 10)}`,
                policy: "SINGLE_APPROVER" as const,
                requiredSignatures: 1,
                signatures: [],
                state: "parked" as const,
                decisionReason: null,
                createdAt: today(),
                expiresAt: request.expiresAt,
              },
              ...s.parkedOperations,
            ],
          };
        }),

      declineVerificationRequest: (requestId) =>
        setState((s) => ({
          ...s,
          verificationRequests: s.verificationRequests.map((v) =>
            v.id === requestId ? { ...v, state: "declined" } : v,
          ),
        })),

      approveOperation: (id, method) =>
        setState((s) => {
          const operation = s.parkedOperations.find((p) => p.id === id);
          if (!operation) return s;

          const signatures = [
            ...operation.signatures,
            { personId: s.harness.persona, at: today(), method },
          ];
          const satisfied = signatures.length >= operation.requiredSignatures;

          let next: DemoState = {
            ...s,
            parkedOperations: s.parkedOperations.map((p) =>
              p.id === id
                ? { ...p, signatures, state: satisfied ? "approved" : "parked" }
                : p,
            ),
          };

          /* Not satisfied yet: dual control means the next signature comes
             from somebody else, and nothing runs in the meantime. */
          if (!satisfied) return next;

          /* Re-validated at execution time rather than trusting the approval.
             A relation terminated or a scope changed between the approval and
             now must stop the operation — the brief calls this the
             "approved but no longer valid" edge, and a system that quietly
             ran it anyway would be broken in a way nobody could see. */
          const relation = next.relations.find((r) => r.id === operation.relationId);
          if (!relation || relation.state !== "ACTIVE") {
            return {
              ...next,
              parkedOperations: next.parkedOperations.map((p) =>
                p.id === id
                  ? {
                      ...p,
                      state: "stale",
                      invalidatedReason:
                        "The authority behind this operation is no longer active, so it was not run.",
                    }
                  : p,
              ),
            };
          }

          const approver = s.harness.persona;
          if (operation.operation === "credential:accept" && operation.targetId) {
            next = applyOfferAcceptance(next, operation.targetId, approver);
          } else if (operation.operation === "proof:present" && operation.targetId) {
            const request = next.verificationRequests.find(
              (v) => v.id === operation.targetId,
            );
            next = applyPresentation(
              next,
              operation.targetId,
              request?.disclosing ?? request?.requiredAttributes ?? [],
              approver,
            );
          }

          return next;
        }),

      rejectOperation: (id, reason) =>
        setState((s) => {
          const operation = s.parkedOperations.find((p) => p.id === id);
          if (!operation) return s;
          return {
            ...s,
            parkedOperations: s.parkedOperations.map((p) =>
              p.id === id ? { ...p, state: "rejected", decisionReason: reason } : p,
            ),
            /* The held thing goes back to being undecided rather than
               vanishing: a rejected approval is the approver's answer, not
               the end of the relying party's request. */
            offers: s.offers.map((o) =>
              o.id === operation.targetId && o.state === "parked"
                ? { ...o, state: "pending" }
                : o,
            ),
            verificationRequests: s.verificationRequests.map((v) =>
              v.id === operation.targetId && v.state === "parked"
                ? { ...v, state: "ready" }
                : v,
            ),
          };
        }),

      issueAuthority: (input) => {
        const authority: DelegatedAuthority = {
          id: rid("da"),
          kind: input.kind,
          title: input.title,
          recipientId: input.recipientId,
          parentId: input.parentId,
          /* Every Pattern B credential traces back to a controllership
             relation. The owner's root authority is what these are issued
             out of, so that is the relation recorded on them. */
          relationId: SEED.relations.filter(inOrg(PELDEN)).find((r) => r.isRootAuthority)?.id ?? "rel-root",
          taskScopes: input.taskScopes,
          valueCap: input.valueCap,
          counterparties: input.counterparties,
          validFrom: input.validFrom,
          validUntil: input.validUntil,
          status: "ACTIVE",
          acceptance: "sent",
          issuedAt: today(),
          acceptedAt: null,
        };
        setState((s) => ({
          ...s,
          delegatedAuthorities: [authority, ...s.delegatedAuthorities],
          auditEntries: appendAudit(s, {
            operation: "authority:issue",
            summary: `Issued ${input.title} to ${
              s.people.find((p) => p.id === input.recipientId)?.name ?? "a recipient"
            }`,
            actorId: s.harness.persona,
            relationId: authority.relationId,
            scopeVersion: 1,
          }),
        }));
        return authority;
      },

      acceptAuthority: (id) =>
        setState((s) => {
          const authority = s.delegatedAuthorities.find((a) => a.id === id);
          if (!authority) return s;
          const holder = s.people.find((p) => p.id === authority.recipientId);
          return {
            ...s,
            /* Accepting happens in the holder's own NDI Wallet, which is bound
               to their citizen credential — so the acceptance is also the
               proof of who they are. A delegate who joined by invitation is
               confirmed here, the way a controller is confirmed on accepting
               their duties. */
            people: s.people.map((p) => (p.id === authority.recipientId ? anchored(p) : p)),
            activity: [
              { id: rid("a"), text: `${holder?.name ?? "The holder"} accepted ${authority.title}`, at: today(), orgId: PELDEN },
              ...s.activity,
            ].slice(0, 20),
            delegatedAuthorities: s.delegatedAuthorities.map((a) =>
              a.id === id ? { ...a, acceptance: "accepted", acceptedAt: today() } : a,
            ),
            auditEntries: appendAudit(s, {
              operation: "authority:accept",
              summary: `${
                s.people.find((p) => p.id === authority.recipientId)?.name ?? "The holder"
              } accepted ${authority.title}`,
              actorId: authority.recipientId,
              relationId: authority.relationId,
            }),
          };
        }),

      suspendAuthority: (id, reason) =>
        setState((s) => {
          const authority = s.delegatedAuthorities.find((a) => a.id === id);
          if (!authority) return s;
          return {
            ...s,
            delegatedAuthorities: s.delegatedAuthorities.map((a) =>
              a.id === id
                ? { ...a, status: "SUSPENDED", endedAt: today(), endedReason: reason }
                : a,
            ),
            auditEntries: appendAudit(s, {
              operation: "authority:suspend",
              summary: `Suspended ${authority.title}`,
              actorId: s.harness.persona,
              relationId: authority.relationId,
            }),
          };
        }),

      reactivateAuthority: (id) =>
        setState((s) => {
          const authority = s.delegatedAuthorities.find((a) => a.id === id);
          if (!authority) return s;
          return {
            ...s,
            delegatedAuthorities: s.delegatedAuthorities.map((a) =>
              a.id === id ? { ...a, status: "ACTIVE", endedAt: null, endedReason: null } : a,
            ),
            auditEntries: appendAudit(s, {
              operation: "authority:reactivate",
              summary: `Reinstated ${authority.title}`,
              actorId: s.harness.persona,
              relationId: authority.relationId,
            }),
          };
        }),

      revokeAuthority: (id, reason) =>
        setState((s) => {
          const authority = s.delegatedAuthorities.find((a) => a.id === id);
          if (!authority) return s;

          /* Revoking a role does NOT mark its children revoked, and that is
             deliberate rather than an omission. A capability hanging off a
             withdrawn role is still a valid credential in the holder's
             wallet — what has changed is that the chain above it is broken,
             which is what the verification service discovers when it walks
             it. Cascading a status onto the children would hide the very
             mechanism Act 5 exists to show, and would also be a lie about
             what the holder's wallet contains. */
          const reference = `AP-${new Date().getFullYear()}-${Math.floor(
            1000 + Math.random() * 8999,
          )}`;

          return {
            ...s,
            delegatedAuthorities: s.delegatedAuthorities.map((a) =>
              a.id === id
                ? {
                    ...a,
                    status: "REVOKED",
                    endedAt: today(),
                    endedReason: reason,
                    appealReference: reference,
                  }
                : a,
            ),
            /* The holder is notified with a reason and an appeal reference.
               Withdrawal without a route to challenge it is the thing the
               appeal right exists to prevent, so the notice is created here
               rather than being something an operator remembers to send. */
            appeals: [
              {
                id: rid("ap"),
                reference,
                subjectId: authority.recipientId,
                againstKind: "authority" as const,
                againstId: authority.id,
                againstTitle: authority.title,
                noticeReason: reason,
                noticeIssuedAt: today(),
                submittedAt: null,
                submission: null,
                state: "notice_issued" as const,
                windowWorkingDays: 10,
                decisionWorkingDays: 5,
                evidence: [],
              },
              ...s.appeals,
            ],
            auditEntries: appendAudit(s, {
              operation: "authority:revoke",
              summary: `Revoked ${authority.title} held by ${
                s.people.find((p) => p.id === authority.recipientId)?.name ?? "the holder"
              }`,
              actorId: s.harness.persona,
              relationId: authority.relationId,
            }),
          };
        }),

      runVerification: (input) => {
        /* Derived from state at the moment of asking, which is the whole
           point of the act: revoking a role a second earlier changes the
           answer. Derived outside the updater, so the same decision is both
           returned and stored exactly once. */
        const decision: VerificationDecision = verifyAuthority(stateRef.current, input);
        setState((s) => ({ ...s, decisions: [decision, ...s.decisions] }));
        return decision;
      },

      submitAppeal: (id, submission) =>
        setState((s) => ({
          ...s,
          appeals: s.appeals.map((a) =>
            a.id === id
              ? { ...a, submittedAt: today(), submission, state: "under_review" }
              : a,
          ),
        })),

      decideAppeal: (id, outcome) =>
        setState((s) => {
          const appeal = s.appeals.find((a) => a.id === id);
          if (!appeal) return s;
          return {
            ...s,
            appeals: s.appeals.map((a) => (a.id === id ? { ...a, state: outcome } : a)),
            /* Upholding an appeal reinstates what was withdrawn. An appeal
               process that concluded in someone's favour and left the
               authority revoked would be a complaints box, not a remedy. */
            delegatedAuthorities:
              outcome === "upheld_reinstated" && appeal.againstKind === "authority"
                ? s.delegatedAuthorities.map((d) =>
                    d.id === appeal.againstId
                      ? { ...d, status: "ACTIVE", endedAt: null, endedReason: null }
                      : d,
                  )
                : s.delegatedAuthorities,
            auditEntries: appendAudit(s, {
              operation: outcome === "upheld_reinstated" ? "appeal:uphold" : "appeal:reject",
              summary:
                outcome === "upheld_reinstated"
                  ? `Upheld appeal ${appeal.reference} — ${appeal.againstTitle} reinstated`
                  : `Rejected appeal ${appeal.reference}`,
              actorId: s.harness.persona,
              relationId: null,
            }),
          };
        }),

      startSignup: (email) =>
        setState((s) => ({
          ...s,
          /* A new sign-up replaces any earlier one: this is one browser, one
             person at a time, and a half-finished session for a different
             address is exactly what "change the address" throws away. The
             return path survives, because an invitee who corrects their
             address is still on their way back to the invitation. A
             finished sign-up's return path is spent, though: carried over,
             it sent the next person in this browser to someone else's
             invitation. */
          signup: {
            email,
            stage: "check_email",
            sends: [Date.now()],
            linkUsed: false,
            name: "",
            memberships: [],
            returnTo: s.signup && s.signup.stage !== "done" ? s.signup.returnTo : null,
            createdAt: null,
          },
        })),

      resendSignupMail: () =>
        setState((s) =>
          s.signup
            ? {
                ...s,
                /* A resend issues a fresh link, so the old one being used is
                   no longer a reason to refuse — E2's "a new token is issued
                   and the old one stays dead". */
                signup: { ...s.signup, sends: [...s.signup.sends, Date.now()], linkUsed: false },
              }
            : s,
        ),

      consumeSignupLink: () => {
        const current = stateRef.current.signup;
        if (!current || current.linkUsed) return false;
        setState((s) =>
          s.signup
            ? { ...s, signup: { ...s.signup, linkUsed: true, stage: "set_password" } }
            : s,
        );
        return true;
      },

      completeSignup: (name) => {
        setState((s) =>
          s.signup
            ? {
                ...s,
                signup: { ...s.signup, name, stage: "done", createdAt: today() },
              }
            : s,
        );
        /* Q5: the creation is recorded with its route. The password is not,
           and never could be — it was never given to this store. */
        log("Account created (self-service)");
      },

      addSignupMembership: (orgId, role) =>
        setState((s) =>
          s.signup && !s.signup.memberships.some((m) => m.orgId === orgId)
            ? { ...s, signup: { ...s.signup, memberships: [...s.signup.memberships, { orgId, role }] } }
            : s,
        ),

      setSignupReturn: (path, email) =>
        setState((s) => ({
          ...s,
          /* An invitation arriving for a different address than the one in
             progress starts a fresh session — the half-finished one belonged
             to someone else. */
          signup:
            s.signup && (!email || s.signup.email === email || s.signup.email === "")
            ? { ...s.signup, returnTo: path, email: email ?? s.signup.email }
            : {
                email: email ?? "",
                stage: "check_email",
                sends: [],
                linkUsed: false,
                name: "",
                memberships: [],
                returnTo: path,
                createdAt: null,
              },
        })),

      clearSignup: () => setState((s) => ({ ...s, signup: null })),

      inviteToOrganisation: ({ email, role }) => {
        const s0 = stateRef.current;
        const inviter = s0.people.find((p) => p.id === s0.harness.persona);
        /* E1 — the screen only offers the form to an owner or admin, but the
           check is here too, because the screen is not the boundary. The
           role is the one held in this organisation. */
        const inviterRole = roleIn(s0.organizations.find((o) => o.id === s0.activeOrgId), inviter);
        if (!inviter || (inviterRole !== "Owner" && inviterRole !== "Admin")) {
          return { ok: false, error: "E1" };
        }
        const address = email.trim().toLowerCase();
        /* E3 — already a member of *this* organisation, or already invited to
           it and not yet answered. A second live invitation to the same
           address would leave two links that each grant membership. Only
           this organisation's membership counts: whether the address holds
           an account anywhere else is never disclosed (S8), and a person may
           belong to several organisations (AC-10). */
        const org = s0.organizations.find((o) => o.id === s0.activeOrgId);
        const member = s0.people.find(
          (p) => p.email.toLowerCase() === address && Boolean(org?.memberIds.includes(p.id)) && p.hasAccount !== false,
        );
        if (member) return { ok: false, error: "E3", member: member.name };
        const waiting = s0.orgInvitations.some(
          (i) =>
            i.kind === "M" &&
            i.orgId === s0.activeOrgId &&
            i.email.toLowerCase() === address &&
            (i.state === "PENDING" || i.state === "PENDING_APPROVAL"),
        );
        if (waiting) return { ok: false, error: "waiting" };
        const id = rid("inv");
        setState((s) => ({
          ...s,
          orgInvitations: [
            {
              id,
              kind: "M",
              email: email.trim(),
              orgId: s.activeOrgId,
              role,
              legalName: null,
              legalIdentity: null,
              purpose: null,
              needsSecondApproval: false,
              invitedBy: s.harness.persona,
              approvedBy: null,
              createdAt: today(),
              sentAt: today(),
              expiresAt: inDays(INVITATION_DAYS.M),
              state: "PENDING",
              delivery: "delivered",
              decidedAt: null,
              acceptedName: null,
            },
            ...s.orgInvitations,
          ],
        }));
        log(`Invitation sent to ${email.trim()} (member)`);
        return { ok: true, id };
      },

      proposeOrganisation: ({ email, legalName, legalIdentity, purpose, needsSecondApproval }) => {
        /* P2, S9: a named platform admin. The root account issues no member
           or agency invitation — refused here as well as hidden on the
           screen, because the screen isn't the boundary (as E13, E14). */
        const proposer = stateRef.current.people.find((p) => p.id === stateRef.current.harness.persona);
        if (proposer?.platformRole !== "admin") {
          if (proposer?.platformRole === "root") log("Control failure — the root account tried to invite an organisation", NDI_ORG);
          return { ok: false, error: "E1" };
        }
        /* P7, E12: a second approval needs a second named admin to give it.
           Refused up front rather than left waiting for nobody. */
        if (needsSecondApproval && activeAdmins(stateRef.current).length < 2) {
          log("Invitation refused — fewer than two administrators to approve it");
          return { ok: false, error: "E12" };
        }
        const id = rid("inv");
        setState((s) => ({
          ...s,
          orgInvitations: [
            {
              id,
              kind: "O",
              email: email.trim(),
              orgId: null,
              role: null,
              legalName,
              legalIdentity,
              purpose,
              needsSecondApproval,
              invitedBy: s.harness.persona,
              approvedBy: null,
              createdAt: today(),
              /* A designation waiting on a second administrator has not been
                 sent, and nothing about it reaches the invitee until it is
                 (AC-04). */
              sentAt: needsSecondApproval ? null : today(),
              expiresAt: needsSecondApproval ? null : inDays(INVITATION_DAYS.O),
              state: needsSecondApproval ? "PENDING_APPROVAL" : "PENDING",
              delivery: needsSecondApproval ? "not_sent" : "delivered",
              decidedAt: null,
              acceptedName: null,
            },
            ...s.orgInvitations,
          ],
        }));
        log(
          needsSecondApproval
            ? `Designation of ${legalName} proposed — awaiting a second administrator`
            : `Invitation sent to ${email.trim()} to register ${legalName}`,
        );
        return { ok: true, id };
      },

      approveInvitation: (id) => {
        const s0 = stateRef.current;
        const inv = s0.orgInvitations.find((i) => i.id === id);
        /* S2: proposer and approver must be distinct principals, and the
           record cannot leave PENDING_APPROVAL while they are the same. The
           screen shows the control disabled with the reason (UXD-03) — this
           is the check that would hold even if it did not. The attempt is
           recorded as a control failure, not silently ignored. */
        /* E13: the root account approves nothing — not even in an
           emergency. SCR-INV-02 isn't offered to it; this holds regardless. */
        if (s0.people.find((p) => p.id === s0.harness.persona)?.platformRole === "root") {
          log("Control failure — the root account tried to approve an invitation", NDI_ORG);
          return { ok: false, error: "E13" };
        }
        if (!inv || inv.invitedBy === s0.harness.persona) {
          log("Control failure — an administrator tried to approve their own invitation", NDI_ORG);
          return { ok: false, error: "E11" };
        }
        setState((s) => ({
          ...s,
          orgInvitations: s.orgInvitations.map((i) =>
            i.id === id
              ? {
                  ...i,
                  state: "PENDING",
                  approvedBy: s.harness.persona,
                  decidedAt: today(),
                  sentAt: today(),
                  expiresAt: inDays(inv.kind === "A" ? INVITATION_DAYS.A : INVITATION_DAYS.O),
                  delivery: "delivered",
                }
              : i,
          ),
        }));
        log(
          inv.kind === "A"
            ? `Invitation to ${inv.email} as a platform administrator approved and sent`
            : `Designation of ${inv.legalName} approved and sent`,
        );
        return { ok: true };
      },

      refuseInvitation: (id) =>
        setState((s) => ({
          ...s,
          orgInvitations: s.orgInvitations.map((i) =>
            i.id === id ? { ...i, state: "REFUSED", decidedAt: today(), approvedBy: s.harness.persona } : i,
          ),
        })),

      withdrawInvitation: (id, rootReason) => {
        const s0 = stateRef.current;
        /* The root account may revoke only what it issued, and each use is
           logged as a root-account use, with the reason when one is given
           (S9; the reason is optional since 14 Oct). */
        if (s0.people.find((p) => p.id === s0.harness.persona)?.platformRole === "root") {
          const inv = s0.orgInvitations.find((i) => i.id === id);
          if (!inv || inv.invitedBy !== "root") return;
          log(
            `Root account used — revoked the invitation to ${inv.email}${rootReason?.trim() ? `. Reason: ${rootReason.trim()}` : ""}`,
            NDI_ORG,
          );
        }
        setState((s) => ({
          ...s,
          orgInvitations: s.orgInvitations.map((i) =>
            i.id === id ? { ...i, state: "REVOKED", decidedAt: today() } : i,
          ),
        }));
      },

      resendInvitation: (id) => {
        const s0 = stateRef.current;
        /* The root account may resend only what it issued, logged as a
           root-account use like every other (S9). */
        if (s0.people.find((p) => p.id === s0.harness.persona)?.platformRole === "root") {
          const inv = s0.orgInvitations.find((i) => i.id === id);
          if (!inv || inv.invitedBy !== "root") return;
          log(`Root account used — resent the invitation to ${inv.email}`, NDI_ORG);
        }
        setState((s) => ({
          ...s,
          orgInvitations: s.orgInvitations.map((i) =>
            i.id === id ? { ...i, delivery: "delivered", sentAt: today() } : i,
          ),
        }));
      },

      acceptInvitation: (id) => {
        const s0 = stateRef.current;
        const inv = s0.orgInvitations.find((i) => i.id === id);
        if (!inv) return { ok: false, error: "E5" };
        /* Step 8 re-checks everything at acceptance, not only at issue — an
           invitation is not a bearer grant (S4). */
        /* A member invitation runs the one re-check every member acceptance
           shares, and acts on every answer it gives — not only E6, which let a
           declined invitation be accepted once the screen was forced back
           to its default face. */
        if (inv.kind === "M") {
          const refusal = memberInvitationRefusal(s0, inv);
          if (refusal) {
            setState((s) => markRefused(s, id, refusal));
            return { ok: false, error: refusal };
          }
        }
        if (inv.state === "ACCEPTED") return { ok: false, error: "E7" };
        if (
          inv.state === "REVOKED" ||
          inv.state === "REFUSED" ||
          inv.state === "PENDING_APPROVAL" ||
          inv.state === "DECLINED"
        ) {
          return { ok: false, error: "E5" };
        }
        if (inv.state === "EXPIRED" || (inv.expiresAt !== null && inv.expiresAt < today())) {
          return { ok: false, error: "E4" };
        }
        const inviter = s0.people.find((p) => p.id === inv.invitedBy);
        const inviterStillMay =
          inv.kind === "A"
            ? /* Step 8: a root-issued invitation still needs S9 to hold —
                 once two admins are active it is void (E6, AC-16). An
                 admin's needs its inviter still to be one. */
              inviter?.platformRole === "root"
              ? activeAdmins(s0).length < 2
              : isPlatformAdmin(inviter)
            : inv.kind === "W"
              ? isPlatformAdmin(inviter)
              : inv.kind === "O"
                ? Boolean(inviter)
                : memberInvitationRefusal(s0, inv) !== "E6";
        if (!inviterStillMay || inv.state === "VOID") {
          setState((s) => ({
            ...s,
            orgInvitations: s.orgInvitations.map((i) => (i.id === id ? { ...i, state: "VOID" } : i)),
          }));
          return { ok: false, error: "E6" };
        }
        /* The account being made in this browser counts only when it is the
           invited address's — otherwise the owner's own sign-up, still in
           the session, named the colleague who accepted. */
        const account = s0.signup?.email.toLowerCase() === inv.email.toLowerCase() ? s0.signup : null;
        const invitee = s0.people.find((p) => p.email.toLowerCase() === inv.email.toLowerCase());
        const name = account?.name || invitee?.name || "New member";
        if (inv.kind === "A" || inv.kind === "W") {
          /* SCR-INV-04 asks for the person to be signed in as the invited
             address, whatever kind of invitation it is. Only member
             invitations checked it, so an administrator's or an
             organisation's invitation opened while driving as someone else
             — root, Dorji — could be accepted in the invitee's name, and the
             screen then switched the session to them. */
          const hasAccount = Boolean(account) || Boolean(invitee && invitee.hasAccount !== false);
          if (!hasAccount) return { ok: false, error: "no_account" };
          const me = s0.people.find((p) => p.id === s0.harness.persona);
          const signedInAsInvitee = Boolean(account) || me?.email.toLowerCase() === inv.email.toLowerCase();
          if (!signedInAsInvitee) return { ok: false, error: "wrong_person" };
          setState((s) => ({
            ...s,
            orgInvitations: s.orgInvitations.map((i) =>
              i.id === id ? { ...i, state: "ACCEPTED" as const, decidedAt: today(), acceptedName: name } : i,
            ),
            /* A: the person becomes an administrator, and now has the account
               they made on the way here. W: nothing yet — the wallet exists
               only once the register has confirmed them (Flow 2). */
            people:
              inv.kind === "A"
                ? s.people.map((p) =>
                    p.email.toLowerCase() === inv.email.toLowerCase()
                      ? { ...p, platformRole: "admin" as const, hasAccount: true }
                      : p,
                  )
                : s.people,
            /* An administrator joins NDI's own organisation, which is where
               their console is. */
            organizations:
              inv.kind === "A" && invitee
                ? s.organizations.map((o) =>
                    o.id === NDI_ORG && !o.memberIds.includes(invitee.id)
                      ? { ...o, memberIds: [...o.memberIds, invitee.id], members: o.members + 1 }
                      : o,
                  )
                : s.organizations,
          }));
          log(`Invitation accepted by ${name}`);
          return { ok: true };
        }
        if (inv.kind !== "M" || !inv.orgId) {
          setState((s) => ({
            ...s,
            orgInvitations: s.orgInvitations.map((i) =>
              i.id === id ? { ...i, state: "ACCEPTED" as const, decidedAt: today(), acceptedName: name } : i,
            ),
          }));
          log(`Invitation accepted by ${name}`);
          return { ok: true };
        }
        /* Accepting needs an account already held by the invited address,
           and the person signed in as it (SCR-INV-04: "signed in as the
           invited address"). Without these checks a forced face could
           accept for an address with no account — making one with no name
           and no password — or let whoever was signed in accept for someone
           else. An address with no account sets one up instead (setUpMember). */
        const hasAccount = Boolean(account) || Boolean(invitee && invitee.hasAccount !== false);
        if (!hasAccount) return { ok: false, error: "no_account" };
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const signedInAsInvitee =
          Boolean(account) || me?.email.toLowerCase() === inv.email.toLowerCase();
        if (!signedInAsInvitee) return { ok: false, error: "wrong_person" };
        /* Q4: a member at the named role, with no authority to act for the
           entity — see joinOrganisation. */
        const memberId = account && !invitee ? rid("person") : (invitee?.id ?? rid("person"));
        const orgId = inv.orgId;
        setState((s) => {
          const joined = joinOrganisation(s, inv, name, memberId);
          return {
            ...joined,
            signup: joined.signup
              ? {
                  ...joined.signup,
                  memberships: joined.signup.memberships.some((m) => m.orgId === orgId)
                    ? joined.signup.memberships
                    : [...joined.signup.memberships, { orgId, role: inv.role ?? "Member" }],
                }
              : joined.signup,
          };
        });
        return { ok: true };
      },

      setUpMember: (invitationId, nameIn) => {
        const s0 = stateRef.current;
        const inv = s0.orgInvitations.find((i) => i.id === invitationId);
        const name = nameIn.trim();
        if (!name) return { ok: false, error: "invalid" };
        /* The same re-checks as any acceptance (step 8) — the screen showing
           the form is not the boundary. */
        const refusal = memberInvitationRefusal(s0, inv);
        if (refusal || !inv) {
          if (refusal) setState((s) => markRefused(s, invitationId, refusal));
          return { ok: false, error: refusal ?? "E5" };
        }
        /* Setting up is only for an address with no account. One that has an
           account — platform administrators always do — signs in and accepts
           instead, so the two ways in cannot disagree about who may join. */
        const known = s0.people.find((p) => p.email.toLowerCase() === inv.email.toLowerCase());
        if (known && known.hasAccount !== false) return { ok: false, error: "has_account" };
        const personId = known?.id ?? rid("person");
        setState((s) => ({
          ...joinOrganisation(s, inv, name, personId),
          activeOrgId: inv.orgId as string,
          harness: { ...s.harness, persona: personId },
        }));
        return { ok: true, personId };
      },

      declineInvitation: (id) =>
        setState((s) => ({
          ...s,
          orgInvitations: s.orgInvitations.map((i) =>
            i.id === id ? { ...i, state: "DECLINED", decidedAt: today() } : i,
          ),
        })),

      startOrgOnboarding: (kind, invitationId, existingOrgId) =>
        setState((s) => ({
          ...s,
          orgOnboarding: {
            kind,
            identifier: null,
            stage: "started",
            provedName: null,
            provedPersonId: null,
            authoritativeName: null,
            notify: false,
            invitationId: invitationId ?? null,
            existingOrgId: existingOrgId ?? null,
          },
        })),

      submitIdentifier: (identifier) => {
        const s0 = stateRef.current;
        const ob = s0.orgOnboarding;
        if (!ob) return { ok: false, error: "E3" };
        /* P3 is checked again here, not only on SCR-ORG-01: a type that
           was connected when the page loaded may not be by the time the
           form is sent, and the server is what decides. */
        if (!connectedKinds(s0).includes(ob.kind)) return { ok: false, error: "E1" };
        const id = identifier.trim().toUpperCase();
        /* E3 — already verified here. Recorded for support, refused with a
           message that does not say whether the registration exists. */
        if (REGISTER_RECORDS.some((r) => r.identifier === id && r.verifiedOnPlatform)) {
          return { ok: false, error: "E3" };
        }
        setState((s) =>
          s.orgOnboarding ? { ...s, orgOnboarding: { ...s.orgOnboarding, identifier: id, stage: "proof_requested" } } : s,
        );
        return { ok: true };
      },

      recordIdentityProof: (name, personId) =>
        setState((s) =>
          s.orgOnboarding
            ? { ...s, orgOnboarding: { ...s.orgOnboarding, provedName: name, provedPersonId: personId, stage: "checking" } }
            : s,
        ),

      checkWithAuthority: () => {
        const ob = stateRef.current.orgOnboarding;
        /* The authority's own question, asked of its own records: is this
           person a representative of the entity with this identifier? An
           unknown identifier, a deregistered entity and a person who is not
           a representative all come back as one answer — the authority may
           tell them apart, the platform keeps nothing that could (S6). */
        const record = REGISTER_RECORDS.find((r) => r.identifier === ob?.identifier && r.kind === ob?.kind);
        const approved = Boolean(
          ob?.provedPersonId && record && record.active && record.representatives.includes(ob.provedPersonId),
        );
        setState((s) =>
          s.orgOnboarding
            ? {
                ...s,
                orgOnboarding: {
                  ...s.orgOnboarding,
                  stage: approved ? "setting_up" : "not_confirmed",
                  authoritativeName: approved ? (record?.legalName ?? null) : null,
                },
              }
            : s,
        );
        if (!approved) log("An organisation verification was not confirmed by the authority");
        return approved ? "approved" : "not_confirmed";
      },

      setVerificationNotify: (on) =>
        setState((s) => (s.orgOnboarding ? { ...s, orgOnboarding: { ...s.orgOnboarding, notify: on } } : s)),

      cancelOrgOnboarding: () => setState((s) => ({ ...s, orgOnboarding: null })),

      recordOrgInterest: (kind, email) =>
        setState((s) => ({
          ...s,
          orgInterests: [
            ...s.orgInterests.filter((i) => !(i.kind === kind && i.email === email)),
            { kind, email, recordedAt: today() },
          ],
        })),

      completeOrgOnboarding: () => {
        const s0 = stateRef.current;
        const ob = s0.orgOnboarding;
        if (!ob || ob.stage !== "setting_up") return;
        const inv = s0.orgInvitations.find((i) => i.id === ob.invitationId);
        const existingId = ob.existingOrgId ?? (inv?.kind === "W" ? inv.orgId : null);
        if (existingId) {
          /* Kind E: the organisation already exists — Bank of Bhutan, which
             issues and verifies — and step 9 provisions it rather than
             creating another. It gains the holder capability and its
             registration in its own wallet; the person the authority
             confirmed becomes its root authority. Its issuing and verifying
             are untouched throughout. */
          const orgId = existingId;
          const personId =
            ob.provedPersonId ??
            s0.people.find((p) => p.email.toLowerCase() === inv?.email.toLowerCase())?.id ??
            "yeshey";
          const seedCred = SEED.heldCredentials.find((c) => c.orgId === orgId && c.isFoundational);
          const seedRel = SEED.relations.find((r) => r.orgId === orgId && r.isRootAuthority);
          const now = today();
          setState((s) => ({
            ...s,
            organizations: s.organizations.map((o) =>
              o.id === orgId
                ? { ...o, kind: ob.kind, capabilities: o.capabilities.includes("holder") ? o.capabilities : [...o.capabilities, "holder" as const] }
                : o,
            ),
            heldCredentials: seedCred
              ? [...s.heldCredentials.filter((c) => c.id !== seedCred.id), { ...seedCred, receivedAt: now }]
              : s.heldCredentials,
            relations: seedRel
              ? [
                  ...s.relations.filter((r) => r.id !== seedRel.id),
                  /* Created waiting for the representative to accept
                     responsibility (FLOW-DEL-02 step 1), not in force. */
                  { ...seedRel, personId, state: "PENDING_ACCEPTANCE" as const, createdAt: now, acceptedAt: null, activatedAt: null, scope: { ...seedRel.scope, validFrom: now } },
                ]
              : s.relations,
            responsibilities: [...s.responsibilities.filter((r) => r.orgId !== orgId), { orgId, state: "PENDING", at: now }],
            harness: { ...s.harness, persona: personId },
            orgOnboarding: s.orgOnboarding ? { ...s.orgOnboarding, stage: "verified" } : s.orgOnboarding,
            activeOrgId: orgId,
          }));
          return;
        }
        /* Lands on Pelden's first day, not on the story's three-months-in
           seed — see firstRunState. Nothing is logged to the activity feed
           for the same reason: nothing has been done in the console yet. */
        setState((s) => {
          const first = firstRunState(s);
          return {
          ...first,
          organizations: first.organizations.map((o) => (o.id === PELDEN ? { ...o, kind: s.orgOnboarding?.kind ?? "company" } : o)),
          /* The representative's authority is created waiting for them to
             accept responsibility on SCR-DEL-01 (FLOW-DEL-02 step 1). The
             first-run state, which other walks start from, has it already
             accepted; a verification that just finished has not. */
          relations: first.relations.map((r) =>
            inOrg(PELDEN)(r) && r.isRootAuthority ? { ...r, state: "PENDING_ACCEPTANCE" as const, acceptedAt: null, activatedAt: null } : r,
          ),
          responsibilities: [...first.responsibilities.filter((r) => r.orgId !== PELDEN), { orgId: PELDEN, state: "PENDING", at: today() }],
          /* The account that verified Pelden is Dorji's, and from here the
             console acts as the representative the authority confirmed —
             who alone can accept responsibility on SCR-DEL-01. */
          harness: { ...first.harness, persona: "dorji" },
          orgOnboarding: s.orgOnboarding ? { ...s.orgOnboarding, stage: "verified" } : s.orgOnboarding,
          /* The account that did this now belongs to the organisation, as its
             owner — the first row of SCR-ONB-05's list. */
          signup:
            s.signup && s.signup.stage === "done" && !s.signup.memberships.some((m) => m.orgId === "org-pelden")
              ? { ...s.signup, memberships: [...s.signup.memberships, { orgId: "org-pelden", role: "Owner" }] }
              : s.signup,
          };
        });
      },

      restoreStoryState: () =>
        setState((s) => {
          if (!s.firstRun) return s;
          /* Everything the first-run state emptied comes back from the seed.
             What the presenter did in the onboarding flows is kept: the
             account, anyone waiting on an authority, and any invitation
             they sent. */
          const seeded = new Set(SEED.orgInvitations.map((i) => i.id));
          return {
            ...SEED,
            signup: s.signup,
            orgOnboarding: s.orgOnboarding,
            orgInterests: s.orgInterests,
            orgInvitations: [...s.orgInvitations.filter((i) => !seeded.has(i.id)), ...SEED.orgInvitations],
            accessRequests: [
              ...s.accessRequests.filter((a) => !SEED.accessRequests.some((x) => x.id === a.id)),
              ...SEED.accessRequests,
            ],
            harness: s.harness,
            firstRun: false,
          };
        }),

      signIn: (email) => {
        const s0 = stateRef.current;
        const address = email.trim().toLowerCase();
        const person = s0.people.find((p) => p.hasAccount !== false && p.email.toLowerCase() === address);
        if (person && ((PERSONAS as string[]).includes(person.id) || person.joinedBy)) {
          const id = person.id;
          setState((s) => {
            const home = s.organizations.find((o) => o.memberIds.includes(id));
            return { ...s, activeOrgId: home?.id ?? s.activeOrgId, harness: { ...s.harness, persona: id } };
          });
          return { ok: true, personId: id };
        }
        /* An account made in this browser by sign-up, not yet acting as
           anyone the story knows — its home is the welcome screen. */
        if (s0.signup?.stage === "done" && s0.signup.email.toLowerCase() === address) {
          return { ok: true, personId: null };
        }
        return { ok: false };
      },

      startDayZero: () => setState((s) => ({ ...dayZeroState(SEED), harness: { ...SEED.harness, persona: "yeshey", guideStep: s.harness.guideStep } })),

      /* Day zero with Pelden registered on it — exactly what the onboarding
         walk leaves behind, so walking the member invitations on their own
         starts from the same first day the full walk reaches. */
      startPlatformReady: () =>
        setState((s) => ({
          ...platformReadyState(SEED),
          activeOrgId: NDI_ORG,
          harness: { ...SEED.harness, persona: "root", guideStep: s.harness.guideStep },
        })),

      startFirstDay: () =>
        setState((s) => ({
          ...firstRunState(platformReadyState(SEED)),
          activeOrgId: PELDEN,
          harness: { ...SEED.harness, persona: "dorji", guideStep: s.harness.guideStep },
        })),

      /* The first day, plus the two invitations the guide sends in chapters
         5 and 7, accepted — each through the same joinOrganisation every
         acceptance uses, so the state is the one the guide would reach. */
      startTeamReady: () =>
        setState((s) => {
          let next: DemoState = {
            ...firstRunState(platformReadyState(SEED)),
            activeOrgId: PELDEN,
            harness: { ...SEED.harness, persona: "dorji", guideStep: s.harness.guideStep },
          };
          for (const [personId, email, name] of [
            ["ugyen", "ugyen.phuntsho@peldentrading.bt", "Ugyen Phuntsho"],
            ["pema", "pema.choden@druksharpa.bt", "Pema Choden"],
          ] as const) {
            const inv: OrgInvitation = {
              id: `inv-${personId}-team`,
              kind: "M",
              email,
              orgId: PELDEN,
              role: "Member",
              legalName: null,
              legalIdentity: null,
              purpose: null,
              needsSecondApproval: false,
              invitedBy: "dorji",
              approvedBy: null,
              createdAt: today(),
              sentAt: today(),
              expiresAt: inDays(INVITATION_DAYS.M),
              state: "PENDING",
              delivery: "delivered",
              decidedAt: null,
              acceptedName: null,
            };
            next = joinOrganisation({ ...next, orgInvitations: [inv, ...next.orgInvitations] }, inv, name, personId);
          }
          return next;
        }),


      invitePlatformAdmin: (emailIn, root) => {
        const s0 = stateRef.current;
        const me = s0.people.find((p) => p.id === s0.harness.persona);
        const asRoot = me?.platformRole === "root";
        /* P2: a platform admin, or the root account — refused here, not
           merely hidden on the screen, because the screen is not the
           boundary. */
        if (!asRoot && !isPlatformAdmin(me)) return { ok: false, error: "E1" };
        const email = emailIn.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "invalid" };
        const person = s0.people.find((p) => p.email.toLowerCase() === email);
        if (
          isPlatformAdmin(person) ||
          s0.orgInvitations.some(
            (i) => i.kind === "A" && i.email.toLowerCase() === email && (i.state === "PENDING" || i.state === "PENDING_APPROVAL"),
          )
        ) {
          return { ok: false, error: "E3" };
        }
        if (asRoot) {
          /* P8, E14: only under S9, and only with the custodians named —
             the reason is optional (revised 14 Oct). Refused, logged and
             alerted otherwise. */
          if (rootInviteBlock(s0) || !root?.custodians.trim()) {
            log("Control failure — the root account tried to add an administrator outside its emergency rule", NDI_ORG);
            return { ok: false, error: "E14" };
          }
        } else if (activeAdmins(s0).length < 2) {
          /* P7, E12: an admin's invitation needs a second admin to approve. */
          log("Invitation refused — fewer than two administrators to approve it", NDI_ORG);
          return { ok: false, error: "E12" };
        }
        const id = rid("inv");
        setState((s) => ({
          ...s,
          orgInvitations: [
            {
              id,
              kind: "A",
              email,
              orgId: null,
              role: null,
              legalName: null,
              legalIdentity: null,
              purpose: "Platform administrator",
              /* S2: every Kind A needs a second named admin — except the
                 root account's, which S9 checks and logs instead. */
              needsSecondApproval: !asRoot,
              rootReason: asRoot ? root!.reason.trim() || null : null,
              rootCustodians: asRoot ? root!.custodians.trim() : null,
              invitedBy: s.harness.persona,
              approvedBy: null,
              createdAt: today(),
              sentAt: asRoot ? today() : null,
              expiresAt: asRoot ? inDays(INVITATION_DAYS.A) : null,
              state: asRoot ? "PENDING" : "PENDING_APPROVAL",
              delivery: asRoot ? "delivered" : "not_sent",
              decidedAt: null,
              acceptedName: null,
            },
            ...s.orgInvitations,
          ],
        }));
        log(
          asRoot
            ? `Root account used — invited ${email} as a platform administrator. Custodians: ${root!.custodians.trim()}${root!.reason.trim() ? `. Reason: ${root!.reason.trim()}` : ""}`
            : `${email} proposed as a platform administrator — awaiting a second administrator`,
          NDI_ORG,
        );
        return { ok: true, id, queued: !asRoot };
      },

      adminStatus: () => {
        const s0 = stateRef.current;
        return { active: activeAdmins(s0).length, rootBlock: rootInviteBlock(s0) };
      },

      setUpPlatformAdmin: (invitationId, nameIn) => {
        const s0 = stateRef.current;
        const inv = s0.orgInvitations.find((i) => i.id === invitationId);
        const name = nameIn.trim();
        const inviter = inv ? s0.people.find((p) => p.id === inv.invitedBy) : undefined;
        /* The same re-checks as any acceptance, each with its own answer so
           the screen can say which one it was (UX-EW-01 §3.5): still
           pending, not expired, and root still root.
           The expiry is compared as a date, the way member and Entity
           Wallet invitations compare it. `new Date("YYYY-MM-DD")` is
           midnight at the start of that day, so the old comparison refused
           an admin invitation on its last day while the others still took
           theirs. */
        if (!inv || inv.kind !== "A") return { ok: false, error: "E5" };
        if (inv.state === "ACCEPTED") return { ok: false, error: "E7" };
        if (inv.state === "EXPIRED" || (inv.expiresAt !== null && inv.expiresAt < today())) {
          return { ok: false, error: "E4" };
        }
        if (inv.state !== "PENDING") return { ok: false, error: "E5" };
        /* Step 8: the root account's invitation still needs S9 to hold;
           an admin's needs its inviter still to be one (E6). */
        const stillMay = inviter?.platformRole === "root" ? activeAdmins(s0).length < 2 : isPlatformAdmin(inviter);
        if (!stillMay) {
          setState((s) => ({
            ...s,
            orgInvitations: s.orgInvitations.map((i) => (i.id === invitationId ? { ...i, state: "VOID" as const } : i)),
          }));
          return { ok: false, error: "E6" };
        }
        if (!name) return { ok: false, error: "invalid" };
        /* Someone the story already knows (Kinzang, Tshendu) keeps their
           record; anyone else gets a record of their own. They all used to
           share one "newadmin" slot, so a second new admin replaced the
           first, who could then no longer sign in — and now that admins
           invite admins, a demo does invite more than one. The same fix
           setUpMember has. */
        const known = s0.people.find((p) => p.email.toLowerCase() === inv.email.toLowerCase());
        /* An address that already has an account never gets a second set-up.
           SCR-INV-04 requires the person to be signed in as the invited
           address; setting up here would let whoever opened the link rename
           that account and make it an administrator without signing in as
           it. They sign in and accept instead, as a member invitation does
           (setUpMember's has_account). */
        if (known && known.hasAccount !== false) return { ok: false, error: "has_account" };
        const personId: PersonId = known?.id ?? rid("person");
        setState((s) => {
          const people = known
            ? s.people.map((p) =>
                p.id === known.id ? { ...p, name, platformRole: "admin" as const, hasAccount: true } : p,
              )
            : [
                ...s.people,
                {
                  id: personId,
                  /* Listed by the persona switcher, like an invited member. */
                  joinedBy: invitationId,
                  name,
                  cid: "—",
                  email: inv.email,
                  title: "Platform admin · Bhutan NDI",
                  cidVerified: false,
                  platformRole: "admin" as const,
                  hasAccount: true,
                },
              ];
          return {
            ...s,
            people,
            orgInvitations: s.orgInvitations.map((i) =>
              i.id === invitationId
                ? { ...i, state: "ACCEPTED" as const, decidedAt: today(), acceptedName: name }
                : i,
            ),
            /* Their console is NDI's own organisation. */
            organizations: s.organizations.map((o) =>
              o.id === NDI_ORG
                ? {
                    ...o,
                    memberIds: [...o.memberIds.filter((m) => m !== personId), personId],
                    members: o.memberIds.includes(personId) ? o.members : o.members + 1,
                  }
                : o,
            ),
            activeOrgId: NDI_ORG,
            harness: { ...s.harness, persona: personId },
          };
        });
        log(`${name} set up their account and became a platform administrator`);
        return { ok: true, personId };
      },

      decideAccessRequest: (id, approve, reason) =>
        setState((s) => {
          const req = s.accessRequests.find((a) => a.id === id);
          const me = s.people.find((p) => p.id === s.harness.persona);
          /* A named platform admin — never the root account (S9). */
          if (!req || req.state !== "PENDING" || me?.platformRole !== "admin") return s;
          const decided = { decidedBy: s.harness.persona, decidedAt: today() };
          if (!approve) {
            return {
              ...s,
              accessRequests: s.accessRequests.map((a) =>
                a.id === id ? { ...a, ...decided, state: "DECLINED" as const, reason: reason ?? null } : a,
              ),
            };
          }
          return {
            ...s,
            organizations: s.organizations.map((o) =>
              o.id === req.orgId && !o.capabilities.includes(req.capability)
                ? { ...o, capabilities: [...o.capabilities, req.capability] }
                : o,
            ),
            accessRequests: s.accessRequests.map((a) =>
              a.id === id ? { ...a, ...decided, state: "APPROVED" as const } : a,
            ),
          };
        }),

      setPersona: (persona) =>
        setState((s) => {
          /* Driving as someone puts you in their organisation — Yeshey's
             console is Bank of Bhutan's, never Pelden's. Administrators
             belong to none, so the workspace stays where it was. */
          const home = s.organizations.find((o) => o.memberIds.includes(persona));
          return { ...s, activeOrgId: home?.id ?? s.activeOrgId, harness: { ...s.harness, persona } };
        }),

      setAct: (act) => setState((s) => ({ ...s, harness: { ...s.harness, act } })),

      setRunnerOpen: (runnerOpen) =>
        setState((s) => ({ ...s, harness: { ...s.harness, runnerOpen } })),

      setGuideStep: (guideStep) =>
        setState((s) => ({ ...s, harness: { ...s.harness, guideStep } })),

      setSelfServiceSignup: (selfServiceSignup) =>
        setState((s) => ({ ...s, harness: { ...s.harness, selfServiceSignup } })),

      setStateOverride: (screen, override) =>
        setState((s) => {
          const next = { ...s.harness.stateOverrides };
          /* null removes the key rather than storing it, so "no override"
             and "overridden to nothing" cannot be confused downstream. */
          if (override === null) delete next[screen];
          else next[screen] = override;
          return { ...s, harness: { ...s.harness, stateOverrides: next } };
        }),

      clearStateOverrides: () =>
        setState((s) => ({ ...s, harness: { ...s.harness, stateOverrides: {} } })),

      resetDemo: () => {
        setState(FRESH);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* nothing to clear */
        }
      },
    }),
    [hydrated, log],
  );

  /**
   * People lookups are derived from state, so they live here rather than in
   * the actions memo — that one is deliberately state-free so callbacks stay
   * stable across renders.
   *
   * `personById` returns a placeholder rather than undefined for an unknown
   * id. Dual attribution appears on every audit row and approval record, and
   * a missing name there should read as a data problem in one row, not throw
   * and take the whole trail down.
   */
  const derived = useMemo<DemoDerived>(() => {
    const find = (id: string): Person =>
      state.people.find((p) => p.id === id) ?? {
        id,
        name: "Unknown person",
        cid: "—",
        email: "—",
        title: "No longer on record",
        cidVerified: false,
      };
    return { currentPerson: find(state.harness.persona), personById: find, connectedKinds: connectedKinds(state) };
  }, [state]);

  const value = useMemo<DemoContextValue>(
    () => ({ ...state, ...actions, ...derived }),
    [state, actions, derived],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}
