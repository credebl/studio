# Running the demo

How to drive the Entity Wallet demo in front of people. Written for whoever is
presenting, not for whoever is building.

---

## The easiest way: the guided demo

Press **Guided demo** — the green button at the bottom-left of every screen.
It resets the demo and walks the whole story, one step at a time, in a panel
on the right: what is happening on this screen, exactly what to press, and
sometimes a line worth saying. You do the clicking; the guide keeps up, and
switches you to the right person when the story changes hands. **Next** and
**Back** move between steps (and take you to the right screen), **Take me
there** brings you back if you wander off, and the chevron minimises it.

**This branch is Flow 1 — how people get onto the platform** — and the guide
walks exactly that: five chapters, 12 steps, starting on the platform's day
zero:

1. **Root admin onboarding** — NDI's root administrator, Anand Acharya, signs
   in. The account and Bhutan NDI's organisation were made when the platform
   was deployed, so there is no sign-up and nothing to onboard; root lands in
   NDI's organisation with the whole Studio.
2. **Platform admin onboarding** — root invites Kinzang Dorji by typing
   the address `kinzang.dorji@bhutanndi.bt`. Kinzang opens the invitation and
   sets up the account there — name, password and the password again to
   confirm, no separate sign-up — and lands as a platform admin.
   Until an admin exists, adding an organisation is closed, and says why.
3. **A new company signs up** — Dorji, Pelden Trading's director, creates a
   personal account. Just the person: it ends on an account that belongs to
   no organisation and says plainly that it can do nothing yet.
4. **Where to go next.**

The guide stops at the empty account because that is where Flow 1 ends
(FLOW-ONB-01 Q3). Registering the company is Flow 2, and inviting Pelden's
colleagues needs Pelden to exist, so both arrive with the
`prototype/flow-02-entity-onboarding` branch. **Add your organisation** on the
empty account still leads somewhere — the earlier version of the register
screens — but the guide and the demo controls do not walk it here, and the
Flow 2 walkthroughs further down describe the Flow 2 branch.

---

## Before you start

```bash
npm install      # first time only
npm run dev      # http://localhost:3000
```

Two things to do in the room before you say anything:

1. **Open the demo controls** — bottom-left of the window, the small
   `Prototype · data simulated` chip with a **Demo controls** button beside it.
   That panel is your remote: the guided demo, the four onboarding flows
   (root admin, platform admin, new company, member), who you are signed in
   as, and reset. Each flow starts from the state it needs — day zero, the
   platform with one admin, or Pelden's first day — never from whatever the
   last person left. Each screen's states are folded under **For reviewers**.
2. **Press Reset demo** if anyone has touched it before you. The demo persists
   to browser storage, so it remembers whatever the last person did. Reset —
   like a browser that has never run the demo — opens the platform's **day
   zero**: root's account and NDI's organisation, the organisations already on
   NDI, and nothing else. No business, no colleagues, no history.

**Leave the prototype chip visible, and know that it is a link.** It goes to
**/whats-real**, a page listing exactly which parts are simulated and what
would have to be built for each. That chip is the one thing standing between
this demo and somebody concluding the register integration exists. Read the
page once before you present, and send people the link afterwards rather than
paraphrasing it — the question usually arrives by email, from somebody who was
not in the room.

---

## The one-sentence framing

Open with this, before any screen:

> Bhutan NDI already lets an organisation **issue** and **verify** credentials.
> This adds the third thing: an organisation can **hold** them — and can let
> named people act for it, within limits it sets and can withdraw.

If you only get one idea across, that is the one.

---

## What is built right now

**All six acts are built**, though only onboarding is in the prototype's
current focus. The acts beyond it need the story three months on —
controllers appointed, approvals parked, an authority to revoke — which is no
longer what the demo opens on. To show them: Demo controls → **For
reviewers** → **Beyond onboarding: open the story three months on**. That
puts you on Pelden's lived-in dashboard as Dorji; the act walkthroughs below
start from there (the act buttons they mention were the old story runner,
since removed — go to the route each one names).

| Act | What the audience learns | Roughly |
|---|---|---|
| 1 · The entity becomes real | The platform never asserts the entity's identity — a register does | 5 min |
| 2 · Authority is granted, narrowly | Authority is a scoped, accepted relation, not a role dropdown | 6 min |
| 3 · The Controller works, under approval | Least disclosure, an approval gate, dual attribution | 6 min |
| 4 · Authority is delegated to a wallet | Constraints that travel with the credential | 3 min |
| 5 · Authority is checked at the point of use | PASS, then FAIL with the failing link named | 4 min |
| 6 · There is recourse | Revocation carries a reason and an appeal | 3 min |

