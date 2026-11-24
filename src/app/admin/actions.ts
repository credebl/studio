'use server'

import {
  getPlatformAdminSession,
  inviteEcosystemOwner,
  updateEcosystemStatus,
} from '@/lib/server/admin'
import type { AdminActionResult } from '@/features/admin/types'
import { revalidatePath } from 'next/cache'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_EMAIL_LENGTH = 254

const forbidden = (): AdminActionResult => ({
  status: 'error',
  message: 'You are not allowed to perform this action.',
})

/**
 * Server actions are independently invocable, so each one re-checks the
 * platform-admin role. The layout guard alone is not sufficient.
 */
export async function inviteEcosystemOwnerAction(
  _previousState: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  if (!(await getPlatformAdminSession())) {
    return forbidden()
  }

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()

  if (!EMAIL_PATTERN.test(email) || email.length > MAX_EMAIL_LENGTH) {
    return { status: 'error', message: 'Enter a valid email address.' }
  }

  try {
    await inviteEcosystemOwner(email)
    revalidatePath('/admin/invitations')
    return { status: 'success', message: `Invitation sent to ${email}.` }
  } catch {
    return {
      status: 'error',
      message: 'Could not send the invitation. Please try again.',
    }
  }
}

export async function setEcosystemEnabledAction(
  enabled: boolean,
): Promise<AdminActionResult> {
  if (!(await getPlatformAdminSession())) {
    return forbidden()
  }

  if (typeof enabled !== 'boolean') {
    return { status: 'error', message: 'Invalid value.' }
  }

  try {
    await updateEcosystemStatus(enabled)
    revalidatePath('/admin')
    revalidatePath('/admin/settings')
    return {
      status: 'success',
      message: enabled
        ? 'Ecosystem feature enabled.'
        : 'Ecosystem feature disabled.',
    }
  } catch {
    return {
      status: 'error',
      message: 'Could not update the ecosystem setting.',
    }
  }
}
