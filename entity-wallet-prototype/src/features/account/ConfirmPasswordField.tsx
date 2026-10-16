"use client";

import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";

/**
 * The password, typed a second time.
 *
 * WHY IT IS ASKED FOR AT ALL
 *
 * Nothing after this screen catches a typo. The email round trip is done by
 * the time a password is set — on sign-up it came first, on an invitation
 * the link was the proof — so a mistyped password locks the person out on
 * their first sign-in, and the only way back is a reset they did not know
 * they needed. One shared field, so sign-up and the platform-admin
 * invitation cannot drift apart on how the check reads.
 *
 * The mismatch is said beside the field as soon as it is true, not only
 * when the form is sent: the person is still looking at both fields.
 */
export function ConfirmPasswordField({
  password,
  value,
  onChange,
  revealed,
  disabled,
  id,
  missing = false,
}: {
  password: string;
  value: string;
  onChange: (value: string) => void;
  /** Follows the show/hide toggle on the first field. */
  revealed: boolean;
  disabled?: boolean;
  /** The input's own id is `${id}-input`, so a form can focus it. */
  id: string;
  /** The form was sent with this field empty: say so here, not in a banner. */
  missing?: boolean;
}) {
  const mismatch = value !== "" && value !== password;
  return (
    <div className="flex flex-col gap-1.5">
      <label className={FIELD_BLOCK_CLASS}>
        <span className={LABEL_CLASS}>Confirm password</span>
        <input
          id={`${id}-input`}
          name="confirmPassword"
          type={revealed ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={mismatch || (missing && value === "") ? true : undefined}
          aria-describedby={`${id}-status`}
          className={`${FIELD_CLASS} h-12`}
        />
      </label>
      <p id={`${id}-status`} aria-live="polite" className="m-0 flex min-h-[18px] items-center gap-2 text-[12.5px]">
        {value === "" ? (
          missing ? (
            <span className="flex items-center gap-2" style={{ color: "var(--text-danger)" }}>
              <Icon name="close" size={13} strokeWidth={2.2} className="flex-none" />
              Type the password again to confirm it
            </span>
          ) : null
        ) : mismatch ? (
          <span className="flex items-center gap-2" style={{ color: "var(--text-danger)" }}>
            <Icon name="close" size={13} strokeWidth={2.2} className="flex-none" />
            The two passwords don&rsquo;t match
          </span>
        ) : (
          <span className="flex items-center gap-2" style={{ color: "var(--accent)" }}>
            <Icon name="check" size={13} strokeWidth={2.2} className="flex-none" />
            Passwords match
          </span>
        )}
      </p>
    </div>
  );
}

export const PASSWORDS_DIFFER = "The two passwords don't match.";
