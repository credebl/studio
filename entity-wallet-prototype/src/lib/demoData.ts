/**
 * The demo's data model and its seed.
 *
 * There is no backend and there is not meant to be one — this is the Studio's
 * front end running against an in-browser store so the whole product can be
 * driven in a demo. Everything the UI can create, it creates here; everything
 * it lists, it lists from here. The seed exists so the app is worth looking at
 * on first load rather than being a tour of empty states.
 *
 * Ids are readable rather than random where they show up in the UI — a
 * readable id reads better in a demo than a uuid. DIDs are the exception:
 * they are did:polygon, because the NDI's verifiable data registry is anchored
 * on Polygon/Ethereum, and a DID shaped like the real thing is worth more here
 * than a memorable one. (They were did:indy:bhutan:… until the documentation
 * review flagged that method as wrong for the NDI.)
 */

import { SELF_SERVICE_SIGNUP_ENABLED } from "./deployment";

export type LedgerKind = "AnonCreds" | "W3C";
export type CredentialState = "offered" | "accepted" | "declined" | "revoked";
export type VerificationState = "requested" | "verified" | "declined" | "expired";

export interface Attribute {
  name: string;
  type: "string" | "number" | "boolean" | "date";
}

export interface Schema {
  id: string;
  name: string;
  version: string;
  ledger: LedgerKind;
  issuerDid: string;
  attributes: Attribute[];
  createdAt: string;
}

export interface CredDef {
  id: string;
  schemaId: string;
  tag: string;
  revocable: boolean;
  createdAt: string;
}

export interface Did {
  id: string;
  method: string;
  keyType: string;
  alias: string;
  isIssuer: boolean;
  createdAt: string;
}

export interface Connection {
  id: string;
  label: string;
  status: "active" | "invited";
  createdAt: string;
}

export interface Credential {
  id: string;
  holder: string;
  schemaName: string;
  credDefTag: string;
  state: CredentialState;
  issuedAt: string;
  method: "connection" | "email" | "qr" | "bulk";
}

export interface Verification {
  id: string;
  holder: string;
  schemaName: string;
  state: VerificationState;
  requestedAt: string;
}

/**
 * What an organisation may do on the NDI platform. Three separate grants,
 * held in any combination:
 *
 * - issuer / verifier — the platform's existing product. Bank of Bhutan has
 *   both: it issues account credentials and checks proofs at the counter.
 * - holder — the Entity Wallet: the organisation holds credentials issued to
 *   *it*, and people act for it under scoped authority.
 *
 * They arrive by different doors (Flow 1: tiered access). A company that
 * signs up for itself gets holder and nothing else; an organisation already
 * issuing on NDI asks for holder and is invited to it; issuer and verifier
 * are granted by an NDI platform admin on request.
 */
export type OrgCapability = "issuer" | "verifier" | "holder";

export interface Organization {
  id: string;
  name: string;
  description: string;
  role: "Owner" | "Admin" | "Member";
  members: number;
  createdAt: string;
  website?: string;
  location?: string;
  visibility: "public" | "private";
  capabilities: OrgCapability[];
  /** Who belongs to it — decides whose switcher it appears in. */
  memberIds: PersonId[];
  /**
   * Each member's role in *this* organisation, for people who joined it by
   * invitation. A person's own `memberRole` was written when Pelden was the
   * only organisation, and one field cannot hold two roles: inviting Bank of
   * Bhutan's owner into Pelden as an admin overwrote it, and made them an
   * admin of the bank too (AC-10 — each membership at its own role, neither
   * affecting the other). Read through `roleIn`, which falls back to
   * `memberRole` for the seed's Pelden people.
   */
  roles?: Record<PersonId, "Owner" | "Admin" | "Member">;
  /** Its name on the register, when that differs from how it is known. */
  legalName?: string;
}

/** An invitation to join an ecosystem, as opposed to an organization. */
export interface EcosystemInvitation {
  id: string;
  ecosystem: string;
  invitedBy: string;
  role: "Issuer" | "Verifier";
  receivedAt: string;
  state: "pending" | "accepted" | "declined";
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Issuer" | "Verifier" | "Member";
  status: "active" | "invited";
  joinedAt: string;
}

export interface Certificate {
  id: string;
  commonName: string;
  keyType: string;
  validFrom: string;
  expires: string;
  status: "valid" | "expiring" | "expired";
}

export interface Invitation {
  id: string;
  organization: string;
  invitedBy: string;
  role: string;
  receivedAt: string;
  state: "pending" | "accepted" | "declined";
}

export interface Ecosystem {
  id: string;
  name: string;
  role: "Lead" | "Member";
  members: number;
  joinedAt: string;
}

export interface EcosystemMember {
  id: string;
  organization: string;
  role: "Lead" | "Issuer" | "Verifier";
  joinedAt: string;
  status: "active" | "invited";
}

export interface BulkUpload {
  id: string;
  fileName: string;
  records: number;
  succeeded: number;
  failed: number;
  status: "completed" | "partial" | "processing";
  uploadedAt: string;
}

export interface BulkRecord {
  id: string;
  uploadId: string;
  holder: string;
  status: "issued" | "failed";
  error?: string;
}

export interface ApiKey {
  id: string;
  label: string;
  masked: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
}

/* ================================================================== */
/* Entity Wallet                                                       */
/*                                                                     */
/* Everything below serves one story: Pelden Trading becomes real,  */
/* grants Rinzin a narrow authority, works under approval, delegates to */
/* Pema's own wallet, has that authority checked at a counterparty —   */
/* once passing, once failing — and leaves Pema a way to appeal.       */
/*                                                                     */
/* Two conventions worth stating once, because they run through all of */
/* it:                                                                 */
/*                                                                     */
/* 1. Anything named `decision` or `outcome` is a value the server      */
/*    would have returned. The UI renders it; the UI never computes it. */
/*    Deriving "is this in scope?" on the client would be four lines    */
/*    here and a lie about where authority lives — see CLAUDE.md.      */
/*                                                                     */
/* 2. A person is referenced by id, never by name, so that dual         */
/*    attribution has one place to resolve names and cannot drift.     */
/* ================================================================== */

/**
 * Everyone the entity knows about. A superset of the personas: the relations
 * register has to show people the demo is never driven as, or it shows one
 * row and teaches nothing about lifecycle.
 */
export type PersonId = string;

/**
 * The people the demo can be *driven* as.
 *
 * Four rather than three, and the fourth exists for a reason worth recording.
 * Act 2 is a grant being created from nothing, which means it needs somebody
 * who does not already hold a controllership — and everyone else does, or
 * shouldn't. Rinzin's relation is seeded active so act 3 can be shown on its
 * own; Pema is a Pattern B delegate and giving her a controllership would
 * teach the wrong model; Karma has left. Without Ugyen, act 2's person
 * selector offers only people it then refuses, and the act cannot be
 * completed at all.
 */
export type PersonaId =
  | "dorji"
  | "rinzin"
  | "pema"
  | "ugyen"
  | "invitee"
  | "yeshey"
  | "root"
  | "tshering"
  /* Whoever root last invited as an admin by an address the story does not
     already know. Like "invitee", not a named character: the person is
     whoever root typed, and exists only once they have set up. */
  | "newadmin";

/** The drivable personas, in story order. One list, so the harness, the nav
 *  and the acceptance screen cannot disagree about who exists.
 *
 *  Two kinds arrived with Flow 1. NDI's administrators: Anand Acharya is
 *  root and Kinzang Dorji the platform admin — the two the story names, and
 *  the only two it needs. A foundational-issuer designation takes two
 *  distinct administrators, and root counts as the second (FLOW-ONB-02 S2),
 *  so a second seeded admin — there used to be one, Kinley Wangdi — was a
 *  person the story never introduced. And "invitee" is whoever last accepted a member invitation: not a named
 *  character, because the person is whoever the owner typed into the invite
 *  form, and their record only exists once they have accepted. The harness
 *  shows a persona only while its person exists, so the invitee appears the
 *  moment there is one. */
export const PERSONAS: PersonaId[] = [
  "dorji",
  "rinzin",
  "pema",
  "ugyen",
  "invitee",
  "yeshey",
  "root",
  "tshering",
  "newadmin",
];

/** NDI's own administrators — not members of any business on the platform. */
export const PLATFORM_ADMINS: PersonaId[] = ["tshering"];

/**
 * NDI's root administrator — seeded once by the deployment (Flow 1
 * preconditions: "at least one Root Admin exists"), never onboarded.
 *
 * WHY ROOT SIGNS IN AND NEVER SIGNS UP
 *
 * An earlier version had root create an account with the seeded address and
 * be "recognised" on the welcome screen. That read as root being onboarded
 * like a business — the room saw "Your account is ready · Add your
 * organisation" and asked why the platform's owner was being asked to set
 * anything up. It also meant anyone who typed root's address first became
 * root. The account now exists from the deployment: root signs in, lands in
 * NDI's own organisation, and sign-up refuses the address as taken.
 */
export const ROOT_ADMIN: PersonaId = "root";

/**
 * Bhutan NDI's own organisation — the platform administration organisation
 * (Flow 1 design D9), seeded rather than onboarded. Root and the admins root
 * invites belong to it. It has everything the Studio does, because NDI runs
 * the network the Studio is for; and it is not an organisation *on* the
 * platform, so it never appears in the admin's list of organisations.
 */
export const NDI_ORG = "org-ndi";

/**
 * The story's entity. Wallet records without an `orgId` are its — the seed
 * was written when it was the only wallet — and `inOrg` is the one place
 * that assumption lives.
 */
export const PELDEN = "org-pelden";
export const inOrg =
  (orgId: string) =>
  (x: { orgId?: string }): boolean =>
    (x.orgId ?? PELDEN) === orgId;

/**
 * An organisation's name as running text uses it: "Pelden Trading", not
 * "Pelden Trading Pvt. Ltd.". The legal suffix belongs in headings, on the
 * registration and in the switcher; mid-sentence it ends in a full stop
 * that collides with the sentence's own — "a member of Pelden Trading Pvt.
 * Ltd.." — which is how it first showed up on the member's dashboard.
 */
export const shortOrgName = (name: string) => name.replace(/ (Pvt\. )?Ltd\.$/, "");

/** A person's role in one organisation, or undefined if they do not belong to it. */
export const roleIn = (
  org: Pick<Organization, "id" | "memberIds" | "roles"> | undefined,
  person: Pick<Person, "id" | "memberRole"> | undefined,
): "Owner" | "Admin" | "Member" | undefined => {
  if (!org || !person || !org.memberIds.includes(person.id)) return undefined;
  return org.roles?.[person.id] ?? (org.id === PELDEN ? person.memberRole : undefined);
};

/** Whether someone administers the platform: root, or an admin root invited. */
export const isPlatformAdmin = (person: { platformRole?: "root" | "admin" } | undefined) =>
  person?.platformRole === "root" || person?.platformRole === "admin";

export interface Person {
  id: PersonId;
  name: string;
  /** Shown as a masked CID; a real one is never a display string. */
  cid: string;
  email: string;
  /** What they are to the entity, in words the UI can print. */
  title: string;
  /** Whether the register has confirmed them. Gates C2's person selector. */
  cidVerified: boolean;
  /**
   * Their role in Pelden Trading, if they belong to it at all.
   *
   * Membership, not authority (FLOW-ONB-02 Q4). A member can sign in and see
   * the organisation; acting for it needs a controllership relation on top,
   * granted separately and accepted (Flow 3). The two are kept in different
   * places precisely so that nothing can read one as the other. Absent for
   * people outside the company — Pema is an external clearing agent, and
   * NDI's administrators belong to no business at all.
   */
  memberRole?: "Owner" | "Admin" | "Member";
  /**
   * NDI's own staff: root (seeded by the deployment) or an admin root
   * invited. Independent of memberRole — an administrator belongs to no
   * business.
   */
  platformRole?: "root" | "admin";
  /**
   * False until the person has created their account. Absent means they
   * have one. It is what lets the platform's day zero exist at all: the
   * people are known to the story before any of them has signed up.
   */
  hasAccount?: boolean;
  /**
   * The invitation that brought them onto the platform, for someone who
   * joined an organisation during the demo at an address the story does
   * not know. Marks the record as drivable: the harness and the sign-in
   * panel list the story's named characters (PERSONAS) and, after them,
   * whoever the presenter invited — any number of them, since an owner
   * invites more than one colleague.
   */
  joinedBy?: string;
}

