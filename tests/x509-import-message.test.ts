import { describe, expect, it } from 'vitest'
import { importedCertificateMessage } from '@/lib/x509'

describe('importedCertificateMessage', () => {
  it('keeps the message of an active certificate', () => {
    expect(
      importedCertificateMessage(
        'x509 certificate imported successfully',
        'Active',
        'P-256',
      ),
    ).toBe('x509 certificate imported successfully')
  })

  it('explains a pending certificate and what to do', () => {
    const message = importedCertificateMessage(
      'x509 certificate imported successfully',
      'Pending activation',
      'P-256',
    )
    expect(message).toContain(
      'x509 certificate imported successfully. It is pending',
    )
    expect(message).toContain('another P-256 certificate is active')
    expect(message).toContain('Deactivate the other one, then choose Activate')
  })

  it('still reads well when the key type is not known', () => {
    expect(
      importedCertificateMessage('Imported', 'Pending activation', null),
    ).toContain('another certificate is active')
  })
})
