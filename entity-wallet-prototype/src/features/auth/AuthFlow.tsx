"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { AuthShell } from "@/components/layout/AuthShell";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { SecureSignInScene } from "@/components/ui/scenes";
import { PERSONAS, ROOT_ADMIN, isPlatformAdmin } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { LoginStep } from "./LoginStep";
import type { AuthStep } from "./authTypes";

const RAIL: Record<AuthStep, { scene: ReactNode; title: ReactNode; lead: string }> = {
  login: {
    scene: <SecureSignInScene />,
    title: (
      <>
        Your identity, <span className="ndi-wave-text">verified once</span>
      </>
    ),
    lead: "NDI Studio is where organizations issue and verify credentials on the Bhutan National Digital Identity network.",
  },
};

/**
 * Sign-in.
 *
 * This used to carry sign-up too, as two more cards on the same page. Sign-up
 * is now FLOW-ONB-01 — five screens with their own URLs under /sign-up —
 * because it has an email round trip in the middle, and a flow that has to
 * survive the person closing the tab and opening a link on another device
 * cannot live in one component's state. "Create an account" leaves for it.
 */
export function AuthFlow({ start = "login" }: { start?: AuthStep } = {}) {
  const router = useRouter();
  const { people, signIn } = useDemo();
  const [email, setEmail] = useState("");
  const rail = RAIL[start];

  /* The accounts that exist right now: root, then the platform admins, then
     everyone else. Root's is always here — the deployment made it — which
     is the point: the platform's owner is shown signing in, not signing up
     (see ROOT_ADMIN). An admin who has just set up comes next, so the one
     the room just watched being made is never cut off the end. */
  const rank = (p: (typeof people)[number]) => (p.id === ROOT_ADMIN ? 0 : isPlatformAdmin(p) ? 1 : 2);
  const accounts = people
    .filter((p) => p.hasAccount !== false && ((PERSONAS as string[]).includes(p.id) || p.joinedBy))
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, 6);

  return (
    <AuthShell scene={rail.scene} title={rail.title} lead={rail.lead}>
      <LoginStep
        key={email}
        initialEmail={email}
        onSubmit={(value) => {
          const result = signIn(value);
          /* The same words whether the address has no account or the
             password is wrong. "There's no account with that address" made
             this page a way to test which addresses are registered — what
             FLOW-ONB-01 S3 and UX-EW-01 §2.4 rule out ("any indication of
             whether an email address is already registered"), and what
             sign-up already avoids with identical E1/E7 wording (UXD-02).
             Any password works in this demo, so only an unknown address
             reaches this line; the words still have to fit either cause. */
          if (!result.ok) return "That email and password don't match an account. Check them and try again, or reset your password.";
          router.push(result.personId ? "/dashboard" : "/welcome");
        }}
        onForgotPassword={() => router.push("/reset-password")}
        onCreateAccount={() => router.push("/sign-up")}
      />
      {accounts.length > 0 ? (
        <div className="relative z-[4] mt-5">
          <SimulatedStep
            standsFor="remembering your address"
            action={accounts.map((p) => (
              <SimulatedAction key={p.id} onClick={() => setEmail(p.email)}>
                {p.name}
              </SimulatedAction>
            ))}
          >
            Accounts that exist in this demo. Pick one to fill in its address — any password works.
          </SimulatedStep>
        </div>
      ) : null}
    </AuthShell>
  );
}