/**
 * The operations a scope can grant. These are the brief's operation names
 * rather than friendlier ones, because they appear in audit rows and parked
 * operations where matching the server's vocabulary matters more than reading
 * nicely. `scopeModel.ts` is what turns them into English.
 */
export type ControllerOperation =
  | "credential:receive"
  | "credential:accept"
  | "credential:list"
  | "proof:present"
  | "connection:create"
  | "approval:decide";

export type ApprovalPolicy = "AUTO" | "SINGLE_APPROVER" | "DUAL_CONTROL";

export type LegalBasis = "entity_consent" | "court_order" | "governance_prescribed";

export type RelationState =
  | "DRAFT"
  | "PENDING_ACCEPTANCE"
  | "PENDING_REGISTRATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "TERMINATED"
  | "EXPIRED";

/**
 * A dimension of a grant: either everything, or a named list.
 *
 * Modelled as a union rather than an empty array meaning "any", because the
 * difference between "to any relying party" and "to nobody" is the difference
 * between a broad grant and a useless one, and an empty array reads as both.
 */
export type ScopeFilter = { mode: "any" } | { mode: "list"; values: string[] };

/**
 * One operation, with its own filters and its own approval policy.
 *
 * The per-grant approval policy is the reason a relation renders as several
 * sentences instead of one: writing the read-mode sentences by hand made it
 * obvious that "everything he does needs an approver" is usually false —
 * accepting offers is automatic while presenting proofs is not, and a single
 * trailing clause can only tell that truth when every policy agrees.
 */
export interface ScopeGrant {
  operation: ControllerOperation;
  credentialTypes: ScopeFilter;
  relyingParties: ScopeFilter;
  approval: ApprovalPolicy;
}

export interface Scope {
  /** Audit rows cite the version that was matched, so it has to be on here. */
  version: number;
  validFrom: string;
  validUntil: string | null;
  grants: ScopeGrant[];
}

/** The signed instrument behind a relation — stored as a hash and a reference. */
export interface Instrument {
  fileName: string;
  hash: string;
  reference: string;
}

export interface ControllershipRelation {
  id: string;
  /** The entity it is authority over. Absent means Pelden Trading. */
  orgId?: string;
  personId: PersonId;
  legalBasis: LegalBasis;
  instrument: Instrument | null;
  scope: Scope;
  state: RelationState;
  /** The Owner's own full-scope relation. Renders as a special case. */
  isRootAuthority: boolean;
  createdAt: string;
  acceptedAt: string | null;
  activatedAt: string | null;
  suspendedAt?: string | null;
  endedReason?: string | null;
}

/** An attribute as it actually arrived, value included. */
export interface CredentialAttribute {
  name: string;
  value: string;
}

/** A credential the *entity* holds. Distinct from `Credential`, which the
 *  entity issued to somebody else. */
export interface HeldCredential {
  id: string;
  /** Whose wallet it is in. Absent means Pelden Trading's. */
  orgId?: string;
  type: string;
  issuer: string;
  issuerDid: string;
  issuerTrusted: boolean;
  attributes: CredentialAttribute[];
  /** The root everything else chains from. Gets its own treatment in B3. */
  isFoundational: boolean;
  receivedAt: string;
  expiresAt: string | null;
  status: "active" | "expired" | "revoked";
}

/**
 * What the server said about an operation the Controller wants to run.
 * Never computed here — see the header note.
 */
export type ScopeDecision = "allowed" | "out_of_scope" | "requires_approval";

export interface CredentialOffer {
  id: string;
  /** Whose wallet it was offered to. Absent means Pelden Trading's. */
  orgId?: string;
  type: string;
  issuer: string;
  issuerDid: string;
  issuerTrusted: boolean;
  /** Read from the offer payload, not from anything a user typed. */
  attributes: CredentialAttribute[];
  decision: ScopeDecision;
  /** Populated when the decision is anything but `allowed`. */
  decisionReason: string | null;
  state: "pending" | "parked" | "accepted" | "declined" | "expired";
  receivedAt: string;
  expiresAt: string;
}

/**
 * A relying party asking the entity for a presentation. It arrives as a task
 * in the console — not a deep link — because the entity has no device.
 */
export interface VerificationRequestTask {
  id: string;
  /** Whose wallet was asked. Absent means Pelden Trading's. */
  orgId?: string;
  relyingParty: string;
  relyingPartyDid: string;
  relyingPartyTrusted: boolean;
  credentialType: string;
  /** Everything asked for. */
  requestedAttributes: string[];
  /** The subset that is actually required — the least-disclosure default. */
  requiredAttributes: string[];
  requestsControllershipProof: boolean;
  decision: ScopeDecision;
  decisionReason: string | null;
  /**
   * What the Controller chose to disclose. Recorded so an approver decides on
   * the actual disclosure rather than on the request — approving "a
   * presentation to Bank of Bhutan" without knowing which attributes it
   * carries is not an approval of anything.
   */
  disclosing?: string[];
  state: "ready" | "parked" | "signing" | "presented" | "declined" | "expired";
  receivedAt: string;
  expiresAt: string;
}

export interface ApprovalSignature {
  personId: PersonId;
  at: string;
  method: "web" | "wallet";
}

/**
 * An operation held back by policy until somebody decides it.
 *
 * `stale` is the edge the brief calls out and the one most likely to be
 * skipped: approved, then invalidated before it ran because the relation or
 * scope changed underneath it. Worth designing precisely because a system
 * that quietly executed it would be broken in a way nobody could see.
 */
export interface ParkedOperation {
  id: string;
  /** Whose operation it is. Absent means Pelden Trading's. */
  orgId?: string;
  /** Issuing delegated authority parks like anything else, but it is an
   *  Owner action rather than one of the Controller operations. */
  operation: ControllerOperation | "authority:issue";
  summary: string;
  requestedBy: PersonId;
  relationId: string;
  scopeVersion: number;
  /**
   * The offer or verification request this is holding back.
   *
   * Without it an approval is a state change and nothing else — the whole
   * point of the queue is that deciding it lets the held operation run, and
   * "approved" with nothing to apply it to is a dead end that looks like a
   * feature.
   */
  targetId: string | null;
  targetRelyingParty: string | null;
  /** What an approver's wallet signature actually commits to. */
  payloadHash: string;
  policy: ApprovalPolicy;
  requiredSignatures: number;
  signatures: ApprovalSignature[];
  state: "parked" | "awaiting_signature" | "approved" | "rejected" | "expired" | "stale";
  decisionReason: string | null;
  createdAt: string;
  /** Drives the TTL countdown. */
  expiresAt: string;
  /** Set when `stale` — why an approved operation stopped being valid. */
  invalidatedReason?: string | null;
}

export type AuthorityKind = "role" | "capability";

/**
 * A Role or Capability credential the entity issued into a person's own
 * wallet. The constraints are public: any verifier can read them, which is
 * the whole point of Pattern B.
 */
export interface DelegatedAuthority {
  id: string;
  kind: AuthorityKind;
  title: string;
  recipientId: PersonId;
  /** The Role this Capability hangs off, if any. Act 5 revokes the parent. */
  parentId: string | null;
  /** Every Pattern B credential traces back to a controllership relation. */
  relationId: string;
  taskScopes: string[];
  valueCap: { amount: number; currency: "BTN"; perTransaction: boolean } | null;
  counterparties: ScopeFilter;
  validFrom: string;
  validUntil: string;
  status: "ACTIVE" | "SUSPENDED" | "REVOKED" | "EXPIRED";
  acceptance: "sent" | "accepted" | "rejected" | "expired";
  issuedAt: string;
  acceptedAt: string | null;
  endedAt?: string | null;
  endedReason?: string | null;
  appealReference?: string | null;
}

/** One link in the chain a verification walks. */
export interface AuthorityChainLink {
  id: string;
  label: string;
  kind: "foundational" | "relation" | "role" | "capability";
  /** Who holds this link — the entity, or a person. */
  heldBy: string;
  status: "valid" | "revoked" | "suspended" | "expired";
}

export interface ConstraintCheck {
  label: string;
  detail: string;
  outcome: "pass" | "fail";
}

/**
 * The signed decision an external verifier renders (D5).
 *
 * `SERVICE_UNREACHABLE` is a FAIL, not a third outcome — it is separate here
 * only so the UI can say honestly *why* it failed. Fail closed: an
 * unreachable service never resolves to a hopeful spinner or a silent pass.
 */
export interface VerificationDecision {
  id: string;
  outcome: "PASS" | "FAIL" | "SERVICE_UNREACHABLE";
  verifier: string;
  /** Dual attribution, and nothing else about the person. */
  entity: string;
  actorId: PersonId;
  authorityId: string;
  declarationRef: string;
  declarationHash: string;
  declaredValue: { amount: number; currency: "BTN" };
  chain: AuthorityChainLink[];
  checks: ConstraintCheck[];
  /** Present on a FAIL. Never leaks unrelated personal data. */
  reasons: string[];
  decidedAt: string;
  signature: string;
}

/**
 * An append-only audit row.
 *
 * `prevHash`/`rowHash` are fixture strings — this is an array in
 * localStorage, not a hash chain, and the README says so out loud. They are
 * here because the *integrity indicator* is part of what C6 has to show, and
 * a row with nowhere to put a hash cannot show it.
 */
export interface AuditEntry {
  id: string;
  seq: number;
  operation: string;
  summary: string;
  /** The principal. Always the entity, never the person. */
  entity: string;
  /** The person who acted. Both are shown, always. */
  actorId: PersonId;
  relationId: string | null;
  scopeVersion: number | null;
  approvedById: PersonId | null;
  relyingPartyDid: string | null;
  /** A digest of what was disclosed. Never the values themselves. */
  disclosedDigest: string | null;
  at: string;
  prevHash: string;
  rowHash: string;
}

export interface Appeal {
  id: string;
  /** The reference given to the holder in the revocation notice. */
  reference: string;
  subjectId: PersonId;
  againstKind: "authority" | "relation";
  againstId: string;
  againstTitle: string;
  /** The reason the Owner gave when revoking. */
  noticeReason: string;
  noticeIssuedAt: string;
  submittedAt: string | null;
  submission: string | null;
  state:
    | "notice_issued"
    | "open"
    | "under_review"
    | "upheld_reinstated"
    | "rejected"
    | "window_closed";
  /** Provisional, pending the Governance Framework. Copy, never a graphic. */
  windowWorkingDays: number;
  decisionWorkingDays: number;
  evidence: string[];
}

/** Where the demo currently is in the story. */
/* ================================================================== */
/* Onboarding — Flow 1 (FLOW-ONB-01, FLOW-ONB-02)                      */
/* ================================================================== */

/**
 * FLOW-ONB-01 — the one account the sign-up flow is creating.
 *
 * WHY THIS IS NOT A PERSONA
 *
 * Personas are people the story already knows, driven from the harness. The
 * person signing up is, by definition, someone the platform does not know
 * yet: until step 7 they are an email address and a token. Modelling them as
 * a persona would mean an account existing before it has been created, which
 * is the one thing this flow exists to prevent. So it is a session — one at
 * a time, persisted so an interrupted sign-up resumes (UN-03), and cleared by
 * starting again.
 *
 * WHAT IT DELIBERATELY DOES NOT HOLD
 *
 * No password (Keycloak holds it — FLOW-ONB-01 §12 item 3), no national ID,
 * no organisation details, no DID (§7.3). A shell account has nothing to
 * protect, and that is what makes an open sign-up door safe.
 */
export type SignupStage = "check_email" | "set_password" | "done";

export interface SignupSession {
  email: string;
  stage: SignupStage;
  /** Epoch ms of each verification mail sent, oldest first. S4 counts these. */
  sends: number[];
  /** The verification link is single-use (E3). */
  linkUsed: boolean;
  /** Set at step 6. */
  name: string;
  /** Organisations this account belongs to. Empty means a shell (Q3). */
  memberships: { orgId: string; role: "Owner" | "Admin" | "Member" }[];
  /**
   * Where to go once the account exists. An invitation link sets this, so a
   * person who had to create an account first is brought straight back to
   * the invitation (FLOW-ONB-02 A1) — "we'll bring you straight back here".
   */
  returnTo: string | null;
  createdAt: string | null;
}