**The full run is about 25 minutes.** If you have ten, show acts 2 and 5. If
you have five, show act 5 alone.

---

## The Act 1 walkthrough

**Walk a flow → Register the company**, as Dorji. Five minutes, and it is the
act that establishes the product is not self-certifying.

### 1 · What kind of organisation — `/onboarding`

Each kind names *which register* confirms it. Civil society organisations are
marked **Reviewed by NDI**: no register can answer for them yet, so a person
at NDI checks instead.

> "Which register can vouch for you depends on what kind of thing you are.
> That is a governance input still being decided, so it is a property of the
> kind rather than hard-coded. And notice what we don't ask: no name, no
> registration number. You don't claim a company here by knowing its number."

Leave **Private or public limited company** selected and press **Continue to
prove who you are**.

### 2 · Prove who you are — `/onboarding/prove`

The scan card is the NDI integration page people already know from other
services — the framed code with the NDI mark, the two steps, the store badges
and the support line. There is no "open wallet" link and no cloud wallet: this
is a desk portal, so the only hand-off is a scan. The code does not scan (it
says so under it), so press **Simulate the scan** in the dashed prototype
panel. Point at **What you will share** first: the person's name and
citizenship number, and nothing about any organisation.

> "Only the person, not yet the company. Who Dorji is comes from his own
> wallet — never from a field someone typed."

If someone asks *"what if his accountant signed up for him?"*, go back and
press **Show what happens if someone else's wallet answers**. The proof comes
back for a different person and nothing is registered. That is where proxy
sign-up is caught.

### 3 · The register lists, Dorji chooses — `/onboarding/choose`

The lookup starts on its own. **This is the one wait in the demo that is not
compressed.** Let it run.

> "Every other wait here is about two seconds. This one is not, deliberately.
> This is the moment the platform admits it cannot assert a company's
> identity by itself, and asks the Corporate Regulatory Authority which
> companies it lists Dorji against. If that resolved instantly, the most
> important architectural fact about the whole product would slide straight
> past you."

Two organisations come back. Point at the second:

> "Druk Valley Hardware is already on the platform — another director added
> it. So it can't be chosen. Registering a company twice is exactly the defect
> we're designing out; the way in for a second director is an invitation from
> the first."

Leave **Pelden Trading** chosen and press **Add Pelden Trading Pvt. Ltd.**
Two named stages follow: the register confirms the pair Dorji chose, and the
organisation's wallet is set up with keys nobody is given a copy of.

**If asked "what if the register doesn't have you?"** — see the manual review
walk below. It is a review, not a dead end.

### 4 · The milestone — `/onboarding/foundational`

Point at **Why this one is different**:

> "Accepting a credential normally needs an authority saying you may. Nobody
> has one yet — the company came into existence thirty seconds ago. So this
> one acceptance happens under a bootstrap authority made for exactly this,
> and nothing else can be accepted under it."

Press **Accept the registration**.

> "*Pelden Trading is verified.* And this credential is the thing act five
> walks back up to. Remember it."

**Go to the console** lands on Pelden's first day: *Welcome, Dorji*, a
**Start here** panel, nothing waiting, no activity. It holds its registration
and Dorji's root authority and nothing else — the organisation existed thirty
seconds ago, so the console says so. The audit trail has exactly two rows:
the registration and the acceptance.

> "Nothing has happened here yet, and the console doesn't pretend otherwise."

Pressing **Next** to act 2 moves the story on to Pelden three months in —
Rinzin appointed, credentials held, an authority issued to Pema. Say so out
loud: *"Let's skip ahead a few months."* Your account and anything you did in
the onboarding flows are kept.

---

## The Gate 2 walkthroughs — Flows 1 and 2

For the Gate 2 review. On this branch Demo controls → **Walk a flow** offers
the three Flow 1 onboardings — **Root signs in**, **Root invites a platform
admin** and **Create an account** — each on its first screen as the right
person, from a known starting state: the root and admin flows on day zero,
the company flow on the platform with one admin (Kinzang) and no business.
**Register the company** and **Invite a member** arrive with the Flow 2
branch; their walkthroughs below are kept so the document does not have to
be rewritten when it lands. The other walkthroughs below are still built but not in the controls:
switch person with **Driving as** and go to the route named in the heading.

