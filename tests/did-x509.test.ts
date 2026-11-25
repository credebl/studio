import { describe, expect, it } from 'vitest'
import { parseCertificateChain } from '../src/utils/didX509'

// Not real certificates: base64 of a DER SEQUENCE, which is all the browser check looks at.
const body = Buffer.from([0x30, 0x03, 0x02, 0x01, 0x01]).toString('base64')
const pem = (b: string = body): string =>
  `-----BEGIN CERTIFICATE-----\n${b}\n-----END CERTIFICATE-----`

describe('parseCertificateChain', () => {
  it('splits a bundle into certificates in order', () => {
    const chain = parseCertificateChain(`${pem()}\n\n${pem()}\n`)
    expect(chain).toHaveLength(2)
    expect(chain[0]).toBe(pem())
  })

  it('rewraps the body and drops stray whitespace', () => {
    const chain = parseCertificateChain(
      `  -----BEGIN CERTIFICATE-----\r\n${body.slice(0, 4)}\r\n${body.slice(4)}\r\n-----END CERTIFICATE-----  `,
    )
    expect(chain).toEqual([pem()])
  })

  it('rejects empty input', () => {
    expect(() => parseCertificateChain('  ')).toThrow(/Enter the certificate/)
  })

  it('rejects text with no PEM certificate', () => {
    expect(() => parseCertificateChain('hello')).toThrow(/PEM certificates/)
    expect(() =>
      parseCertificateChain(
        '-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----',
      ),
    ).toThrow(/PEM certificates/)
  })

  it('rejects a body that is not base64 DER', () => {
    expect(() => parseCertificateChain(pem('not*base64'))).toThrow(
      /Certificate 1/,
    )
    expect(() =>
      parseCertificateChain(`${pem()}\n${pem(btoa('plain text'))}`),
    ).toThrow(/Certificate 2/)
    expect(() => parseCertificateChain(pem(''))).toThrow(/Certificate 1/)
  })

  it('rejects text mixed into the chain', () => {
    expect(() => parseCertificateChain(`${pem()}\noops`)).toThrow(/outside/)
  })

  it('rejects more than ten certificates', () => {
    const many = Array.from({ length: 11 }, () => pem()).join('\n')
    expect(() => parseCertificateChain(many)).toThrow(/at most 10/)
  })
})