/**
 * FLOW-ONB-02 — an invitation, of either kind.
 *
 * ONE RECORD, TWO KINDS, NO HIDDEN BRANCHING
 *
 * Kind M adds a person to an organisation that exists; Kind O brings on an
 * organisation that does not exist yet. The specification is careful that
 * every difference between them is tabulated (§1.1), so they share one
 * record and differ in which fields are filled — rather than the platform's
 * own `org_invitations`, which requires an organisation and a user id and so
 * cannot name an organisation that has not been created (§12 item 2).
 *
 * The second approval follows the capability being granted, not the kind
 * (POL-CAP, §1.1): a foundational issuer needs it, an ordinary business
 * invited to register does not. So it is a field, not a property of Kind O.
 */
/**
 * M and O are FLOW-ONB-02's two kinds. Two more arrived with the platform's
 * own setup, and the flow specification does not name them yet (raise at
 * Gate 2):
 *
 * - A — root invites a platform administrator. Root holds every grant, so
 *   there is nobody above to approve it.
 * - W — a platform admin invites the owner of an organisation already on
 *   NDI (an issuer or verifier) to set up its Entity Wallet, after
 *   reviewing its request. The organisation exists; what the invitation
 *   carries is the holder capability, still subject to the register check.
 */
export type InvitationKind = "M" | "O" | "A" | "W";

export type OrgInvitationState =
  | "PENDING_APPROVAL" // Kind O, waiting on a second administrator. Not sent.
  | "PENDING" // Sent. Confers nothing until accepted.
  | "ACCEPTED"
  | "DECLINED" // A2
  | "EXPIRED" // E4 — 14 days (M), 30 days (O)
  | "REVOKED" // E5 — withdrawn by the inviter or an admin before acceptance
  | "REFUSED" // The second administrator said no. Never sent.
  | "VOID"; // E6 — the inviter lost their authority before acceptance

export interface OrgInvitation {
  id: string;
  kind: InvitationKind;
  /** The address it goes to. Stored whole here; the audit log would hash it. */
  email: string;
  /* ---- Kind M ---- */
  orgId: string | null;
  role: "Member" | "Admin" | null;
  /* ---- Kind O ---- */
  /** The organisation to be created. */
  legalName: string | null;
  /** How it is constituted — its legal identity, in the proposer's words. */
  legalIdentity: string | null;
  /** What it is being brought on for, in words the approver will read. */
  purpose: string | null;
  /** Whether POL-CAP requires a second administrator for what this grants. */
  needsSecondApproval: boolean;
  /* ---- Both ---- */
  invitedBy: PersonId;
  approvedBy: PersonId | null;
  createdAt: string;
  /** Null until it has actually been sent — a Kind O invitation waiting on
   *  approval has not been. */
  sentAt: string | null;
  expiresAt: string | null;
  state: OrgInvitationState;
  /** E8 — delivery is asynchronous, and a failure is only visible here. */
  delivery: "not_sent" | "delivered" | "failed";
  decidedAt: string | null;
  /** Who accepted it, once someone has. */
  acceptedName: string | null;
}

/* ================================================================== */
/* Onboarding — Flow 2 (organisation onboarding, holder)               */
/* ================================================================== */

/** Which register can vouch for you depends on what kind of thing you are. */
export type OrgKind = "company" | "licensed" | "cso";

/**
 * Flow 2 in progress — one organisation being added by one representative.
 *
 * LIST, THEN SELECT
 *
 * The representative proves who they are first, and the register returns
 * the organisations it lists them against, to pick from (GovTech
 * requirements §6.1, item 1b — decided 24 Sep 2026). Nobody types a
 * registration number to claim a company: the person's identity comes from
 * the wallet proof, never from a field, and the organisation is a selection
 * — an opaque reference the register handed back — not an identifier someone
 * could guess. `selectedRef` holds that reference and nothing more.
 */
export interface OrgOnboarding {
  kind: OrgKind;
  /** The name the citizen credential gave when the proof was answered. */
  provedName: string | null;
  /** The register's opaque reference for the organisation chosen. */
  selectedRef: string | null;
  /** Set when the register listed nothing and the person asked NDI to review. */
  reviewId: string | null;
  /** Registration accepted, holder capability on (Flow 2 step 6). */
  completed: boolean;
  /**
   * Set when the organisation was named by an NDI invitation (FLOW-ONB-02
   * Kind O) rather than chosen from the register's list. The register is
   * then asked to confirm that one pair — the person, and the organisation
   * the invitation names — instead of listing.
   */
  invitationId: string | null;
}

/**
 * Flow 2's fallback when the register cannot match — decided 24 Sep 2026:
 * manual review, not a dead end (Flow catalogue, Flow 1 edge cases).
 *
 * HOLDER is "automatic where a register answers; otherwise NDI review"
 * (Flow 1 design §8). So a case carries what the register actually said —
 * the reason it is here at all — beside what the person claims and the
 * evidence they gave, and the reviewer's decision is recorded with their
 * name. Until it is approved the organisation stays an ordinary one: it can
 * hold nothing.
 */
/**
 * What the register returns for an authenticated representative: the
 * organisations it lists them against. A fixture — no register is queried.
 *
 * Two rows, because a list of one does not show that this is a choice, and
 * because the second row is the case worth seeing: an organisation already on
 * the platform, registered by another director. Registering it again would be
 * re-onboarding, which the Flow 1 design calls a defect wherever it appears —
 * the way in for a second director is an invitation from the first.
 */
export interface RegisterListing {
  /** Opaque — the register's reference, not a registration number. */
  ref: string;
  legalName: string;
  registrationNumber: string;
  entityType: string;
  /** What the register says this person is to the organisation. */
  capacity: string;
  /** Already registered on the platform by someone else. */
  onPlatform: boolean;
  /** Only reached through an invitation naming it, never listed by person. */
  invitedOnly?: boolean;
}

export const REGISTER_LISTINGS: RegisterListing[] = [
  {
    ref: "cra:rep:7f3a91c2",
    legalName: "Pelden Trading Pvt. Ltd.",
    registrationNumber: "CRA-2019-04477",
    entityType: "Private limited company",
    capacity: "Director",
    onPlatform: false,
  },
  {
    ref: "cra:rep:1c90e44b",
    legalName: "Druk Valley Hardware Pvt. Ltd.",
    registrationNumber: "CRA-2023-11802",
    entityType: "Private limited company",
    capacity: "Director",
    onPlatform: true,
  },
  {
    /* Found only by name, from an invitation that names it — it is not
       among what the register lists against Dorji. */
    ref: "cra:rep:5b21de07",
    legalName: "Bank of Bhutan Ltd.",
    registrationNumber: "CRA-1997-00112",
    entityType: "Public limited company",
    capacity: "Chief executive's delegate",
    onPlatform: false,
    invitedOnly: true,
  },
];

/**
 * An organisation asking NDI for more access — an Entity Wallet, or the
 * right to issue or verify. Reviewed by a platform admin, whose decision is
 * recorded with their name (rule 9: the decision is the server's; here, a
 * fixture or an admin's click, never the requester's screen deciding).
 */
export interface AccessRequest {
  id: string;
  orgId: string;
  capability: OrgCapability;
  requestedBy: PersonId;
  /** Printed as-is: the requester may be nobody the demo can be driven as. */
  requesterName: string;
  requesterEmail: string;
  note: string;
  submittedAt: string;
  state: "PENDING" | "APPROVED" | "DECLINED";
  decidedBy: PersonId | null;
  decidedAt: string | null;
  reason: string | null;
  /** For an Entity Wallet: the invitation approving it sent. */
  invitationId: string | null;
}

export type ReviewState = "UNDER_REVIEW" | "APPROVED" | "REFUSED";

export interface ManualReview {
  id: string;
  /** What the applicant is given to quote. */
  reference: string;
  kind: OrgKind;
  legalName: string;
  registrationNumber: string;
  applicantName: string;
  /** Masked. Proved from the applicant's wallet before they got this far. */
  applicantCid: string;
  /** What the register returned — why an automatic decision was not possible. */
  registerAnswer: string;
  evidence: string[];
  note: string;
  submittedAt: string;
  state: ReviewState;
  reviewerId: PersonId | null;
  decidedAt: string | null;
  /** Required on refusal, so the applicant is told why. */
  reason: string | null;
}

export interface HarnessState {
  /**
   * Who the console is being driven as. Decides what is *absent*.
   *
   * A person id rather than a PersonaId: a colleague the owner invites at an
   * address the story does not know gets a record of their own, and has to
   * be drivable the moment they accept. The story's named characters are
   * still PersonaIds; this is where anyone else fits.
   */
  persona: PersonId;
  /** 1–6, matching the acts. 0 means nobody has started the story. */
  act: number;
  /** Whether the story runner overlay is showing. */
  runnerOpen: boolean;
  /**
   * Per-screen state overrides, for review rather than for the demo: a screen
   * asks for its own key and renders that state instead of its real one. A
   * state you cannot reach is a state you cannot review.
   */
  stateOverrides: Record<string, string>;
  /**
   * FLOW-ONB-01 P3, as the deployment would set it. Held here rather than
   * only in deployment.ts so the demo can show both ways onto the platform:
   * on, businesses sign up for themselves; off, NDI invites each one
   * (FLOW-ONB-02 Kind O). It is scaffolding — a deployment setting, not
   * something any user of the product could change.
   */
  selfServiceSignup: boolean;
  /**
   * Where the guided demo is, as an index into GUIDE_STEPS; null when it is
   * not running. Optional so a save from before the guide existed still
   * loads — its harness simply has no guide running.
   */
  guideStep?: number | null;
}

export interface DemoState {
  /** Which organization the workspace is currently showing. */
  activeOrgId: string;
  schemas: Schema[];
  credDefs: CredDef[];
  dids: Did[];
  connections: Connection[];
  credentials: Credential[];
  verifications: Verification[];
  organizations: Organization[];
  members: Member[];
  certificates: Certificate[];
  invitations: Invitation[];
  ecosystems: Ecosystem[];
  ecosystemMembers: EcosystemMember[];
  ecosystemInvitations: EcosystemInvitation[];
  bulkUploads: BulkUpload[];
  bulkRecords: BulkRecord[];
  apiKeys: ApiKey[];
  /** Newest first. `orgId` is where it happened; absent means Pelden's
   *  (the seed's entries, written when it was the only organisation). */
  activity: { id: string; text: string; at: string; orgId?: string }[];

  /* ---- Entity wallet ---- */
  people: Person[];
  relations: ControllershipRelation[];
  heldCredentials: HeldCredential[];
  offers: CredentialOffer[];
  verificationRequests: VerificationRequestTask[];
  parkedOperations: ParkedOperation[];
  delegatedAuthorities: DelegatedAuthority[];
  /** Act 5 keeps both decisions so PASS and FAIL can sit side by side. */
  decisions: VerificationDecision[];
  auditEntries: AuditEntry[];
  appeals: Appeal[];

  /* ---- Onboarding ---- */
  signup: SignupSession | null;
  orgInvitations: OrgInvitation[];
  orgOnboarding: OrgOnboarding | null;
  manualReviews: ManualReview[];
  accessRequests: AccessRequest[];
  /**
   * True from the moment onboarding completes until the story jumps past
   * act 1: the console is showing Pelden on its first day (`firstRunState`),
   * not the three-months-in seed.
   */
  firstRun: boolean;

  harness: HarnessState;
}

const ISSUER_DID = "did:polygon:0x63e1c57eb106e9daa28f8883118b7b35ce6288c1";

/* ================================================================== */
/* Dates that do not rot                                               */
/*                                                                     */
/* The entity-wallet fixtures used to be literal dates around          */
/* September 2026, which read correctly for about a fortnight and then */
/* started lying: countdowns said "Expired", capabilities fell outside  */
/* their validity window, and the verification service began failing    */
/* the one check the demo most needs to pass. A demo that decays is a   */
/* demo somebody eventually runs broken in front of an audience.        */
/*                                                                     */
/* So story dates are offsets from today. `day(-7)` is a week ago and   */
/* always will be.                                                      */
/*                                                                     */
/* Computed in UTC on purpose: the server and the client both evaluate  */
/* this module, and a local-time calculation would disagree between     */
/* them for anyone west of Greenwich — a hydration mismatch on every    */
/* screen showing a date. The one residual case is a dev server left    */
/* running across UTC midnight, which a restart fixes.                  */
/*                                                                     */
/* The issuer/verifier fixtures above keep their literal dates. They    */
/* are background rather than story, nothing computes against them, and */
/* an organisation whose schemas were created months ago is right.      */
/* ================================================================== */

const NOW = new Date();

/** A date this many days from today, as YYYY-MM-DD. */
const day = (offset: number): string =>
  new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate() + offset))
    .toISOString()
    .slice(0, 10);