### FLOW-ONB-02 · Root invites a platform admin — `/sign-in`

Starts on the platform's day zero. Sign in as **Anand Acharya** (the dashed
panel fills the address; any password), type an address on **Platform
admins** and **Send invitation**, then open it as the invitee: they set up
their account on the invitation itself — name, password and confirmation — and land as a
platform admin.

### FLOW-ONB-01 · Create an account — `/sign-up`

1. Enter an email address. Point at the warning that the
   account must belong to the person who will prove their identity later —
   sign-up cannot tell a director from their accountant, and step 2 of Flow 2
   is where that is enforced.
2. **Check your email.** No email is sent. The dashed **Prototype** panel says
   so, and **Open the link from the email** stands in for the inbox. Resend
   is limited to five sends an hour, with a cooldown between them.
3. **Your name and a password**, against a policy shown up front rather than
   after a failure, typed twice — whether the two match is shown as you type.
4. **Welcome** lists the account's organisations — none yet — and **Add an
   organisation** leads into Flow 2. Run Flow 2 from here and the account
   comes back to this list with Pelden Trading on it, as Owner.

### FLOW-ONB-02 · An owner invites a member — as Dorji, `/members`

**Walk a flow → Invite a member** starts on Pelden's first day, with Dorji
its only member.

1. **Members** lists Dorji alone. Press **Invite someone**.
2. Enter an address — `ugyen.phuntsho@peldentrading.bt` — and a role. Beside
   the form, *What this invitation does* says, before anything is sent, what
   it gives and — just as plainly — that it does not let them act for Pelden.
   **Send invitation**: the form is replaced by the confirmation (14 days, it
   gives nothing until accepted) with **Open the invitation as …** in a
   dashed panel standing in for the invitee's inbox.
3. The invitation names Dorji and Pelden, what it lets the invitee do and
   what it does not, and when it expires. With no account at that address,
   the invitee **sets one up right there** — name, password, the password
   again — and **Set up account and accept** does both. This follows the
   platform admin's invitation, not FLOW-ONB-02 A1's detour through sign-up:
   the link already proves the address, so the four sign-up screens re-proved
   it. The spec's version is kept as the **no_account** state for comparison.
4. **You've joined Pelden Trading** names the organisation — a person can
   belong to several — and **Go to Pelden Trading Pvt. Ltd.** opens its console as the
   new member: a dashboard and a wallet, no Members, no Controllership, and
   *What you may do* says they can see its information and nothing on its
   behalf yet.
5. Back as Dorji, **Members** lists them — identity *not yet confirmed*
   (joining never asks the register), authority *none — membership only* —
   and the dashboard's activity shows who joined. **Controllership → New
   relation** now offers them, and says why they cannot be appointed yet:
   confirming who they are is part of controller appointment, the next flow.

Invite a second colleague at an address the story does not know and they get
a record of their own — the persona switcher and the sign-in panel list them
after they accept. Inviting an address that is already a member, or already
has an invitation waiting, is refused with the reason (E3).

State switcher on the invitation shows **setup**, **no_account** (the spec's
sign-up detour), **expired**, **revoked**, **void** (the inviter lost their
authority since sending — worded as a lapse, never a rejection),
**already_accepted**, **declined** and **wrong_person**.

### Also built · Inviting an agency — as Kinzang, `/admin/invitations/new`

Not in **Walk a flow**: bringing on a foundational issuer is Flow 5, which the
catalogue has not designed yet. It is still reachable from NDI administration
→ Invitations, and needs two NDI administrators.

1. As Kinzang, propose the agency. It waits in **Approvals**.
2. Still as Kinzang, open **Approvals**: **Approve** is disabled with the
   reason in its place — *you issued this, so a different administrator must
   approve it*. Not enabled and then refused.
3. Switch to **Anand Acharya** and approve — root counts as the second
   administrator (FLOW-ONB-02 S2), so the story needs no second platform
   admin. The invitation is sent. The seeded Corporate Regulatory Authority
   invitation shows the finished version.

### Flow 2 · Two ways onto the platform

Which one applies is a deployment setting — self-service sign-up on or off
(FLOW-ONB-01 P3). The controls keep it on — the focus is self-service; the
invited route below is kept for reference. Both routes end in the same check: the
register confirms the person represents the organisation.

**Sign up and add it yourself** (self-service on) is act 1 above: the register
lists the organisations it has against the person, and they choose one.

