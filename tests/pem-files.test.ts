import {
  UploadedFileError,
  certificateChainFromFiles,
  certificatesFromFile,
  derToPem,
  isEncryptedPrivateKey,
  orderCertificateChain,
  privateKeyFromFile,
} from '@/utils/pemFiles'
import { describe, expect, it } from 'vitest'

// A throwaway chain made only for these tests: root -> intermediate -> leaf (ECDSA P-256).
const ROOT = `-----BEGIN CERTIFICATE-----
MIIBZzCCAQygAwIBAgIJAMz1aVwwhDB+MAoGCCqGSM49BAMCMCYxDTALBgNVBAoM
BFRlc3QxFTATBgNVBAMMDFRlc3QgUm9vdCBDQTAeFw0yNjExMDkxNzA3MzBaFw0z
NjExMDYxNzA3MzBaMCYxDTALBgNVBAoMBFRlc3QxFTATBgNVBAMMDFRlc3QgUm9v
dCBDQTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABLS4nuBF9/J6N6i43O2rDnTa
YIx2QTu+YiqwQifyXpO4Ni2uIiMEkRx2/pqYMw1bHzxE0U6YHBnoc7s0GhWVO/yj
IzAhMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMC
A0kAMEYCIQDueyUrKtTzBZfoh2pl1VdiCaCh9ixee2iIUAFlg/6f2wIhANFo4jTe
pXrgefbb1rZTee1WQjtOY2uj3fiHSyVGhbyp
-----END CERTIFICATE-----`
const INTERMEDIATE = `-----BEGIN CERTIFICATE-----
MIIBmjCCAUGgAwIBAgIJANbZUUv3OHpEMAoGCCqGSM49BAMCMCYxDTALBgNVBAoM
BFRlc3QxFTATBgNVBAMMDFRlc3QgUm9vdCBDQTAeFw0yNjExMDkxNzA3MzBaFw0z
MTExMDgxNzA3MzBaMC4xDTALBgNVBAoMBFRlc3QxHTAbBgNVBAMMFFRlc3QgSW50
ZXJtZWRpYXRlIENBMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEaf9S49Dv+G+g
myKh84Ce4AauEZ6W37+EORyczirGSMEH8J/ExFdXI/jqmCaiOQ743ZegVq44W+Du
IKH1+cQqT6NQME4wEgYDVR0TAQH/BAgwBgEB/wIBADAOBgNVHQ8BAf8EBAMCAQYw
HQYDVR0OBBYEFBu2UbfsGyA1AfFSSbSTau/maEbGMAkGA1UdIwQCMAAwCgYIKoZI
zj0EAwIDRwAwRAIgFNjgws00TkJzI+A/nqm82iDlRwT8bcGmYQLeTOwcX9MCIHl5
6WUs8gQCaH1ZhYZIqxkDbg3J8CA5vGzKZWcx4UCy
-----END CERTIFICATE-----`
const LEAF = `-----BEGIN CERTIFICATE-----
MIIB5zCCAYygAwIBAgIJAJ2JCHv+JYFFMAoGCCqGSM49BAMCMC4xDTALBgNVBAoM
BFRlc3QxHTAbBgNVBAMMFFRlc3QgSW50ZXJtZWRpYXRlIENBMB4XDTI2MTEwOTE3
MDczMFoXDTI3MTEwOTE3MDczMFowNjENMAsGA1UECgwEVGVzdDElMCMGA1UEAwwc
c3R1ZGlvLXRlc3QtbGVhZi5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49
AwEHA0IABP2QANY1FnQ+HLkAE7h1CA33APQE1EEOWxaWQ6vOdS9LpKQJ9WgD9ggk
FKXLStN8yToa83Jh1Y7dz0AQZkmrSIijgYowgYcwDAYDVR0TAQH/BAIwADAOBgNV
HQ8BAf8EBAMCB4AwJwYDVR0RBCAwHoIcc3R1ZGlvLXRlc3QtbGVhZi5leGFtcGxl
LmNvbTAdBgNVHQ4EFgQUxLl9NUvT77thhobckT+Py2psxX4wHwYDVR0jBBgwFoAU
G7ZRt+wbIDUB8VJJtJNq7+ZoRsYwCgYIKoZIzj0EAwIDSQAwRgIhAKYlvxbPq+7Z
GDTQQY5a8DvT7mxIPj1Ft+hBUIRgSMIvAiEAsHr6AGzDrj7gBWsrkBgSsmhCirmm
cLaifp5mjD6+5Zk=
-----END CERTIFICATE-----`

const encode = (text: string): Uint8Array => new TextEncoder().encode(text)
const compact = (pem: string): string => pem.replace(/\s+/g, '')
const decodeDer = (pem: string): Uint8Array =>
  Uint8Array.from(atob(compact(pem.replace(/-----[A-Z ]+-----/g, ''))), (c) =>
    c.charCodeAt(0),
  )