/** A timestamp, for audit rows that show a time as well as a date. */
const at = (offset: number, time: string): string => `${day(offset)}T${time}:00+06:00`;

/** Dates are fixed strings, not computed: a demo should look the same twice. */
export const SEED: DemoState = {
  activeOrgId: "org-pelden",
  schemas: [
    {
      id: "schema:bhutan:2:CitizenshipID:1.2",
      name: "Citizenship ID",
      version: "1.2",
      ledger: "AnonCreds",
      issuerDid: ISSUER_DID,
      createdAt: "2026-03-11",
      attributes: [
        { name: "cid_number", type: "string" },
        { name: "full_name", type: "string" },
        { name: "date_of_birth", type: "date" },
        { name: "dzongkhag", type: "string" },
      ],
    },
    {
      id: "schema:bhutan:2:UniversityDegree:1.0",
      name: "University Degree",
      version: "1.0",
      ledger: "W3C",
      issuerDid: ISSUER_DID,
      createdAt: "2026-04-02",
      attributes: [
        { name: "student_name", type: "string" },
        { name: "programme", type: "string" },
        { name: "graduation_year", type: "number" },
        { name: "honours", type: "string" },
      ],
    },
    {
      id: "schema:bhutan:2:DriversLicence:2.0",
      name: "Driving Licence",
      version: "2.0",
      ledger: "AnonCreds",
      issuerDid: ISSUER_DID,
      createdAt: "2026-05-19",
      attributes: [
        { name: "licence_number", type: "string" },
        { name: "vehicle_class", type: "string" },
        { name: "valid_until", type: "date" },
      ],
    },
  ],
  credDefs: [
    {
      id: "creddef:bhutan:3:CitizenshipID:default",
      schemaId: "schema:bhutan:2:CitizenshipID:1.2",
      tag: "default",
      revocable: true,
      createdAt: "2026-03-11",
    },
    {
      id: "creddef:bhutan:3:UniversityDegree:rub-2026",
      schemaId: "schema:bhutan:2:UniversityDegree:1.0",
      tag: "rub-2026",
      revocable: false,
      createdAt: "2026-04-02",
    },
  ],
  dids: [
    {
      id: ISSUER_DID,
      method: "did:polygon",
      keyType: "ed25519",
      alias: "Issuer key",
      isIssuer: true,
      createdAt: "2026-02-28",
    },
    {
      id: "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
      method: "did:key",
      keyType: "ed25519",
      alias: "Test key",
      isIssuer: false,
      createdAt: "2026-04-20",
    },
  ],
  connections: [
    { id: "c-8f21ab4d", label: "Sonam Wangchuk", status: "active", createdAt: "2026-06-02" },
    { id: "c-4b90cc17", label: "Tashi Dema", status: "active", createdAt: "2026-06-14" },
    { id: "c-1e77fa02", label: "Karma Yangchen", status: "active", createdAt: "2026-07-08" },
    { id: "c-9d33b510", label: "Ugyen Tshering", status: "invited", createdAt: "2026-08-01" },
  ],
  credentials: [
    {
      id: "cred-70a1",
      holder: "Sonam Wangchuk",
      schemaName: "Citizenship ID",
      credDefTag: "default",
      state: "accepted",
      issuedAt: "2026-06-03",
      method: "connection",
    },
    {
      id: "cred-70a2",
      holder: "Tashi Dema",
      schemaName: "University Degree",
      credDefTag: "rub-2026",
      state: "accepted",
      issuedAt: "2026-06-15",
      method: "email",
    },
    {
      id: "cred-70a3",
      holder: "Karma Yangchen",
      schemaName: "Citizenship ID",
      credDefTag: "default",
      state: "offered",
      issuedAt: "2026-07-09",
      method: "qr",
    },
    {
      id: "cred-70a4",
      holder: "Ugyen Tshering",
      schemaName: "Driving Licence",
      credDefTag: "default",
      state: "declined",
      issuedAt: "2026-08-02",
      method: "email",
    },
  ],
  verifications: [
    {
      id: "ver-3301",
      holder: "Sonam Wangchuk",
      schemaName: "Citizenship ID",
      state: "verified",
      requestedAt: "2026-07-21",
    },
    {
      id: "ver-3302",
      holder: "Tashi Dema",
      schemaName: "University Degree",
      state: "requested",
      requestedAt: "2026-08-12",
    },
  ],
  organizations: [
    {
      /* NDI itself — see NDI_ORG. Every Studio capability, no Entity Wallet:
         the platform does not hold credentials issued to it here. */
      id: NDI_ORG,
      name: "Bhutan NDI",
      legalName: "Bhutan National Digital Identity",
      description: "Runs the Bhutan National Digital Identity network and this Studio.",
      role: "Owner",
      members: 2,
      createdAt: "2023-02-21",
      website: "https://www.bhutanndi.com",
      location: "Thimphu, Bhutan",
      visibility: "public",
      capabilities: ["issuer", "verifier"],
      memberIds: ["root", "tshering"],
    },
    {
      /* The entity the whole Entity Wallet story is about. */
      id: "org-pelden",
      name: "Pelden Trading Pvt. Ltd.",
      description: "General trading — import and wholesale. CRA-2019-04477.",
      role: "Owner",
      members: 5,
      createdAt: "2026-05-20",
      website: "https://www.peldentrading.bt",
      location: "Babesa, Thimphu, Bhutan",
      visibility: "private",
      /* Holder only: it signed up for itself, so it has an Entity Wallet and
         no issuing or verifying on the network. */
      capabilities: ["holder"],
      memberIds: ["dorji", "rinzin", "ugyen", "pema", "invitee", "sonam", "karma", "tenzin"],
    },
    {
      /* Already on NDI as an issuer and verifier long before the Entity
         Wallet existed — it issues account credentials and checks proofs at
         the counter. Three months into the story it also holds an Entity
         Wallet, which it asked NDI for and was invited to (the second way
         onto the Entity Wallet). Each organisation appears only in its own
         people's switcher, so Pelden's never shows it. */
      id: "org-bob",
      name: "Bank of Bhutan",
      legalName: "Bank of Bhutan Ltd.",
      description: "Commercial bank. Issues account credentials and verifies customers on NDI.",
      role: "Owner",
      members: 3,
      createdAt: "2024-02-12",
      website: "https://www.bob.bt",
      location: "Norzin Lam, Thimphu, Bhutan",
      visibility: "public",
      capabilities: ["issuer", "verifier", "holder"],
      memberIds: ["yeshey"],
    },
    {
      /* Another existing NDI customer, here only so the platform admin's
         queue holds a request that is not about the Entity Wallet — a
         company asking to verify as well as issue. */
      id: "org-tashicell",
      name: "Tashi InfoComm Ltd.",
      description: "Mobile network operator. Issues SIM-registration credentials.",
      role: "Owner",
      members: 2,
      createdAt: "2025-03-04",
      location: "Thimphu, Bhutan",
      visibility: "public",
      capabilities: ["issuer"],
      memberIds: [],
    },
  ],
  /* The original Studio's staff list — four NDI people the story never
     knew, the first of them the prototype's own designer. Emptied: NDI's
     organisation is root and the admins root invites (see UsersView). */
  members: [],
  certificates: [
    {
      id: "x509-1",
      commonName: "issuer.bhutanndi.bt",
      keyType: "RSA 2048",
      validFrom: "2026-01-15",
      expires: "2027-01-15",
      status: "valid",
    },
    {
      id: "x509-2",
      commonName: "verify.bhutanndi.bt",
      keyType: "ECDSA P-256",
      validFrom: "2025-09-01",
      expires: "2026-09-01",
      status: "expiring",
    },
  ],
  invitations: [
    {
      id: "inv-1",
      organization: "Ministry of Education",
      invitedBy: "sangay@moe.gov.bt",
      role: "Issuer",
      receivedAt: "2026-08-18",
      state: "pending",
    },
  ],
  ecosystems: [
    { id: "eco-1", name: "Bhutan Education Trust", role: "Lead", members: 3, joinedAt: "2026-04-08" },
  ],
  ecosystemMembers: [
    {
      id: "em-1",
      organization: "Bhutan NDI",
      role: "Lead",
      joinedAt: "2026-04-08",
      status: "active",
    },
    {
      id: "em-2",
      organization: "Royal University of Bhutan",
      role: "Issuer",
      joinedAt: "2026-04-12",
      status: "active",
    },
    {
      id: "em-3",
      organization: "Ministry of Education",
      role: "Verifier",
      joinedAt: "2026-05-02",
      status: "invited",
    },
  ],
  ecosystemInvitations: [
    {
      id: "einv-1",
      ecosystem: "Himalayan Trust Network",
      invitedBy: "governance@htn.org",
      role: "Verifier",
      receivedAt: "2026-08-20",
      state: "pending",
    },
  ],
  bulkUploads: [
    {
      id: "bulk-2201",
      fileName: "graduates-2026-batch-1.csv",
      records: 248,
      succeeded: 246,
      failed: 2,
      status: "partial",
      uploadedAt: "2026-07-30",
    },
    {
      id: "bulk-2202",
      fileName: "graduates-2026-batch-2.csv",
      records: 112,
      succeeded: 112,
      failed: 0,
      status: "completed",
      uploadedAt: "2026-08-06",
    },
  ],
  bulkRecords: [
    { id: "br-1", uploadId: "bulk-2201", holder: "choki.wangmo@rub.edu.bt", status: "issued" },
    { id: "br-2", uploadId: "bulk-2201", holder: "tenzin.norbu@rub.edu.bt", status: "issued" },
    {
      id: "br-3",
      uploadId: "bulk-2201",
      holder: "not-an-email",
      status: "failed",
      error: "Invalid email address",
    },
    {
      id: "br-4",
      uploadId: "bulk-2201",
      holder: "rinzin.p@rub.edu.bt",
      status: "failed",
      error: "Missing required attribute: graduation_year",
    },
    { id: "br-5", uploadId: "bulk-2202", holder: "yeshey.d@rub.edu.bt", status: "issued" },
  ],
  apiKeys: [
    {
      id: "key-1",
      label: "Issuance service",
      masked: "ndi_live_••••••••7f3a",
      createdAt: "2026-03-12",
      lastUsed: "2026-08-22",
      status: "active",
    },
  ],
  /* Pelden's recent history, newest first, drawn from the same events as the
     audit trail below so the two never disagree. It used to be the inherited
     Studio's issuer feed — credentials offered to graduates, a bulk upload —
     which read as this trading company running a university's issuance. */
  activity: [
    { id: "a-1", text: "Pema Choden accepted Declaration authority", at: day(-1) },
    { id: "a-2", text: "Declaration authority issued to Pema Choden", at: day(-2) },
    { id: "a-3", text: "Business Registration presented to Bhutan National Single Window", at: day(-14) },
    { id: "a-4", text: "Karma Wangmo's controllership ended", at: day(-40) },
    { id: "a-5", text: "Rinzin Dema accepted the duties of a controller", at: day(-102) },
  ],

  /* ================================================================ */
  /* Entity wallet — the six acts, as data                            */
  /* ================================================================ */

  people: [
    {
      id: "dorji",
      name: "Dorji Wangchuk",
      cid: "•••• •••• 4821",
      email: "dorji.wangchuk@peldentrading.bt",
      title: "Director · registered representative",
      cidVerified: true,
      memberRole: "Owner",
    },
    {
      id: "rinzin",
      name: "Rinzin Dema",
      cid: "•••• •••• 7134",
      email: "rinzin.dema@peldentrading.bt",
      title: "Operations manager",
      cidVerified: true,
      memberRole: "Member",
    },
    {
      id: "pema",
      name: "Pema Choden",
      cid: "•••• •••• 2960",
      email: "pema.choden@druksharpa.bt",
      title: "Clearing agent · Druk Sharpa Freight",
      cidVerified: true,
    },
    {
      /* Act 2's recipient: verified, and deliberately holding nothing. He is
         who the audience watches an authority being built for. */
      id: "ugyen",
      name: "Ugyen Phuntsho",
      cid: "•••• •••• 8306",
      email: "ugyen.phuntsho@peldentrading.bt",
      title: "Warehouse manager",
      cidVerified: true,
      memberRole: "Member",
    },
    {
      id: "sonam",
      name: "Sonam Yeshey",
      cid: "•••• •••• 5573",
      email: "sonam.yeshey@peldentrading.bt",
      title: "Finance officer",
      cidVerified: true,
      memberRole: "Member",
    },
    {
      id: "karma",
      name: "Karma Wangmo",
      cid: "•••• •••• 1208",
      email: "karma.wangmo@peldentrading.bt",
      title: "Finance officer (left the company)",
      cidVerified: true,
    },
    {
      /* C2 needs a person the register has not confirmed, or its
         "person not CID-verified" state is unreachable. */
      id: "tenzin",
      name: "Tenzin Norbu",
      cid: "—",
      email: "tenzin.norbu@peldentrading.bt",
      title: "Warehouse supervisor",
      cidVerified: false,
      memberRole: "Member",
    },
    {
      /* The two NDI administrators a foundational-issuer invitation needs.
         Neither belongs to Pelden Trading or to any business: they act for
         the platform administration organisation, which is seeded rather
         than onboarded (Flow 1 design D9). */
      id: "tshering",
      name: "Kinzang Dorji",
      cid: "•••• •••• 3317",
      email: "kinzang.dorji@bhutanndi.bt",
      title: "Platform admin · Bhutan NDI",
      cidVerified: true,
      platformRole: "admin",
    },
    {
      /* NDI's root administrator. Seeded by the deployment with an account
         already made, so never onboarded and never signed up: signs in. */
      id: "root",
      name: "Anand Acharya",
      cid: "•••• •••• 1002",
      email: "anand.acharya@bhutanndi.bt",
      title: "Root administrator · Bhutan NDI",
      cidVerified: true,
      platformRole: "root",
    },
    {
      /* Bank of Bhutan's owner on the platform — an account that has
         existed since the bank started issuing on NDI. */
      id: "yeshey",
      name: "Yeshey Choden",
      cid: "•••• •••• 7731",
      email: "yeshey.choden@bob.bt",
      title: "Head of digital banking · Bank of Bhutan",
      cidVerified: true,
    },
  ],

  relations: [
    {
      /* Yeshey's root authority over Bank of Bhutan's Entity Wallet, from
         when the bank set it up. */
      id: "rel-bob-root",
      orgId: "org-bob",
      personId: "yeshey",
      legalBasis: "entity_consent",
      instrument: {
        fileName: "board-resolution-bob-2026-06.pdf",
        hash: "sha256:7d0e5a91c3b24f68a0e1d97c52b8f3a4e6c10d29b7f5a8e3",
        reference: "BOB/BR/2026/022",
      },
      scope: {
        version: 1,
        validFrom: day(-70),
        validUntil: null,
        grants: [
          { operation: "credential:receive", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "credential:accept", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "credential:list", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "proof:present", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
        ],
      },
      state: "ACTIVE",
      isRootAuthority: true,
      createdAt: day(-70),
      acceptedAt: day(-70),
      activatedAt: day(-70),
    },
    {
      /* The Owner's own relation. Full scope, no expiry — the root everything
         else is granted out of, and the reason the scope grammar needs a
         special case rather than a sentence listing every operation. */
      id: "rel-root",
      personId: "dorji",
      legalBasis: "entity_consent",
      instrument: {
        fileName: "board-resolution-2026-05-18.pdf",
        hash: "sha256:4f1c9e2a7b83d05e6c41a9fb2d7e08c3915b6ad4e2f70c81",
        reference: "PT/BR/2026/011",
      },
      scope: {
        version: 1,
        validFrom: day(-112),
        validUntil: null,
        grants: [
          { operation: "credential:receive", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "credential:accept", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "credential:list", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "proof:present", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "connection:create", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "approval:decide", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
        ],
      },
      state: "ACTIVE",
      isRootAuthority: true,
      createdAt: day(-112),
      acceptedAt: day(-112),
      activatedAt: day(-112),
    },
    {
      /* Rinzin's grant, the one Act 3 runs on. Deliberately narrow, and
         narrow in a way you can see: she may accept two kinds of credential
         and present exactly one, to two
         named counterparties, and only presenting needs an approver. */
      id: "rel-rinzin",
      personId: "rinzin",
      legalBasis: "entity_consent",
      instrument: {
        fileName: "board-resolution-2026-05-28.pdf",
        hash: "sha256:9a7d40be15c2f386071e4dab8c93520fe6b1748ad03c95e2",
        reference: "PT/BR/2026/014",
      },
      scope: {
        version: 3,
        validFrom: day(-100),
        validUntil: day(113),
        grants: [
          { operation: "credential:receive", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          {
            operation: "credential:accept",
            credentialTypes: { mode: "list", values: ["Business Registration", "Business Licence"] },
            relyingParties: { mode: "any" },
            approval: "AUTO",
          },
          { operation: "credential:list", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          {
            operation: "proof:present",
            credentialTypes: { mode: "list", values: ["Business Registration"] },
            relyingParties: { mode: "list", values: ["Bhutan National Single Window", "Bank of Bhutan"] },
            approval: "SINGLE_APPROVER",
          },
          { operation: "connection:create", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
        ],
      },
      state: "ACTIVE",
      isRootAuthority: false,
      createdAt: day(-104),
      acceptedAt: day(-102),
      activatedAt: day(-102),
    },
    {
      /* Waiting on its Controller. The register has to show this state, and
         C4 needs a relation that has not been accepted yet. */
      id: "rel-sonam",
      personId: "sonam",
      legalBasis: "entity_consent",
      instrument: {
        fileName: "board-resolution-2026-09-01.pdf",
        hash: "sha256:2e58ac91d7f4630b85c2019eab7d43f6c80915e7b24da6f3",
        reference: "PT/BR/2026/019",
      },
      scope: {
        version: 1,
        validFrom: day(-1),
        validUntil: day(203),
        grants: [
          { operation: "credential:list", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          { operation: "approval:decide", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
        ],
      },
      state: "PENDING_ACCEPTANCE",
      isRootAuthority: false,
      createdAt: day(-8),
      acceptedAt: null,
      activatedAt: null,
    },
    {
      /* The departing-officer fear from the personas, already resolved. */
      id: "rel-karma",
      personId: "karma",
      legalBasis: "entity_consent",
      instrument: {
        fileName: "board-resolution-2026-03-04.pdf",
        hash: "sha256:71b3ec4a09d8526f1c74b0ade39f2851dc6047ba9e13f582",
        reference: "PT/BR/2026/006",
      },
      scope: {
        version: 2,
        validFrom: day(-187),
        validUntil: day(113),
        grants: [
          { operation: "credential:list", credentialTypes: { mode: "any" }, relyingParties: { mode: "any" }, approval: "AUTO" },
          {
            operation: "proof:present",
            credentialTypes: { mode: "list", values: ["Tax Clearance Certificate"] },
            relyingParties: { mode: "list", values: ["Bank of Bhutan"] },
            approval: "DUAL_CONTROL",
          },
        ],
      },
      state: "TERMINATED",
      isRootAuthority: false,
      createdAt: day(-189),
      acceptedAt: day(-187),
      activatedAt: day(-187),
      endedReason: "Left the company. Terminated on her last working day.",
    },
  ],

  heldCredentials: [
    {
      /* Act 1's milestone, and the root of every chain in Act 5. */
      id: "hc-foundational",
      type: "Business Registration",
      issuer: "Corporate Regulatory Authority",
      issuerDid: "did:polygon:0xbc8970d729b33f01ff0e7ca3caaf695da8747db4",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "registration_number", value: "CRA-2019-04477" },
        { name: "entity_type", value: "Private limited company" },
        { name: "registered_address", value: "Babesa, Thimphu, Bhutan" },
        { name: "incorporation_date", value: day(-2583) },
        { name: "status", value: "Active" },
      ],
      isFoundational: true,
      receivedAt: day(-112),
      expiresAt: null,
      status: "active",
    },
    {
      /* Bank of Bhutan's own registration, in its own wallet. */
      id: "hc-bob-registration",
      orgId: "org-bob",
      type: "Business Registration",
      issuer: "Corporate Regulatory Authority",
      issuerDid: "did:polygon:0xe58a0aa81d2ec2fb904f800d2699123052be5913",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Bank of Bhutan Ltd." },
        { name: "registration_number", value: "CRA-1997-00112" },
        { name: "entity_type", value: "Public limited company" },
        { name: "registered_address", value: "Norzin Lam, Thimphu, Bhutan" },
        { name: "status", value: "Active" },
      ],
      isFoundational: true,
      receivedAt: day(-70),
      expiresAt: null,
      status: "active",
    },
    {
      /* Not everything an entity holds comes from government. A bank issues
         the company its account as a credential too — the same wallet holds
         both, as any NDI wallet would, and presenting it is how Pelden proves
         to a supplier where payment goes without sending a bank letter. */
      id: "hc-bank",
      type: "Business Current Account",
      issuer: "Bank of Bhutan",
      issuerDid: "did:polygon:0xa2a4e362eb3f8494b23536454137d49265f1725c",
      issuerTrusted: true,
      attributes: [
        { name: "account_holder", value: "Pelden Trading Pvt. Ltd." },
        { name: "account_number", value: "•••• •••• 4417" },
        { name: "branch", value: "Thimphu main branch" },
        { name: "opened_on", value: day(-104) },
      ],
      isFoundational: false,
      receivedAt: day(-104),
      expiresAt: null,
      status: "active",
    },
    {
      id: "hc-tax",
      type: "Tax Clearance Certificate",
      issuer: "Department of Revenue & Customs",
      issuerDid: "did:polygon:0x08b3ba5dcbac0b871587004b93f298dcc81726c3",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "tpn", value: "TPN-114-8830" },
        { name: "assessment_year", value: "2025" },
        { name: "cleared_on", value: day(-161) },
      ],
      isFoundational: false,
      receivedAt: day(-161),
      expiresAt: day(-9),
      status: "expired",
    },
    {
      id: "hc-freight",
      type: "Freight Forwarder Permit",
      issuer: "Road Safety & Transport Authority",
      issuerDid: "did:polygon:0x7df3e776fe6432c53644c127df254180e12526fb",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "permit_number", value: "RSTA-FF-2024-0912" },
        { name: "vehicle_classes", value: "Heavy goods, container" },
      ],
      isFoundational: false,
      receivedAt: day(-210),
      expiresAt: day(154),
      status: "revoked",
    },
  ],

  offers: [
    {
      /* Act 3's offer. In scope and automatic — accepting it is the whole
         interaction, and the type is read from this payload, not typed.

         A trade licence, because that is what a trading company is offered
         after incorporation (Story A2 in the user stories: MoICE issues the
         Business Licence that authorises the activity). This was a Customs
         Broker Licence while the entity was a logistics firm; an importer does
         not hold one — it hires a licensed clearing agent, which is Pema. */
      id: "offer-licence",
      type: "Business Licence",
      issuer: "Ministry of Industry, Commerce & Employment",
      issuerDid: "did:polygon:0xafb50adefe9b359e15a79eada5d0bbb2675f33d3",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "licence_number", value: "BL-THI-2026-10442" },
        { name: "licensed_activity", value: "General trading — import and wholesale" },
        { name: "valid_until", value: day(358) },
      ],
      decision: "allowed",
      decisionReason: null,
      state: "pending",
      receivedAt: day(-7),
      expiresAt: day(7),
    },
    {
      /* The denied state. The reason is specific and the next step routes to
         the Owner — never to a self-edit. */
      id: "offer-insurance",
      type: "Fleet Insurance Certificate",
      issuer: "Royal Insurance Corporation of Bhutan",
      issuerDid: "did:polygon:0x4fc2bf84747e22ab86675163f6b59fc8ab469cb4",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "policy_number", value: "RICB-MV-2026-77412" },
        { name: "sum_insured", value: "BTN 4,200,000" },
      ],
      decision: "out_of_scope",
      decisionReason:
        "Your authority covers Business Registration and Business Licence credentials. Accepting insurance credentials was not granted.",
      state: "pending",
      receivedAt: day(-4),
      expiresAt: day(10),
    },
    {
      id: "offer-warehouse",
      type: "Bonded Warehouse Authorisation",
      issuer: "Department of Revenue & Customs",
      issuerDid: "did:polygon:0x08b3ba5dcbac0b871587004b93f298dcc81726c3",
      issuerTrusted: true,
      attributes: [
        { name: "registered_name", value: "Pelden Trading Pvt. Ltd." },
        { name: "facility_code", value: "BW-PHU-0043" },
        { name: "bonded_capacity", value: "1,800 m³" },
      ],
      decision: "requires_approval",
      decisionReason: "Accepting an authorisation of this kind needs one approver.",
      state: "parked",
      receivedAt: day(-3),
      expiresAt: day(11),
    },
    {
      id: "offer-lapsed",
      type: "Warehouse Safety Certificate",
      issuer: "Department of Labour",
      issuerDid: "did:polygon:0x37c307beb791b306b109010ad5d97de062f28f02",
      issuerTrusted: true,
      attributes: [{ name: "registered_name", value: "Pelden Trading Pvt. Ltd." }],
      decision: "allowed",
      decisionReason: null,
      state: "expired",
      receivedAt: day(-36),
      expiresAt: day(-22),
    },
  ],

  verificationRequests: [
    {
      /* Act 3's portal task. Five attributes asked for, two actually
         required — least disclosure has something to defend here. */
      id: "vr-bob",
      relyingParty: "Bank of Bhutan",
      relyingPartyDid: "did:polygon:0x42c7fe47af259e3e911a36578833f3beb2e50493",
      relyingPartyTrusted: true,
      credentialType: "Business Registration",
      requestedAttributes: [
        "registered_name",
        "registration_number",
        "entity_type",
        "registered_address",
        "incorporation_date",
      ],
      requiredAttributes: ["registered_name", "registration_number"],
      requestsControllershipProof: true,
      decision: "requires_approval",
      decisionReason: "Presenting to Bank of Bhutan is in scope and needs one approver.",
      state: "ready",
      receivedAt: day(-5),
      expiresAt: day(2),
    },
    {
      /* Already sent for approval, so the queue has something in it before
         the story is walked. Deliberately a *different* request from vr-bob:
         a parked operation and a request that still says "ready" would
         contradict each other, and the screen would show one of them as
         wrong. */
      id: "vr-bob-earlier",
      relyingParty: "Bank of Bhutan",
      relyingPartyDid: "did:polygon:0x42c7fe47af259e3e911a36578833f3beb2e50493",
      relyingPartyTrusted: true,
      credentialType: "Business Registration",
      requestedAttributes: ["registered_name", "registration_number", "entity_type"],
      requiredAttributes: ["registered_name", "registration_number"],
      requestsControllershipProof: false,
      decision: "requires_approval",
      decisionReason: "Presenting to Bank of Bhutan is in scope and needs one approver.",
      disclosing: ["registered_name", "registration_number"],
      state: "parked",
      receivedAt: day(-3),
      expiresAt: day(4),
    },
    {
      /* The relying-party filter doing its job — in scope by credential
         type, denied by counterparty. */
      id: "vr-druk",
      relyingParty: "Druk Trading House",
      relyingPartyDid: "did:polygon:0x067c37a944b618effbd0dfe9f463e5f60e458b07",
      relyingPartyTrusted: false,
      credentialType: "Business Registration",
      requestedAttributes: ["registered_name", "registration_number", "registered_address"],
      requiredAttributes: ["registered_name"],
      requestsControllershipProof: false,
      decision: "out_of_scope",
      decisionReason:
        "Your authority allows presentations to Bhutan National Single Window and Bank of Bhutan. Druk Trading House is not among them.",
      state: "ready",
      receivedAt: day(-2),
      expiresAt: day(5),
    },
    {
      id: "vr-bnsw-done",
      relyingParty: "Bhutan National Single Window",
      relyingPartyDid: "did:polygon:0xc70c2d3625bec5a34d5b3746b830d36f2525f163",
      relyingPartyTrusted: true,
      credentialType: "Business Registration",
      requestedAttributes: ["registered_name", "registration_number"],
      requiredAttributes: ["registered_name", "registration_number"],
      requestsControllershipProof: true,
      decision: "requires_approval",
      decisionReason: null,
      state: "presented",
      receivedAt: day(-14),
      expiresAt: day(-7),
    },
    {
      id: "vr-lapsed",
      relyingParty: "Bank of Bhutan",
      relyingPartyDid: "did:polygon:0x42c7fe47af259e3e911a36578833f3beb2e50493",
      relyingPartyTrusted: true,
      credentialType: "Tax Clearance Certificate",
      requestedAttributes: ["registered_name", "tpn", "assessment_year"],
      requiredAttributes: ["registered_name", "tpn"],
      requestsControllershipProof: false,
      decision: "requires_approval",
      decisionReason: null,
      state: "expired",
      receivedAt: day(-30),
      expiresAt: day(-23),
    },
  ],

  parkedOperations: [
    {
      /* Waiting on Dorji. The payload hash is what his wallet signature
         would actually commit to — B7 shows it for that reason. */
      id: "park-present-bob",
      operation: "proof:present",
      summary: "Present Business Registration to Bank of Bhutan",
      requestedBy: "rinzin",
      relationId: "rel-rinzin",
      scopeVersion: 3,
      targetId: "vr-bob-earlier",
      targetRelyingParty: "Bank of Bhutan",
      payloadHash: "sha256:c0a71e94b83f2d6508a1c47fe9b230da75146c8be03f9a27",
      policy: "SINGLE_APPROVER",
      requiredSignatures: 1,
      signatures: [],
      state: "parked",
      decisionReason: null,
      createdAt: day(-1),
      expiresAt: day(2),
    },
    {
      id: "park-accept-warehouse",
      operation: "credential:accept",
      summary: "Accept Bonded Warehouse Authorisation from Department of Revenue & Customs",
      requestedBy: "rinzin",
      relationId: "rel-rinzin",
      scopeVersion: 3,
      targetId: "offer-warehouse",
      targetRelyingParty: null,
      payloadHash: "sha256:38f5b2ce7a41d09628e5c3ba147f60d92b8074ae5c13f6d8",
      policy: "SINGLE_APPROVER",
      requiredSignatures: 1,
      signatures: [],
      state: "parked",
      decisionReason: null,
      createdAt: day(-3),
      expiresAt: day(4),
    },
    {
      /* Dual control, half collected. The plan folds multi-sig into B7 as a
         variant rather than building D3, and this is that variant. */
      id: "park-issue-highvalue",
      operation: "authority:issue",
      summary: "Issue Declaration authority to Pema Choden — cap Nu. 1,200,000",
      requestedBy: "dorji",
      relationId: "rel-root",
      scopeVersion: 1,
      targetId: null,
      targetRelyingParty: "Bhutan National Single Window",
      payloadHash: "sha256:7d19a4fe0c38b5217e9c460da3f8b12a4e07c1685bd93fa2",
      policy: "DUAL_CONTROL",
      requiredSignatures: 2,
      signatures: [{ personId: "dorji", at: day(-1), method: "wallet" }],
      state: "parked",
      decisionReason: null,
      createdAt: day(-1),
      expiresAt: day(3),
    },
    {
      /* Approved, then invalidated before it ran. The edge the brief calls
         out in 8.4 and the one a system would be broken to execute. */
      id: "park-stale",
      operation: "proof:present",
      summary: "Present Tax Clearance Certificate to Bank of Bhutan",
      requestedBy: "karma",
      relationId: "rel-karma",
      scopeVersion: 2,
      targetId: "vr-lapsed",
      targetRelyingParty: "Bank of Bhutan",
      payloadHash: "sha256:b61f7c05e298a4d3706b1cfe45a9d823017e5b9c4af26d10",
      policy: "DUAL_CONTROL",
      requiredSignatures: 2,
      signatures: [
        { personId: "dorji", at: day(-8), method: "wallet" },
        { personId: "sonam", at: day(-8), method: "web" },
      ],
      state: "stale",
      decisionReason: null,
      invalidatedReason:
        "Karma Wangmo's controllership was terminated after this was approved, so it was never run.",
      createdAt: day(-9),
      expiresAt: day(-2),
    },
    {
      id: "park-expired",
      operation: "credential:accept",
      summary: "Accept Warehouse Safety Certificate from Department of Labour",
      requestedBy: "rinzin",
      relationId: "rel-rinzin",
      scopeVersion: 3,
      targetId: "offer-lapsed",
      targetRelyingParty: null,
      payloadHash: "sha256:4a8e13d705b9c2f6481ade37f0b5924c6d81073be5a2fc94",
      policy: "SINGLE_APPROVER",
      requiredSignatures: 1,
      signatures: [],
      state: "expired",
      decisionReason: "Nobody decided this before it expired.",
      createdAt: day(-35),
      expiresAt: day(-28),
    },
    {
      id: "park-approved-bnsw",
      operation: "proof:present",
      summary: "Present Business Registration to Bhutan National Single Window",
      requestedBy: "rinzin",
      relationId: "rel-rinzin",
      scopeVersion: 3,
      targetId: "vr-bnsw-done",
      targetRelyingParty: "Bhutan National Single Window",
      payloadHash: "sha256:e572b0491ac8d36f7be24051c9da8317064fb2e85d1a7c63",
      policy: "SINGLE_APPROVER",
      requiredSignatures: 1,
      signatures: [{ personId: "dorji", at: day(-14), method: "wallet" }],
      state: "approved",
      decisionReason: null,
      createdAt: day(-14),
      expiresAt: day(-7),
    },
  ],

  delegatedAuthorities: [
    {
      /* The Role Act 5 revokes. Everything below it fails when it goes. */
      id: "da-role-broker",
      kind: "role",
      title: "Customs broker",
      recipientId: "pema",
      parentId: null,
      relationId: "rel-root",
      taskScopes: ["customs:declaration", "customs:amendment"],
      valueCap: null,
      counterparties: { mode: "list", values: ["Bhutan National Single Window"] },
      validFrom: day(-86),
      validUntil: day(278),
      status: "ACTIVE",
      acceptance: "accepted",
      issuedAt: day(-86),
      acceptedAt: day(-86),
    },
    {
      /* Act 4's capability. Short-lived by design — expiry is the first line
         of defence, so 90 days, not a year. */
      id: "da-cap-declaration",
      kind: "capability",
      title: "Declaration authority",
      recipientId: "pema",
      parentId: "da-role-broker",
      relationId: "rel-root",
      taskScopes: ["customs:declaration"],
      valueCap: { amount: 500000, currency: "BTN", perTransaction: true },
      counterparties: { mode: "list", values: ["Bhutan National Single Window"] },
      validFrom: day(-2),
      validUntil: day(88),
      status: "ACTIVE",
      acceptance: "accepted",
      issuedAt: day(-2),
      acceptedAt: day(-1),
    },
    {
      /* The console's "sent, awaiting acceptance" state — acceptance is the
         holder's consent and cannot be assumed. */
      id: "da-cap-payments",
      kind: "capability",
      title: "Payment release authority",
      recipientId: "sonam",
      parentId: null,
      relationId: "rel-root",
      taskScopes: ["payments:release"],
      valueCap: { amount: 250000, currency: "BTN", perTransaction: true },
      counterparties: { mode: "list", values: ["Bank of Bhutan"] },
      validFrom: day(-1),
      validUntil: day(59),
      status: "ACTIVE",
      acceptance: "sent",
      issuedAt: day(-1),
      acceptedAt: null,
    },
    {
      id: "da-cap-lapsed",
      kind: "capability",
      title: "Declaration authority (Q2)",
      recipientId: "pema",
      parentId: "da-role-broker",
      relationId: "rel-root",
      taskScopes: ["customs:declaration"],
      valueCap: { amount: 500000, currency: "BTN", perTransaction: true },
      counterparties: { mode: "list", values: ["Bhutan National Single Window"] },
      validFrom: day(-161),
      validUntil: day(-71),
      status: "EXPIRED",
      acceptance: "accepted",
      issuedAt: day(-161),
      acceptedAt: day(-161),
    },
    {
      id: "da-role-warehouse",
      kind: "role",
      title: "Warehouse supervisor",
      recipientId: "karma",
      parentId: null,
      relationId: "rel-root",
      taskScopes: ["warehouse:receipt"],
      valueCap: null,
      counterparties: { mode: "any" },
      validFrom: day(-187),
      validUntil: day(113),
      status: "REVOKED",
      acceptance: "accepted",
      issuedAt: day(-187),
      acceptedAt: day(-186),
      endedAt: day(-40),
      endedReason: "Left the company.",
      appealReference: "AP-2026-0288",
    },
  ],

  decisions: [
    {
      /* Act 5, first run. Every check passes and the chain is whole. */
      id: "dec-84120",
      outcome: "PASS",
      verifier: "Bhutan National Single Window",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "pema",
      authorityId: "da-cap-declaration",
      declarationRef: "BNSW-DEC-2026-84120",
      declarationHash: "sha256:1f6b90c4a7e2d3850b94cf17e6a02d5b83741ce90b2d6f45",
      declaredValue: { amount: 420000, currency: "BTN" },
      chain: [
        { id: "hc-foundational", label: "Business Registration", kind: "foundational", heldBy: "Pelden Trading Pvt. Ltd.", status: "valid" },
        { id: "rel-root", label: "Root authority", kind: "relation", heldBy: "Dorji Wangchuk", status: "valid" },
        { id: "da-role-broker", label: "Customs broker", kind: "role", heldBy: "Pema Choden", status: "valid" },
        { id: "da-cap-declaration", label: "Declaration authority", kind: "capability", heldBy: "Pema Choden", status: "valid" },
      ],
      checks: [
        { label: "Task in scope", detail: "customs:declaration is one of the granted tasks", outcome: "pass" },
        { label: "Value within cap", detail: "Nu. 420,000 declared against a Nu. 500,000 per-transaction cap", outcome: "pass" },
        { label: "Counterparty bound", detail: "Bhutan National Single Window matches the bound counterparty", outcome: "pass" },
        { label: "Within validity window", detail: "Valid 7 Sep 2026 – 6 Dec 2026", outcome: "pass" },
        { label: "Authority chain intact", detail: "All four links live at the time of decision", outcome: "pass" },
      ],
      reasons: [],
      decidedAt: day(-1),
      signature: "z3Kf8Qa2NmVpT7wLxB4dRc9sYhE6uJn1PkG5tZoW",
    },
    {
      /* The same capability, the same person, the same counterparty — and a
         FAIL, because a link above it was withdrawn. This pair is the demo. */
      id: "dec-84137",
      outcome: "FAIL",
      verifier: "Bhutan National Single Window",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "pema",
      authorityId: "da-cap-declaration",
      declarationRef: "BNSW-DEC-2026-84137",
      declarationHash: "sha256:8c04e71ab5d2f39607be4a1c8d5079f2361ba0e75c8d4f19",
      declaredValue: { amount: 380000, currency: "BTN" },
      chain: [
        { id: "hc-foundational", label: "Business Registration", kind: "foundational", heldBy: "Pelden Trading Pvt. Ltd.", status: "valid" },
        { id: "rel-root", label: "Root authority", kind: "relation", heldBy: "Dorji Wangchuk", status: "valid" },
        { id: "da-role-broker", label: "Customs broker", kind: "role", heldBy: "Pema Choden", status: "revoked" },
        { id: "da-cap-declaration", label: "Declaration authority", kind: "capability", heldBy: "Pema Choden", status: "valid" },
      ],
      checks: [
        { label: "Task in scope", detail: "customs:declaration is one of the granted tasks", outcome: "pass" },
        { label: "Value within cap", detail: "Nu. 380,000 declared against a Nu. 500,000 per-transaction cap", outcome: "pass" },
        { label: "Counterparty bound", detail: "Bhutan National Single Window matches the bound counterparty", outcome: "pass" },
        { label: "Within validity window", detail: "Valid 7 Sep 2026 – 6 Dec 2026", outcome: "pass" },
        { label: "Authority chain intact", detail: "Customs broker was revoked on 9 Sep 2026", outcome: "fail" },
      ],
      reasons: [
        "The Customs broker role this authority depends on was withdrawn on 9 September 2026.",
        "An authority cannot be relied on while any authority above it has been withdrawn.",
      ],
      decidedAt: day(0),
      signature: "z7Ln2Vx9BqTm4pKdW8sRc3aYhU5eJf1GoZ6tNwPi",
    },
    {
      /* Fail closed, and say so. Seeded rather than only reachable through a
         thrown error, because a state you cannot reach cannot be reviewed. */
      id: "dec-unreachable",
      outcome: "SERVICE_UNREACHABLE",
      verifier: "Bhutan National Single Window",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "pema",
      authorityId: "da-cap-declaration",
      declarationRef: "BNSW-DEC-2026-84141",
      declarationHash: "sha256:5b93d0e6c1a47f28903e5bd7a4c61f80257ed3b9418c6a02",
      declaredValue: { amount: 96000, currency: "BTN" },
      chain: [],
      checks: [],
      reasons: [
        "The Authority Verification API could not be reached, so nothing could be checked.",
        "An unverifiable authority is treated as no authority.",
      ],
      decidedAt: day(0),
      signature: "",
    },
  ],

  auditEntries: [
    {
      id: "au-8",
      seq: 8,
      operation: "authority:revoke",
      summary: "Revoked Customs broker role held by Pema Choden",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "dorji",
      relationId: "rel-root",
      scopeVersion: 1,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(0, "09:14"),
      prevHash: "sha256:0d47b1e9",
      rowHash: "sha256:6ca39f02",
    },
    {
      id: "au-7",
      seq: 7,
      operation: "authority:accept",
      summary: "Pema Choden accepted Declaration authority",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "pema",
      relationId: "rel-root",
      scopeVersion: 1,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(-1, "15:41"),
      prevHash: "sha256:93e28ac5",
      rowHash: "sha256:0d47b1e9",
    },
    {
      id: "au-6",
      seq: 6,
      operation: "authority:issue",
      summary: "Issued Declaration authority to Pema Choden — cap Nu. 500,000 per declaration",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "dorji",
      relationId: "rel-root",
      scopeVersion: 1,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(-2, "11:02"),
      prevHash: "sha256:41fb7d60",
      rowHash: "sha256:93e28ac5",
    },
    {
      /* The row that carries the whole dual-attribution point: the entity
         presented, Rinzin acted, Dorji approved, and only a digest of what
         was disclosed is kept. */
      id: "au-5",
      seq: 5,
      operation: "proof:present",
      summary: "Presented Business Registration to Bhutan National Single Window",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "rinzin",
      relationId: "rel-rinzin",
      scopeVersion: 3,
      approvedById: "dorji",
      relyingPartyDid: "did:polygon:0xc70c2d3625bec5a34d5b3746b830d36f2525f163",
      disclosedDigest: "sha256:a7f3c9e1",
      at: at(-14, "14:23"),
      prevHash: "sha256:c85a0b34",
      rowHash: "sha256:41fb7d60",
    },
    {
      id: "au-4",
      seq: 4,
      operation: "relation:terminate",
      summary: "Terminated the controllership of Karma Wangmo",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "dorji",
      relationId: "rel-karma",
      scopeVersion: 2,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(-40, "17:05"),
      prevHash: "sha256:2b6e91df",
      rowHash: "sha256:c85a0b34",
    },
    {
      id: "au-3",
      seq: 3,
      operation: "relation:accept",
      summary: "Rinzin Dema accepted the duties of a controller",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "rinzin",
      relationId: "rel-rinzin",
      scopeVersion: 3,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(-102, "10:12"),
      prevHash: "sha256:74d0af28",
      rowHash: "sha256:2b6e91df",
    },
    {
      id: "au-2",
      seq: 2,
      operation: "relation:create",
      summary: "Created a controllership relation for Rinzin Dema",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "dorji",
      relationId: "rel-rinzin",
      scopeVersion: 1,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(-104, "09:47"),
      prevHash: "sha256:1a05c7be",
      rowHash: "sha256:74d0af28",
    },
    {
      id: "au-1",
      seq: 1,
      operation: "credential:accept",
      summary: "Accepted the entity's Business Registration from the Corporate Regulatory Authority",
      entity: "Pelden Trading Pvt. Ltd.",
      actorId: "dorji",
      relationId: "rel-root",
      scopeVersion: 1,
      approvedById: null,
      relyingPartyDid: null,
      disclosedDigest: null,
      at: at(-112, "13:30"),
      prevHash: "sha256:00000000",
      rowHash: "sha256:1a05c7be",
    },
  ],

  appeals: [
    {
      /* Act 6. Notice issued, nothing submitted yet — the state the demo
         opens on, so the audience sees the recourse exists. */
      id: "ap-pema",
      reference: "AP-2026-0417",
      subjectId: "pema",
      againstKind: "authority",
      againstId: "da-role-broker",
      againstTitle: "Customs broker",
      noticeReason:
        "Withdrawn pending an internal review of declaration values submitted in August.",
      noticeIssuedAt: day(0),
      submittedAt: null,
      submission: null,
      state: "notice_issued",
      windowWorkingDays: 10,
      decisionWorkingDays: 5,
      evidence: [],
    },
    {
      /* An appeal that worked, so the upheld outcome is not hypothetical. */
      id: "ap-karma",
      reference: "AP-2026-0288",
      subjectId: "karma",
      againstKind: "authority",
      againstId: "da-role-warehouse",
      againstTitle: "Warehouse supervisor",
      noticeReason: "Withdrawn on departure from the company.",
      noticeIssuedAt: day(-40),
      submittedAt: day(-36),
      submission:
        "My last working day was 8 August, not 31 July. I had four warehouse receipts outstanding on the date the role was withdrawn.",
      state: "rejected",
      windowWorkingDays: 10,
      decisionWorkingDays: 5,
      evidence: ["handover-note-2026-08-08.pdf"],
    },
  ],

  /* Nobody is part-way through signing up when the demo starts. */
  signup: null,

  orgOnboarding: null,

  accessRequests: [
    {
      /* History: how Bank of Bhutan came to have an Entity Wallet. */
      id: "ar-bob-wallet",
      orgId: "org-bob",
      capability: "holder",
      requestedBy: "yeshey",
      requesterName: "Yeshey Choden",
      requesterEmail: "yeshey.choden@bob.bt",
      note: "We'd like the bank to hold its own registration and licences, and to present them to correspondents.",
      submittedAt: day(-74),
      state: "APPROVED",
      decidedBy: "tshering",
      decidedAt: day(-73),
      reason: null,
      invitationId: "inv-bob-wallet",
    },
    {
      id: "ar-tashicell-verify",
      orgId: "org-tashicell",
      capability: "verifier",
      requestedBy: "tashicell-owner",
      requesterName: "Pem Dorji",
      requesterEmail: "pem.dorji@tashicell.bt",
      note: "We want to check customers' citizen credentials in-store before issuing a SIM, instead of photocopying CIDs.",
      submittedAt: day(-1),
      state: "PENDING",
      decidedBy: null,
      decidedAt: null,
      reason: null,
      invitationId: null,
    },
  ],

  manualReviews: [
    {
      /* A licensed business whose licence the register could not find —
         BLMIS records for older licences are not all digitised. Waiting in
         the queue so the reviewer's screen opens with a real decision on
         it, rather than on an empty state. */
      id: "mr-yangchen",
      reference: "MR-2026-0142",
      kind: "licensed",
      legalName: "Yangchen Handicrafts",
      registrationNumber: "BL-PARO-2011-0387",
      applicantName: "Yangchen Tshomo",
      applicantCid: "•••• •••• 5190",
      registerAnswer: "The Ministry of Industry, Commerce & Employment found no licence under that number.",
      evidence: ["trade-licence-2011-scan.pdf", "renewal-receipt-2025.pdf"],
      note: "Licence issued in Paro in 2011 on paper and renewed every year since. The renewal receipt carries the same number.",
      submittedAt: day(-1),
      state: "UNDER_REVIEW",
      reviewerId: null,
      decidedAt: null,
      reason: null,
    },
    {
      id: "mr-karma",
      reference: "MR-2026-0119",
      kind: "company",
      legalName: "Karma Tours & Treks Pvt. Ltd.",
      registrationNumber: "CRA-2024-02291",
      applicantName: "Karma Lhamo",
      applicantCid: "•••• •••• 7726",
      registerAnswer: "The Corporate Regulatory Authority listed no companies for this person.",
      evidence: ["certificate-of-incorporation.pdf", "board-resolution-appointing-director.pdf"],
      note: "Appointed director in August; the register had not been updated when I applied.",
      submittedAt: day(-19),
      state: "APPROVED",
      reviewerId: "tshering",
      decidedAt: day(-17),
      reason: null,
    },
  ],

  orgInvitations: [
    {
      /* History: the invitation that set up Bank of Bhutan's Entity Wallet. */
      id: "inv-bob-wallet",
      kind: "W",
      email: "yeshey.choden@bob.bt",
      orgId: "org-bob",
      role: null,
      legalName: "Bank of Bhutan Ltd.",
      legalIdentity: "Public limited company, CRA-1997-00112",
      purpose: "Entity Wallet for an organisation already issuing and verifying on NDI.",
      needsSecondApproval: false,
      invitedBy: "tshering",
      approvedBy: null,
      createdAt: day(-73),
      sentAt: day(-73),
      expiresAt: day(-43),
      state: "ACCEPTED",
      delivery: "delivered",
      decidedAt: day(-70),
      acceptedName: "Yeshey Choden",
    },
    {
      /* History, not a demo step: how Ugyen came to be a member at all.
         Membership came first and authority separately, later — which is
         exactly the order act 2 then shows (Flow 1 design §7.4). */
      id: "inv-ugyen",
      kind: "M",
      email: "ugyen.phuntsho@peldentrading.bt",
      orgId: "org-pelden",
      role: "Member",
      legalName: null,
      legalIdentity: null,
      purpose: null,
      needsSecondApproval: false,
      invitedBy: "dorji",
      approvedBy: null,
      createdAt: day(-44),
      sentAt: day(-44),
      expiresAt: day(-30),
      state: "ACCEPTED",
      delivery: "delivered",
      decidedAt: day(-43),
      acceptedName: "Ugyen Phuntsho",
    },
    {
      /* Seeded so the pending list opens with the one failure it exists to
         surface (E8): delivery is asynchronous, and this list is the only
         place a bounced invitation is ever visible to the person who sent
         it. */
      id: "inv-tashi",
      kind: "M",
      email: "tashi.dema@pelden-trading.bt",
      orgId: "org-pelden",
      role: "Member",
      legalName: null,
      legalIdentity: null,
      purpose: null,
      needsSecondApproval: false,
      invitedBy: "dorji",
      approvedBy: null,
      createdAt: day(-2),
      sentAt: day(-2),
      expiresAt: day(12),
      state: "PENDING",
      delivery: "failed",
      decidedAt: null,
      acceptedName: null,
    },
    {
      /* The Corporate Regulatory Authority's own designation, months ago —
         the root of trust every company on the platform chains back to. It
         took two administrators, and the record says which two. */
      id: "inv-cra",
      kind: "O",
      email: "registrar@cra.gov.bt",
      orgId: null,
      role: null,
      legalName: "Corporate Regulatory Authority",
      legalIdentity: "Statutory authority · Registrar of Companies",
      purpose: "Foundational issuer for companies — issues the Business Registration every company chains back to.",
      needsSecondApproval: true,
      invitedBy: "tshering",
      /* Root as the second administrator — S2 allows it, and the story has
         one platform admin, not two. */
      approvedBy: "root",
      createdAt: day(-128),
      sentAt: day(-127),
      expiresAt: day(-97),
      state: "ACCEPTED",
      delivery: "delivered",
      decidedAt: day(-125),
      acceptedName: "Office of the Registrar",
    },
  ],

  firstRun: false,

  harness: {
    persona: "dorji",
    act: 0,
    runnerOpen: false,
    stateOverrides: {},
    selfServiceSignup: SELF_SERVICE_SIGNUP_ENABLED,
    guideStep: null,
  },
};