**NDI invites a business** (self-service off), as Kinzang:

1. On the invitation form choose **To register as an ordinary business**. The
   form fills with Pelden's details. No second administrator is needed —
   the second approval follows what is being granted, and an ordinary
   business is not a root of trust. **Send invitation**.
2. **Invitations → Open as the invitee** (dashed — stands in for the email).
   The invitation says plainly that it doesn't confirm Pelden by itself.
3. **Create an account** — allowed even with self-service off, because the
   invitation opened that door. Finish sign-up and you are brought back;
   **Accept**.
4. **Register the organisation** → prove who you are → the register is asked
   the narrower question: *does it list this person against the organisation
   the invitation names?* No list to choose from. Then the registration, and
   back to the account's organisations with Pelden on it.

If the register does not list them for the named organisation, it falls to
manual review exactly as the self-service route does.

With self-service off, the public **Create an account** page shows its
switched-off state — try it to show the open door is shut.

### Flow 2 · When the register can't match — manual review

1. **Walk a flow → Register the company**. Prove who you are, and while the
   register is being asked, press **Show what happens if the register lists
   nothing**.
2. **Ask NDI to review it.** The form starts empty — type
   `Pelden Trading Pvt. Ltd.` and `CRA-2019-04477` — attach any file (only
   the file name is kept) and **Send for review**. The applicant gets a
   reference, sees what the register said, and is told plainly that the
   organisation holds nothing until it is approved.
3. As **Kinzang** (the platform admin this walk starts with), open
   `/admin/reviews`. The register's answer sits at the top of every case, and
   the applicant's identity is marked as proved from their wallet. **Refuse**
   cannot be confirmed without a reason, because the applicant is shown it.
4. Approve Pelden's case, then open `/onboarding/review` again: approved, by
   Kinzang, by name. **Receive its registration** continues to the milestone —
   offered by NDI after its review rather than by the register, which never
   confirmed the pair.

For a **refusal**, refuse with a reason instead: the applicant sees it and
**Send it again with more** reopens the form with what they sent before.

For a **civil society organisation**, pick that kind on the first screen:
there is no register to ask, so the flow goes straight from the proof to the
review form.

---

## The Act 6 walkthrough

Three minutes, and it is the act that makes everything else defensible. Best
shown **straight after act 5**, while the revocation is fresh.

Switch to **Pema** and open **Appeals**.

> "She has just lost her role. Here is the notice, with the reason Dorji
> actually typed, and a reference. She did not have to go looking for it."

Type an answer in the box and press **Submit the appeal**.

> "Ten working days to appeal, five for a decision. Those numbers are
> provisional until the governance framework settles them, which is why they
> are text on a screen rather than a graphic anyone has to redraw."

Switch to **Dorji** and open **Appeals** again.

> "Same object, different actions. He can uphold or reject. Pema was never
> shown an uphold button and Dorji was never shown a submission form."

Press **Uphold and reinstate**.

> "That puts the role back exactly as it was. An appeal process that concluded
> in someone's favour and left the authority revoked would be a complaints
> box, not a remedy."

**Then go back to `/verifier/bnsw` and submit the declaration again. It
passes.** The chain is whole because the link was restored.

---

## The Act 2 walkthrough

Roughly six minutes. The story: Pelden Trading gives its new warehouse
manager a narrow, specific authority, and he has to accept it before it means
anything.

### 1 · Set up

Demo controls → act button **2**. That puts you on
`/controllership/relations/new` as **Dorji Wangchuk**, a director of the company.

> "Dorji runs Pelden Trading, a trading company that imports and wholesales.
> He has just hired a warehouse manager, Ugyen, who needs to be able to accept
> credentials on the company's behalf. Not to *be* the company — to act for
> it."

### 2 · Establish the controllership — `/controllership/relations/new`

Pick **Ugyen Phuntsho**, the warehouse manager — he holds nothing yet, which
is why he is the one to watch an authority being built for. Choose **Entity
consent**. Attach any file (the filename is all that is kept) and type a
reference like `PT/BR/2026/014`.

> Rinzin is not in this list, deliberately: she already holds a controllership,
> and a second one for the same person would leave two answers to "what may she
> do". Hers is seeded active so act 3 can be shown on its own.

Two things worth pointing at here:

- **Tenzin Norbu is in the list but cannot be chosen.** His identity has not
  been confirmed against the register.
  > "You cannot grant authority to someone whose identity nobody has
  > established. That is not a form validation — it is the foundation the
  > whole model sits on."
