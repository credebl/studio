import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getPlatformAdminSession,
  inviteEcosystemOwner,
  updateEcosystemStatus,
} from '@/lib/server/admin'
import {
  inviteEcosystemOwnerAction,
  setEcosystemEnabledAction,
} from '@/app/admin/actions'
import { makeSession } from './helpers'
import { revalidatePath } from 'next/cache'

vi.mock('@/lib/server/admin', () => ({
  getPlatformAdminSession: vi.fn(),
  inviteEcosystemOwner: vi.fn(),
  updateEcosystemStatus: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const emailForm = (email: string): FormData => {
  const form = new FormData()
  form.set('email', email)
  return form
}

beforeEach(() => {
  vi.mocked(getPlatformAdminSession).mockResolvedValue(makeSession())
  vi.mocked(inviteEcosystemOwner).mockResolvedValue(undefined)
  vi.mocked(updateEcosystemStatus).mockResolvedValue(undefined)
})

describe('inviteEcosystemOwnerAction', () => {
  it('rejects a direct invocation without a platform-admin session', async () => {
    vi.mocked(getPlatformAdminSession).mockResolvedValue(null)

    const result = await inviteEcosystemOwnerAction(
      null,
      emailForm('new@example.com'),
    )

    expect(result).toEqual({
      status: 'error',
      message: 'You are not allowed to perform this action.',
    })
    expect(inviteEcosystemOwner).not.toHaveBeenCalled()
  })

  it('rejects an invalid email before calling the backend', async () => {
    const result = await inviteEcosystemOwnerAction(
      null,
      emailForm('not-an-email'),
    )

    expect(result).toEqual({
      status: 'error',
      message: 'Enter a valid email address.',
    })
    expect(inviteEcosystemOwner).not.toHaveBeenCalled()
  })

  it('rejects an over-long email before calling the backend', async () => {
    const result = await inviteEcosystemOwnerAction(
      null,
      emailForm(`${'a'.repeat(245)}@example.com`),
    )

    expect(result).toEqual({
      status: 'error',
      message: 'Enter a valid email address.',
    })
    expect(inviteEcosystemOwner).not.toHaveBeenCalled()
  })

  it('normalizes a valid email and revalidates the invitation page', async () => {
    const result = await inviteEcosystemOwnerAction(
      null,
      emailForm('  New.User@Example.COM  '),
    )

    expect(inviteEcosystemOwner).toHaveBeenCalledWith('new.user@example.com')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/invitations')
    expect(result).toEqual({
      status: 'success',
      message: 'Invitation sent to new.user@example.com.',
    })
  })

  it('does not leak backend error details to the client', async () => {
    vi.mocked(inviteEcosystemOwner).mockRejectedValue(
      new Error('raw backend detail'),
    )

    const result = await inviteEcosystemOwnerAction(
      null,
      emailForm('new@example.com'),
    )

    expect(result).toEqual({
      status: 'error',
      message: 'Could not send the invitation. Please try again.',
    })
    expect(JSON.stringify(result)).not.toContain('raw backend detail')
  })
})

describe('setEcosystemEnabledAction', () => {
  it('rejects a direct invocation without a platform-admin session', async () => {
    vi.mocked(getPlatformAdminSession).mockResolvedValue(null)

    const result = await setEcosystemEnabledAction(true)

    expect(result).toEqual({
      status: 'error',
      message: 'You are not allowed to perform this action.',
    })
    expect(updateEcosystemStatus).not.toHaveBeenCalled()
  })

  it('rejects a non-boolean value', async () => {
    const result = await setEcosystemEnabledAction('true' as unknown as boolean)

    expect(result).toEqual({ status: 'error', message: 'Invalid value.' })
    expect(updateEcosystemStatus).not.toHaveBeenCalled()
  })

  it('enables the feature and revalidates both admin pages', async () => {
    const result = await setEcosystemEnabledAction(true)

    expect(updateEcosystemStatus).toHaveBeenCalledWith(true)
    expect(revalidatePath).toHaveBeenCalledWith('/admin')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/settings')
    expect(result).toEqual({
      status: 'success',
      message: 'Ecosystem feature enabled.',
    })
  })

  it('disables the feature', async () => {
    const result = await setEcosystemEnabledAction(false)

    expect(updateEcosystemStatus).toHaveBeenCalledWith(false)
    expect(result).toEqual({
      status: 'success',
      message: 'Ecosystem feature disabled.',
    })
  })

  it('does not leak backend error details to the client', async () => {
    vi.mocked(updateEcosystemStatus).mockRejectedValue(
      new Error('raw backend detail'),
    )

    const result = await setEcosystemEnabledAction(true)

    expect(result).toEqual({
      status: 'error',
      message: 'Could not update the ecosystem setting.',
    })
    expect(JSON.stringify(result)).not.toContain('raw backend detail')
  })
})