/**
 * Pelden Trading on the day it is registered — what completing Flow 2 leaves
 * behind, in place of the months of history the story's seed carries.
 *
 * WHY ONBOARDING DOES NOT LAND ON THE SEED
 *
 * The seed is Pelden three months in: Rinzin appointed, credentials held,
 * approvals parked, an authority issued to Pema and revoked. Arriving at that
 * dashboard straight from registering the company told the room the opposite
 * of what act 1 says — that an organisation which existed thirty seconds ago
 * already had a past. A first-run console is empty except for the two things
 * onboarding actually produced: the registration it accepted, and Dorji's
 * root authority to act for it.
 *
 * WHAT IS KEPT, AND WHY
 *
 * - The foundational credential and the root relation, dated today.
 * - The organisation's own DID, because provisioning its wallet made it.
 * - Two audit rows for the registration and the acceptance. The dashboard
 *   shows no activity — nothing has been done in the console — but an audit
 *   trail that did not record the organisation coming into existence would
 *   be a trail with a hole at the top.
 * - Everything on the NDI side (invitations NDI issued, review cases).
 *
 * WHAT IS NOT KEPT: PELDEN'S PEOPLE
 *
 * The seed's Pelden has eight people attached — its staff, a clearing agent,
 * someone who has left. The first version emptied their roles but kept them
 * attached to the organisation and kept their accounts, so on a company that
 * existed a minute ago the controllership picker already listed six
 * colleagues "Identity confirmed", and the persona switcher offered to drive
 * as any of them. Nobody could say how they got there, because they hadn't.
 * On the first day Pelden has one member, Dorji, and the rest of the story's
 * people have no account at all — they arrive the way anyone does, by an
 * invitation Dorji sends and they accept (FLOW-ONB-02 Kind M).
 *
 * Acts 2–6 need the lived-in state, so the story runner restores it when it
 * jumps past act 1 (see `restoreStoryState` in the store).
 */