- **The instrument.** Only a fingerprint and a reference are stored.
  > "The signed board resolution stays in the company's own records. The
  > platform keeps proof it existed, not the document."

Press **Continue to scope**.

### 3 · The scope builder — the screen that matters most

This is the one to slow down on. Everything is off. Say so:

> "Nothing is granted until it is checked. He starts with no authority at all."

Now build the grant, narrating as the right-hand panel rewrites itself:

1. Check **Accept offers** → choose **Only these** → pick **Bonded Warehouse
   Authorisation** and **Warehouse Safety Certificate**. Leave approval on
   **Automatic**.
2. Check **Present proofs** → **Only these** credential types → **Business
   Registration**. Then relying parties → **Only these** → **Bank of Bhutan**
   and **Bhutan National Single Window**. Leave approval on **One approver**.
3. Set an end date about a year out.

**The point of the screen is the right-hand panel.** Read one of its sentences
out loud:

> "Ugyen Phuntsho may present proofs using Business Registration credentials
> to Bank of Bhutan and Bhutan National Single Window only, until 31 Dec 2027.
> Every presentation needs one approver."

> "That sentence is the product. Everything else here is a way of writing it.
> If a director cannot check that sentence in five seconds, we have failed —
> and no amount of good table design fixes it."

**If you want the "worth a second look" warnings to appear**, widen something:
set Present proofs to **Any relying party**, or tick **No end date**. The panel
starts advising against it. Then undo it.

> "It advises. It does not block. Deciding what is permissible is the server's
> job, and a UI that pretended otherwise would be teaching the wrong thing
> about where authority actually lives."

Press **Send for acceptance**.

### 4 · The hand-off — acceptance

You will land on a panel saying it has gone to Ugyen. Click **Open what Ugyen
will see** (the button carries whoever you picked).

**You will see a notice saying you are still signed in as Dorji, and that only
Ugyen can accept.** Do not skip past this — it is the moment the story turns:

> "Dorji cannot accept on Ugyen's behalf. If an owner could, the acceptance record
> would be worth nothing, and that record is the whole point."

Click **Continue as Ugyen**. Everything on the page switches to the second
person.

Now walk the acceptance screen top to bottom:

- **The authority is first, and in full.** Before any duty, before any button.
  > "He is not agreeing to terms. He is reading exactly what he is being given,
  > in the same sentences Dorji just wrote."
- **Where it comes from** — the legal basis and the instrument.
- **What he takes on** — five duties, in plain words. No statute numbers
  anywhere.
  > "These are duties in law. The Act is why they are there, but a person
  > deciding whether to take on a responsibility needs to know what it is, not
  > which section it came from."
- **Decline is the same size as accept.**
  > "If declining were a grey link, the acceptance would not mean anything."

Press **Accept these duties**.

### 5 · Close the loop — `/wallet/authority`

Click **See what I may do**.

> "This is Ugyen's own view. Same sentences. And notice what is not here —
> there is no edit button, not even a disabled one. He can see his authority
> and he can ask for it to be changed. He can never change it himself."

Scroll to **What I have done**.

> "Every action recorded against him is recorded against the company too.
> Never one without the other."

That is Act 2. Stop there.

---

## The Act 3 walkthrough

About six minutes, as **Rinzin**. The story: an ordinary working day, and the
approval gate doing its job.

### 1 · The landing screen — act button **3**

You arrive at `/dashboard` as Rinzin.

> "This is what a controller sees on signing in. Not a chart — a list of what
> is waiting. And on the right, a reminder of exactly what she is allowed to
> do, every single time, so she never has to discover her own limits from a
> refusal."

Point at the ordering:

> "Approvals first, because somebody else is blocked until they are decided.
> Then relying parties who are waiting. Then offers, which nobody is waiting
> on. Sorted by expiry, a lapsing offer would sit above a colleague."

Note that **Rinzin has no Approvals item in the sidebar** — her authority does
not include deciding approvals.

### 2 · Accept an offer — the holder inbox

Click the **Business Licence** offer.

> "Here is the thing the studio could never do before. Pelden Trading is
> the *holder*. Somebody has offered the company a credential."

Two things to point at:

- **Every attribute in full**, before any button.
  > "She is accepting these values. A screen that said 'Business Licence,
  > 4 attributes' would be asking her to accept something she had not seen. And
  > this is read from the offer itself, not from anything anyone typed."
