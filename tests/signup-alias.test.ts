import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendVerificationMail } from '@/app/api/Auth'

const axiosPostMock = vi.fn()

vi.mock('@/services/apiRequests', () => ({
  axiosPost: (details: unknown): unknown => axiosPostMock(details),
  axiosGet: vi.fn(),
  axiosPut: vi.fn(),
  axiosDelete: vi.fn(),
}))

vi.mock('@/config/GetHeaderConfigs', () => ({
  getHeaderConfigs: (): Record<string, never> => ({}),
}))

describe('sendVerificationMail', () => {
  beforeEach(() => {
    axiosPostMock.mockReset()
  })

  it('omits clientAlias when none is provided so the platform uses its default', async () => {
    await sendVerificationMail({ email: 'test@example.com' })

    expect(axiosPostMock).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/auth/verification-mail' }),
    )
  })

  it('encodes a provided clientAlias in the query string', async () => {
    await sendVerificationMail({
      email: 'test@example.com',
      clientAlias: 'SOVIO',
    })

    expect(axiosPostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/auth/verification-mail?clientAlias=SOVIO',
      }),
    )
  })
})