export function firstRunState(s: DemoState): DemoState {
  const today = day(0);
  const foundational = SEED.heldCredentials.filter(inOrg(PELDEN)).find((c) => c.isFoundational);
  const root = SEED.relations.filter(inOrg(PELDEN)).find((r) => r.isRootAuthority);
  const entity = SEED.organizations.find((o) => o.id === PELDEN)!;
  return {
    ...s,
    activeOrgId: entity.id,
    /* Other organisations are untouched — Bank of Bhutan's day is not
       Pelden's first one. The issuer/verifier collections (schemas,
       credentials issued…) stay for the same reason: they are the issuers',
       and Pelden, a holder only, never sees them. */
    organizations: [
      { ...entity, memberIds: ["dorji"], members: 1, createdAt: today },
      ...s.organizations.filter((o) => o.id !== PELDEN),
    ],
    activity: [],
    /* Nobody but Dorji is a member yet, and nobody else from Pelden's side of
       the story has an account: they come on by invitation. The platform's
       own people keep whatever the story has given them — an admin root
       invited stays one — and so does anyone who belongs to another
       organisation (Bank of Bhutan's owner). */
    people: s.people.map((p) =>
      p.id === "dorji"
        ? {
            ...p,
            memberRole: "Owner",
            hasAccount: true,
            /* The account that did the onboarding is Dorji's: its address and
               the name it was given, not the seed's, so the console greets
               whoever the room watched sign up. */
            ...(s.signup?.stage === "done"
              ? { email: s.signup.email || p.email, name: s.signup.name || p.name }
              : {}),
          }
        : isPlatformAdmin(p) ||
            !(entity.memberIds.includes(p.id) || p.joinedBy) ||
            s.organizations.some((o) => o.id !== PELDEN && o.memberIds.includes(p.id))
          ? p
          : { ...p, memberRole: undefined, hasAccount: false },
    ),
    relations: [
      ...s.relations.filter((r) => !inOrg(PELDEN)(r)),
      ...(root
      ? [
          {
            ...root,
            scope: { ...root.scope, validFrom: today },
            createdAt: today,
            acceptedAt: today,
            activatedAt: today,
          },
        ]
      : []),
    ],
    heldCredentials: [
      ...s.heldCredentials.filter((c) => !inOrg(PELDEN)(c)),
      ...(foundational ? [{ ...foundational, receivedAt: today }] : []),
    ],
    offers: s.offers.filter((o) => !inOrg(PELDEN)(o)),
    verificationRequests: s.verificationRequests.filter((v) => !inOrg(PELDEN)(v)),
    parkedOperations: [],
    delegatedAuthorities: [],
    decisions: [],
    auditEntries: [
      {
        id: "au-onb-2",
        seq: 2,
        operation: "credential:accept",
        summary: "Accepted Business Registration under the bootstrap authority",
        entity: entity.name,
        actorId: "dorji",
        relationId: root?.id ?? null,
        scopeVersion: 1,
        approvedById: null,
        relyingPartyDid: null,
        disclosedDigest: null,
        at: new Date().toISOString(),
        prevHash: "sha256:9b2e07c4",
        rowHash: "sha256:3f81d6a0",
      },
      {
        id: "au-onb-1",
        seq: 1,
        operation: "entity:register",
        summary: "Registered, confirmed by the register — Dorji Wangchuk as director",
        entity: entity.name,
        actorId: "dorji",
        relationId: null,
        scopeVersion: null,
        approvedById: null,
        relyingPartyDid: null,
        disclosedDigest: null,
        at: new Date().toISOString(),
        prevHash: "sha256:00000000",
        rowHash: "sha256:9b2e07c4",
      },
    ],
    appeals: [],
    /* Only what NDI issued: an organisation that exists today has sent no
       member invitations. */
    orgInvitations: s.orgInvitations.filter((i) => i.kind !== "M"),
    firstRun: true,
  };
}