- **The issuer's trust-registry status.**

Press **Accept**. Then follow **See what we hold** — note the **Root of trust**
panel, held apart from the table:

> "The Business Registration is not one credential among several. It is the
> root everything else chains back to, including everything the company has
> delegated. Burying it in a row between a tax certificate and an insurance
> policy would misstate what it is."

### 3 · The refusal — worth showing deliberately

Go to **Offers** and open **Fleet Insurance Certificate**.

> "This is a normal event, not an error. Her authority covers Business
> Registration and Business Licence. Insurance was not granted."

Point at the only action available:

> "One next step, and it routes to the owner. There is deliberately no way for
> her to widen her own authority from here — this is exactly the moment
> somebody would reach for that, and it must not exist."

### 4 · Least disclosure — `Bank of Bhutan is asking for a proof`

Back to the dashboard, open the **Bank of Bhutan** request.

**This is the screen to slow down on.** The bank asked for five attributes.
Two are ticked.

> "The bank asked for five. Only two are actually needed, and those are the
> only two ticked. Least disclosure is not a warning here — it is the state
> the screen opens in. She has to consciously add anything else."

Tick **registered_address**. A note appears saying she is going beyond what is
needed.

> "Worth having a reason you could give out loud."

Untick it. Point at the counter — **Disclosing 2 of 5 requested** — then press
**Send for approval**.

> "Her authority lets her present to the bank, but not without an approver.
> So nothing goes out."

### 5 · The approval — switch to Dorji

Switch persona to **Dorji Wangchuk** and open **Approvals**.

> "Now the gate. Note that Rinzin never saw this queue — she cannot approve her
> own work."

Open the presentation. Three things to show:

- **The attributes, struck through where withheld.**
  > "He is approving the disclosure, not the request. If he only saw 'present
  > to Bank of Bhutan' he would not know what was going out."
- **The fingerprint** — "what you would sign".
  > "That covers this exact operation. Signing it from his phone commits him to
  > this and nothing else. If any detail changed, the fingerprint changes."
- **The authority it was done under**, with the scope version.

Press **Approve and sign from wallet**. After the hand-off, the presentation
goes out.

### 6 · The record — `Controllership → Audit`

> "Pelden Trading, acted by Rinzin Dema, approved by Dorji Wangchuk. Three
> questions an investigation actually asks — on whose behalf, by whose hand, on
> whose authority — and no single-name log can answer any of them."

Point at the disclosed line:

> "A fingerprint of what went out. Not the values. An audit trail that stored
> what it was protecting would be a second copy of the company's data with a
> longer retention period than the original."

### Other things on this loop worth a look

| Where | What it shows |
|---|---|
| `/approvals/park-stale` | Approved, then invalidated before it ran |
| `/approvals` → the dual-control card | 1 of 2 signatures, needing a different person |
| `/wallet/verification-requests/vr-druk` | In scope by credential type, refused by counterparty |
| `/dashboard` → **access_suspended** state | A controller whose authority was pulled mid-session |

---

## The Acts 4 and 5 walkthrough

About seven minutes, and the part worth rehearsing. **This is the strongest
thing in the demo** — if you are short on time, cut Act 2 and show this.

### 1 · Issue the authority — act button **4**

You land on `/delegated-authority/new` as Dorji. The form is prefilled with a
sensible capability, so you can talk rather than type.

Point at the right-hand panel — **What a counterparty reads**:

> "Everything on the left ends up in that panel, and that panel is public.
> Whoever Pema shows this credential to can read all of it and check it
> themselves. They do not call us to ask."

Two things to say while you are here:

- **Change the cap** to something like `250000` and watch the panel update.
  > "This is not a setting. It is a term written into a credential that
  > strangers will enforce."
- **Point at the expiry** — 90 days by default, and there is no
  "never expires" option at all.
  > "Expiry is what limits the damage when a withdrawal comes late or never
  > happens. So it is short unless someone deliberately lengthens it."
- **Leave "Hangs off" on Customs broker.** It defaults there, and it is what
  makes act 5 work — the capability depends on the role, so withdrawing the
  role withdraws this too.
  > "This is where the chain comes from. A capability almost always derives
  > from a role, and that dependency is the thing act five is about."

Press **Issue to Pema**. You get *awaiting acceptance*:

> "Nothing has been granted yet. It is an offer sitting in her wallet.
> Accepting it is her consent — until she does, she holds no authority and
> nothing can be done in her name."