const positions = (pems: string[]): number[] =>
  pems.map((pem) => [LEAF, INTERMEDIATE, ROOT].indexOf(pem))
const blocks = (text: string): string[] =>
  text.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) ??
  []

describe('orderCertificateChain', () => {
  it('puts the leaf first and the root last whatever the order given', () => {
    expect(
      positions(orderCertificateChain([ROOT, LEAF, INTERMEDIATE])),
    ).toEqual([0, 1, 2])
    expect(
      positions(orderCertificateChain([INTERMEDIATE, ROOT, LEAF])),
    ).toEqual([0, 1, 2])
  })

  it('keeps the given order when the certificates cannot be read', () => {
    const broken =
      '-----BEGIN CERTIFICATE-----\nAAAA\n-----END CERTIFICATE-----'
    expect(orderCertificateChain([broken, LEAF])).toEqual([broken, LEAF])
  })
})

describe('certificatesFromFile', () => {
  it('reads every certificate of a PEM file', () => {
    expect(
      certificatesFromFile('chain.pem', encode(`${LEAF}\n${ROOT}`)),
    ).toEqual([LEAF, ROOT])
  })

  it('wraps a binary DER certificate as PEM', () => {
    const [pem] = certificatesFromFile('leaf.der', decodeDer(LEAF))
    expect(pem.startsWith('-----BEGIN CERTIFICATE-----')).toBe(true)
    expect(compact(pem)).toBe(compact(LEAF))
  })

  it('refuses a file holding a private key or no certificate', () => {
    const key = '-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----'
    expect(() => certificatesFromFile('k.pem', encode(key))).toThrow(
      UploadedFileError,
    )
    expect(() => certificatesFromFile('x.txt', encode('hello'))).toThrow(
      UploadedFileError,
    )
    expect(() => certificatesFromFile('empty.pem', new Uint8Array())).toThrow(
      'empty',
    )
  })
})

describe('certificateChainFromFiles', () => {
  it('orders certificates from several files, leaf first', () => {
    const text = certificateChainFromFiles([
      { name: 'root.crt', bytes: encode(ROOT) },
      { name: 'leaf.der', bytes: decodeDer(LEAF) },
      { name: 'intermediate.pem', bytes: encode(INTERMEDIATE) },
    ])
    expect(blocks(text).map(compact)).toEqual(
      [LEAF, INTERMEDIATE, ROOT].map(compact),
    )
  })
})

describe('privateKeyFromFile', () => {
  const pkcs8 = Uint8Array.from([
    0x30, 0x0b, 0x02, 0x01, 0x00, 0x30, 0x06, 0x06, 0x01, 0x2a, 0x05, 0x00,
    0x04, 0x00,
  ])
  const sec1 = Uint8Array.from([
    0x30, 0x07, 0x02, 0x01, 0x01, 0x04, 0x02, 0x00, 0x00,
  ])
  const pkcs1 = Uint8Array.from([
    0x30, 0x06, 0x02, 0x01, 0x00, 0x02, 0x01, 0x05,
  ])

  it('wraps a binary key by its kind', () => {
    expect(privateKeyFromFile('k.der', pkcs8)).toContain('BEGIN PRIVATE KEY')
    expect(privateKeyFromFile('k.der', sec1)).toContain('BEGIN EC PRIVATE KEY')
    expect(privateKeyFromFile('k.der', pkcs1)).toContain(
      'BEGIN RSA PRIVATE KEY',
    )
  })

  it('keeps a PEM key and a JWK as they are', () => {
    const pem = '-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----'
    expect(privateKeyFromFile('k.pem', encode(`# note\n${pem}\n`))).toBe(pem)
    expect(privateKeyFromFile('k.json', encode('{"kty":"EC"}'))).toBe(
      '{"kty":"EC"}',
    )
  })

  it('refuses a certificate, text without a key and two keys', () => {
    expect(() => privateKeyFromFile('c.pem', encode(LEAF))).toThrow(
      UploadedFileError,
    )
    expect(() => privateKeyFromFile('c.der', decodeDer(LEAF))).toThrow(
      UploadedFileError,
    )
    const two =
      '-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----\n'.repeat(2)
    expect(() => privateKeyFromFile('k.pem', encode(two))).toThrow(
      'more than one',
    )
  })
})

describe('isEncryptedPrivateKey', () => {
  it('spots an encrypted key', () => {
    expect(
      isEncryptedPrivateKey('-----BEGIN ENCRYPTED PRIVATE KEY-----\nAAAA'),
    ).toBe(true)
    expect(isEncryptedPrivateKey('-----BEGIN PRIVATE KEY-----\nAAAA')).toBe(
      false,
    )
  })
})

describe('derToPem', () => {
  it('wraps lines at 64 characters', () => {
    const pem = derToPem(new Uint8Array(100).fill(1), 'CERTIFICATE')
    expect(
      pem
        .split('\n')
        .slice(1, -1)
        .every((line) => line.length <= 64),
    ).toBe(true)
  })
})