/**
 * The Entity Wallet's day zero — the state the guided demo starts from.
 *
 * WHY THE STORY STARTS BEFORE ANY BUSINESS
 *
 * Nobody can bring an organisation onto the Entity Wallet until NDI has
 * people to review it, and NDI has none until its root administrator has
 * invited them. So the platform is shown being set up first: root signs in
 * (seeded by the deployment, never onboarded), invites a platform admin, and
 * only then does any organisation get on — Bank of Bhutan by invitation,
 * Pelden by signing up.
 *
 * WHAT ALREADY EXISTS ON DAY ZERO
 *
 * The NDI platform itself is not new. Bank of Bhutan and Tashi InfoComm
 * have issued and verified on it for years, so they are here — without an
 * Entity Wallet. Everyone else is known to the story but has no account:
 * `hasAccount: false` keeps them out of the persona switcher until they
 * sign up or accept an invitation. Pelden does not exist yet.
 */
export function dayZeroState(seed: DemoState): DemoState {
  const existing = seed.organizations
    .filter((o) => o.id !== PELDEN)
    .map((o) => ({ ...o, capabilities: o.capabilities.filter((c) => c !== "holder") }))
    /* NDI's organisation has only root until root invites someone. */
    .map((o) => (o.id === NDI_ORG ? { ...o, memberIds: ["root"], members: 1 } : o));
  return {
    ...seed,
    activeOrgId: "org-bob",
    organizations: existing,
    activity: [],
    /* Yeshey has had an account since the bank came onto NDI; root since the
       platform was deployed. Nobody else has one yet. */
    people: seed.people.map((p) =>
      p.id === "yeshey" || p.platformRole === "root"
        ? p
        : { ...p, hasAccount: false, memberRole: undefined, platformRole: undefined },
    ),
    relations: [],
    heldCredentials: [],
    offers: [],
    verificationRequests: [],
    parkedOperations: [],
    delegatedAuthorities: [],
    decisions: [],
    auditEntries: [],
    appeals: [],
    signup: null,
    orgInvitations: [],
    orgOnboarding: null,
    manualReviews: [],
    /* Nothing waiting. It used to hold one request so the new admin's queue
       was not only the one the story was about to send — but a request
       sitting in a queue on a platform nobody administers yet read as
       history the day-zero platform cannot have, and the guide no longer
       walks the requests queue at all. */
    accessRequests: [],
    firstRun: true,
    harness: { ...seed.harness, persona: "yeshey" },
  };
}