Press **Simulate Pema accepting**, then **See it checked at a counterparty**.

### 2 · The PASS — `/verifier/bnsw`

**Stop and point out the chrome.** No sidebar, no NDI logo, different colours,
and a line reading *Not part of NDI Studio*.

> "We have left the product. This stands in for the Single Window's own
> website — a different organisation's system — and it is about to check
> Pema's authority without asking Pelden Trading anything."

**Say plainly that BNSW is not live yet** if anyone from customs, trade or
GovTech is in the room — they will know. Its main system is still being
procured; customs today runs on DRC's eCMS, which is the likely interim
counterparty. That is also why delegation is fast-follow rather than first
release: it waits on a counterparty being ready. The page footer and
`/whats-real` both say so.

Leave the value at `420000`. Press **Submit declaration**.

You get a wallet hand-off — a QR and *waiting for Pema to authorise*. Say:

> "She is authorising **this declaration**, on her own phone. Not signing in.
> Not authorising everything. That specific transaction."

(There is a **Skip the wait** link if you are pressed for time.)

Then the decision: a green **PASS**, five checks each naming what it looked
at, the four-link authority chain, and a signature.

> "Five constraints, all checked by them, not us. And notice what the bank
> learned about Pema: her name. Not her citizenship number, not her address,
> not what else she is allowed to do."

### 3 · The FAIL — the moment the demo exists for

Switch to **Dorji** in the demo controls, then go to **Delegated authority**
and press **Withdraw** on **Customs broker** — the *role*, not the capability.
It is the top row, in bold, marked *2 depend on it*; the Declaration
authority you just issued sits indented beneath it. Point at that before you
click:

> "The list is the chain. Everything indented under this row hangs off it.
> Watch what withdrawing it does to them."

**Do not rush the blast-radius panel.** It is computed from what actually
depends on that role:

> "It is telling him that Declaration authority — the thing he issued five
> minutes ago — stops working too. Because it hangs off this. He is not
> withdrawing one credential, he is withdrawing a branch."

Type a reason. Point out that it is required:

> "Pema gets told this, with a reference she can appeal against. Withdrawing
> someone's authority without telling them why leaves them nothing to
> challenge."

Press **Revoke — final**, confirm, and you land back at the Single Window.

**Submit the same declaration again.** Same value, same person, same
counterparty.

> "Nothing about Pema's credential changed. It is still in her wallet, still
> valid, still unexpired."

**FAIL.** The chain now shows *Customs broker* struck through as revoked — and
the capability below it marked *valid in itself, but unreachable*.

> "That is the whole system in one screen. Her capability is fine. What broke
> is the authority above it. And this counterparty found that out by walking
> the chain, in under a second, without anyone telling them to."

### 4 · If someone asks about the service going down

Press **Submit with the service unreachable**.

> "Not verified — and treated as a failure. There is no spinner that eventually
> shrugs and lets it through. If we cannot establish the authority, there is no
> authority."

### Other things you can show on the verifier

| Try | What it demonstrates |
|---|---|
| Value `900000` | The cap refusing it, naming the cap |
| The **fail** state in the switcher | The FAIL without having to revoke anything |
| `/delegated-authority/da-cap-lapsed/revoke` | An authority that expired on its own |

---

## Showing the states nobody can click to

For a design or engineering audience, the state switcher is the interesting
part. Open **Demo controls** and look at **This screen's states** — it lists
whatever the screen you are on has declared, and switching is instant.

Worth showing:

