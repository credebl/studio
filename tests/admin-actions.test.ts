import {
  CloudBaseWalletConflictError,
  configureCloudBaseWallet,
  getPlatformAdminSession,
  inviteEcosystemOwner,
  rememberCloudBaseWalletConfigured,
  updateEcosystemStatus,
} from '@/lib/server/admin'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  configureCloudBaseWalletAction,
  inviteEcosystemOwnerAction,
  setEcosystemEnabledAction,
} from '@/app/admin/actions'
import { makeSession } from './helpers'
import { revalidatePath } from 'next/cache'

vi.mock('@/lib/server/admin', () => ({
  getPlatformAdminSession: vi.fn(),
  inviteEcosystemOwner: vi.fn(),
  updateEcosystemStatus: vi.fn(),
  configureCloudBaseWallet: vi.fn(),
  rememberCloudBaseWalletConfigured: vi.fn(),
  CloudBaseWalletConflictError: class CloudBaseWalletConflictError extends Error {},
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const emailForm = (email: string): FormData => {
  const form = new FormData()
  form.set('email', email)
  return form
}

const walletForm = (overrides: Record<string, string> = {}): FormData => {
  const form = new FormData()
  form.set('agentEndpoint', ' https://agent.example.com:4001 ')
  form.set('apiKey', ' agent-secret ')
  form.set('walletKey', ' wallet-secret ')
  form.set('confirm', 'on')
  for (const [key, value] of Object.entries(overrides)) {
    form.set(key, value)
  }
  return form
}

beforeEach(() => {
  vi.mocked(getPlatformAdminSession).mockResolvedValue(makeSession())
  vi.mocked(inviteEcosystemOwner).mockResolvedValue(undefined)
  vi.mocked(updateEcosystemStatus).mockResolvedValue(undefined)
  vi.mocked(configureCloudBaseWallet).mockResolvedValue({})
  vi.mocked(rememberCloudBaseWalletConfigured).mockResolvedValue({
    configured: true,
    agentEndpoint: 'https://agent.example.com:4001',
    configuredAt: '2026-01-01T00:00:00.000Z',
  })
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

describe('configureCloudBaseWalletAction', () => {
  it('rejects a direct invocation without a platform-admin session', async () => {
    vi.mocked(getPlatformAdminSession).mockResolvedValue(null)

    const result = await configureCloudBaseWalletAction(null, walletForm())

    expect(result).toEqual({
      status: 'error',
      message: 'You are not allowed to perform this action.',
    })
    expect(configureCloudBaseWallet).not.toHaveBeenCalled()
  })

  it('requires the explicit confirmation', async () => {
    const result = await configureCloudBaseWalletAction(
      null,
      walletForm({ confirm: '' }),
    )

    expect(result.status).toBe('error')
    expect(configureCloudBaseWallet).not.toHaveBeenCalled()
  })

  it.each([
    'not-a-url',
    'javascript:alert(1)',
    'https://agent.example.com:4001/some/path',
  ])('rejects an invalid agent endpoint: %s', async (agentEndpoint) => {
    const result = await configureCloudBaseWalletAction(
      null,
      walletForm({ agentEndpoint }),
    )

    expect(result.status).toBe('error')
    expect(configureCloudBaseWallet).not.toHaveBeenCalled()
  })

  it.each(['apiKey', 'walletKey'])('rejects a missing %s', async (field) => {
    const result = await configureCloudBaseWalletAction(
      null,
      walletForm({ [field]: '' }),
    )

    expect(result.status).toBe('error')
    expect(configureCloudBaseWallet).not.toHaveBeenCalled()
  })

  it('trims values, configures the wallet and revalidates the page', async () => {
    const result = await configureCloudBaseWalletAction(null, walletForm())

    expect(configureCloudBaseWallet).toHaveBeenCalledWith({
      agentEndpoint: 'https://agent.example.com:4001',
      apiKey: 'agent-secret',
      walletKey: 'wallet-secret',
    })
    expect(rememberCloudBaseWalletConfigured).toHaveBeenCalledWith({
      agentEndpoint: 'https://agent.example.com:4001',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/cloud-wallet')
    expect(result).toEqual({
      status: 'success',
      message:
        'Cloud base wallet configured. Holders can now create their wallets.',
      configured: true,
      agentEndpoint: 'https://agent.example.com:4001',
      configuredAt: '2026-01-01T00:00:00.000Z',
    })
    expect(JSON.stringify(result)).not.toContain('agent-secret')
    expect(JSON.stringify(result)).not.toContain('wallet-secret')
  })

  it('switches to view mode when a base wallet is already configured', async () => {
    vi.mocked(configureCloudBaseWallet).mockRejectedValue(
      new CloudBaseWalletConflictError(),
    )

    const result = await configureCloudBaseWalletAction(null, walletForm())

    expect(rememberCloudBaseWalletConfigured).toHaveBeenCalledWith()
    expect(revalidatePath).toHaveBeenCalledWith('/admin/cloud-wallet')
    expect(result).toEqual({
      status: 'error',
      message: 'A cloud base wallet is already configured for this platform.',
      configured: true,
      agentEndpoint: 'https://agent.example.com:4001',
      configuredAt: '2026-01-01T00:00:00.000Z',
    })
    expect(JSON.stringify(result)).not.toContain('agent-secret')
    expect(JSON.stringify(result)).not.toContain('wallet-secret')
  })

  it('does not leak backend error details to the client', async () => {
    vi.mocked(configureCloudBaseWallet).mockRejectedValue(
      new Error('raw backend detail'),
    )

    const result = await configureCloudBaseWalletAction(null, walletForm())

    expect(result).toEqual({
      status: 'error',
      message: 'Could not configure the cloud base wallet. Please try again.',
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