/**
 * Day zero, one chapter on: root has invited Kinzang Dorji and Kinzang has
 * set up as a platform admin. The state the guided demo reaches when the
 * platform-admin chapter ends — so a company's onboarding walked on its own
 * starts on the same platform the guide reaches, with someone to review a
 * case the register cannot match, and no business on it yet.
 *
 * WHY NOT THE LIVED-IN STORY
 *
 * The company walks used to start from the seed's three-months-in state,
 * because that was the only one with an administrator in it. It also came
 * with every character already holding an account, so the persona switcher
 * offered Pelden's staff before Pelden had been registered — the "people
 * already there" a first-time walk must not show.
 */
export function platformReadyState(seed: DemoState): DemoState {
  const zero = dayZeroState(seed);
  const admin = "tshering";
  const invitedAt = day(-1);
  return {
    ...zero,
    organizations: zero.organizations.map((o) =>
      o.id === NDI_ORG ? { ...o, memberIds: ["root", admin], members: 2 } : o,
    ),
    people: zero.people.map((p) =>
      p.id === admin ? { ...p, platformRole: "admin" as const, hasAccount: true } : p,
    ),
    orgInvitations: [
      {
        id: "inv-kinzang",
        kind: "A",
        email: seed.people.find((p) => p.id === admin)?.email ?? "kinzang.dorji@bhutanndi.bt",
        orgId: null,
        role: null,
        legalName: null,
        legalIdentity: null,
        purpose: "Platform administrator",
        needsSecondApproval: false,
        invitedBy: "root",
        approvedBy: null,
        createdAt: invitedAt,
        sentAt: invitedAt,
        expiresAt: day(29),
        state: "ACCEPTED",
        delivery: "delivered",
        decidedAt: invitedAt,
        acceptedName: seed.people.find((p) => p.id === admin)?.name ?? "Kinzang Dorji",
      },
    ],
    activeOrgId: NDI_ORG,
    harness: { ...zero.harness, persona: "root" },
  };
}