| Screen | Try | Why it matters |
|---|---|---|
| `/wallet/authority` | **suspended**, **expired** | A dead end with a reason, not a broken screen |
| `/wallet/authority` | **no_authority** | What Pema, who holds no controllership, sees |
| `/controllership/relations/.../scope` | **over_broad** | The advisory warnings, without having to build a bad scope |
| `/controllership/relations/.../accept` | **declined** | The outcome nobody demos |
| `/controllership/relations/new` | **person_not_verified** | Why an unconfirmed person is blocked |
| `/verifier/bnsw` | **pass**, **fail**, **service_unreachable** | All three outcomes, no setup needed |
| `/delegated-authority/.../revoke` | **suspended**, **revoked** | Reversible vs final |
| `/delegated-authority` | **empty** | First-run, before anything is delegated |
| `/dashboard` | **all_clear**, **access_suspended** | An empty queue, and a pulled authority |
| `/wallet/offers/...` | **out_of_scope**, **requires_approval** | Both refusal shapes on any offer |
| `/approvals/...` | **stale**, **expired**, **rejected** | The outcomes nobody demos |
| `/controllership/audit` | **filtered_empty** | A filter finding nothing, trail still intact |
| `/onboarding/prove` | **name_mismatch**, **expired** | Someone else's wallet answering, and a lapsed proof request |
| `/onboarding/choose` | **none_found**, **register_unavailable**, **review_form** | The register listing nothing, being down, and the review form |
| `/onboarding/review` | **under_review**, **approved**, **refused** | Every stage of a manual review |
| `/sign-up/check-email` | **delivery_failed** | The verification email bouncing |
| `/invitation/...` | **expired**, **revoked**, **void**, **wrong_person** | Every way an invitation can fail to be accepted |
| `/admin/approvals` | **self_issued** | Dual control: approve disabled, with the reason |
| `/onboarding/foundational` | **issuance_failed** | Confirmed, but the credential did not issue |
| `/controllership/entity` | **foundational_expired** | What lapses when the root lapses |
| `/appeals` | **under_review**, **upheld**, **rejected** | Every stage of an appeal |
| `/kitchen-sink` | — | Every component, both themes. Not part of the story |

> "Denied, expired and suspended states get the same care as the happy path.
> They are more frequent in a system that fails closed, and they are where
> trust is won or lost."

---

## Switching who you are

Demo controls → **Driving as**. The four people the story is about:

- **Dorji Wangchuk** — owner. Sees everything, including Controllership and
  Delegated authority.
- **Rinzin Dema** — controller. Sees Wallet. **No Controllership group at
  all.**
- **Pema Choden** — clearing agent. Sees almost nothing; she works through her
  own phone wallet and a counterparty's website.
- **Ugyen Phuntsho** — warehouse manager. Holds nothing until act 2 grants it,
  which is exactly why he is the one to build an authority for. Before that,
  his wallet correctly says he has no authority here.

And three more for the Gate 2 flows:

- **Anand Acharya** — NDI's root administrator.
- **Kinzang Dorji** — NDI's platform administrator, the only one. Sees the
  Studio and **NDI administration**: organisations, invitations, approvals
  and manual review. Designating a foundational issuer needs a second
  administrator, and root is it.
- **Whoever joins Pelden by invitation** — each gets a record of their own
  and appears once they accept. A member of Pelden who can see it and act
  for nothing.

NDI's organisation has nobody else. The Studio's **Users** page lists exactly
these two (Kinzang once the invitation is accepted) and any admin invitation waiting.

Switch from Dorji to Rinzin with the sidebar visible and point at it:

> "The Controllership section is not greyed out for her. It is not there.
> A disabled menu item would tell her that administering her own authority is
> something she might do — which is exactly the idea this product cannot
> afford her to have."

Rinzin also has no **Approvals** item, because her authority does not include
deciding approvals. That is read from her actual grant, not from a role list.

---

## If something goes wrong

| Problem | Fix |
|---|---|
| Screen looks stale or half-built | **Reset demo** in the demo controls (back to day zero) |
| A sidebar item 404s | Shouldn't happen now — tell me if one does |
| A countdown says "Expired" | Only the deliberately-lapsed fixtures should. Others self-update |
| Acceptance button is disabled | You are the wrong persona. Use **Continue as …** |
| The verifier says no authority exists | Open the story three months on (For reviewers), or issue one via act 4 |
| A second FAIL when you wanted a PASS | The role is still revoked. Open the story three months on again |
| Everything is dark and you wanted light | Theme toggle, top right |

**The fixture dates no longer rot.** Story dates are offsets from today, so an
offer that expires "in a week" always does, and the capability in act 5 is
always inside its validity window. The handful of things that read as expired
are meant to — a lapsed tax certificate, a revoked permit, an offer nobody
answered.

**Every wait is skippable.** Look for **Skip the wait** on any hand-off. The
only long one is the register lookup in act 1, and that length is the point.

---

## What to say when asked "is this real?"

Be straightforward. The honest version lands better than a hedge:

> "The screens are real and the model behind them is real. Nothing underneath
> is — no register integration, no Authority Verification API, no server enforcing
> any of this. It is a frontend prototype whose job is to make us agree on what
> the product should be before anyone builds it."

Then hand over **/whats-real** — click the prototype chip. It lists every
simulated part, what it really is, and what would have to exist for it to be
real, including the bits that genuinely are decided. It is written to be
forwarded.
