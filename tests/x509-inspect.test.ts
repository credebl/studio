import {
  BasicConstraintsExtension,
  X509Certificate,
  X509CertificateGenerator,
} from '@peculiar/x509'
import { createHash, createPrivateKey } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { reviewCertificateChain, reviewPrivateKey } from '@/lib/x509Inspect'

const ALGORITHM = { name: 'ECDSA', hash: 'SHA-256' }
const DAY = 24 * 60 * 60 * 1000
const now = new Date()

const newKeys = (): Promise<CryptoKeyPair> =>
  crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
    'sign',
    'verify',
  ])

const pkcs8Pem = async (key: CryptoKey): Promise<string> => {
  const der = Buffer.from(await crypto.subtle.exportKey('pkcs8', key))
  return `-----BEGIN PRIVATE KEY-----\n${der
    .toString('base64')
    .match(/.{1,64}/g)
    ?.join('\n')}\n-----END PRIVATE KEY-----`
}

interface Chain {
  leaf: X509Certificate
  intermediate: X509Certificate
  root: X509Certificate
  leafKeys: CryptoKeyPair
}

async function makeChain(
  options: { leafNotAfter?: Date; leafIsCa?: boolean } = {},
): Promise<Chain> {
  const rootKeys = await newKeys()
  const intermediateKeys = await newKeys()
  const leafKeys = await newKeys()
  const notBefore = new Date(now.getTime() - DAY)
  const notAfter = new Date(now.getTime() + 30 * DAY)

  const root = await X509CertificateGenerator.createSelfSigned({
    serialNumber: '01',
    name: 'CN=Test Root,O=Test',
    notBefore,
    notAfter,
    signingAlgorithm: ALGORITHM,
    keys: rootKeys,
    extensions: [new BasicConstraintsExtension(true, undefined, true)],
  })
  const intermediate = await X509CertificateGenerator.create({
    serialNumber: '02',
    subject: 'CN=Test Intermediate,O=Test',
    issuer: root.subject,
    notBefore,
    notAfter,
    signingAlgorithm: ALGORITHM,
    signingKey: rootKeys.privateKey,
    publicKey: intermediateKeys.publicKey,
    extensions: [new BasicConstraintsExtension(true, 0, true)],
  })
  const leaf = await X509CertificateGenerator.create({
    serialNumber: '03',
    subject: 'CN=leaf.example.com,O=Test',
    issuer: intermediate.subject,
    notBefore,
    notAfter: options.leafNotAfter ?? notAfter,
    signingAlgorithm: ALGORITHM,
    signingKey: intermediateKeys.privateKey,
    publicKey: leafKeys.publicKey,
    extensions: [
      new BasicConstraintsExtension(options.leafIsCa ?? false, undefined, true),
    ],
  })
  return { leaf, intermediate, root, leafKeys }
}

describe('reviewCertificateChain', () => {
  it('describes a good chain and works out the DID', async () => {
    const { leaf, intermediate, root } = await makeChain()
    const review = await reviewCertificateChain([
      leaf.toString('pem'),
      intermediate.toString('pem'),
      root.toString('pem'),
    ])

    expect(review.hasErrors).toBe(false)
    expect(review.certificates.map((c) => c.role)).toEqual([
      'leaf',
      'intermediate',
      'root',
    ])
    expect(review.certificates[0]).toMatchObject({
      commonName: 'leaf.example.com',
      keyAlgorithm: 'ECDSA P-256',
      isCa: false,
      validNow: true,
    })
    expect(review.certificates[2].isCa).toBe(true)
    expect(review.certificates[0].fingerprint).toMatch(
      /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/,
    )

    const rootHash = createHash('sha256')
      .update(Buffer.from(root.rawData))
      .digest('base64url')
    expect(review.expectedDid).toBe(
      `did:x509:0:sha256:${rootHash}::subject:CN:leaf.example.com`,
    )
    expect(review.findings.every((f) => f.level === 'ok')).toBe(true)
  })

  it('reports a chain in the wrong order', async () => {
    const { leaf, intermediate, root } = await makeChain()
    const review = await reviewCertificateChain([
      root.toString('pem'),
      leaf.toString('pem'),
      intermediate.toString('pem'),
    ])
    expect(review.hasErrors).toBe(true)
    expect(
      review.findings.some((f) => f.message.includes('was not issued by')),
    ).toBe(true)
    expect(review.expectedDid).toBeUndefined()
  })

  it('reports an expired and a not yet valid certificate', async () => {
    const { leaf, intermediate, root } = await makeChain()
    const pems = [leaf, intermediate, root].map((c) => c.toString('pem'))

    const late = await reviewCertificateChain(
      pems,
      new Date(now.getTime() + 90 * DAY),
    )
    expect(
      late.findings.filter((f) => f.message.includes('has expired')),
    ).toHaveLength(3)

    const early = await reviewCertificateChain(
      pems,
      new Date(now.getTime() - 90 * DAY),
    )
    expect(
      early.findings.some((f) => f.message.includes('not valid yet')),
    ).toBe(true)
    expect(early.certificates[0].validNow).toBe(false)
  })

  it('warns when the chain does not end at a root or starts with a CA', async () => {
    const { leaf, intermediate } = await makeChain({ leafIsCa: true })
    const review = await reviewCertificateChain([
      leaf.toString('pem'),
      intermediate.toString('pem'),
    ])
    const warnings = review.findings
      .filter((f) => f.level === 'warning')
      .map((f) => f.message)
    expect(
      warnings.some((m) => m.includes('does not end at a self-signed root')),
    ).toBe(true)
    expect(warnings.some((m) => m.includes('is a CA certificate'))).toBe(true)
    expect(review.hasErrors).toBe(false)
  })

  it('reports a certificate that cannot be read', async () => {
    const review = await reviewCertificateChain([
      '-----BEGIN CERTIFICATE-----\nAAAA\n-----END CERTIFICATE-----',
    ])
    expect(review.hasErrors).toBe(true)
    expect(review.certificates).toEqual([])
  })
})

describe('reviewPrivateKey', () => {
  it('matches a PKCS#8, a SEC1 and a JWK key of the leaf', async () => {
    const { leaf, leafKeys } = await makeChain()
    const pkcs8 = await pkcs8Pem(leafKeys.privateKey)
    const sec1 = createPrivateKey(pkcs8)
      .export({ type: 'sec1', format: 'pem' })
      .toString()
    const jwk = JSON.stringify(
      await crypto.subtle.exportKey('jwk', leafKeys.privateKey),
    )

    for (const key of [pkcs8, sec1, jwk]) {
      const review = await reviewPrivateKey(key, leaf.toString('pem'))
      expect(review.match).toBe('match')
    }
    expect(
      (await reviewPrivateKey(pkcs8, leaf.toString('pem'))).description,
    ).toBe('P-256 private key')
  })

  it('reports a key that belongs to another certificate', async () => {
    const { leaf } = await makeChain()
    const other = await newKeys()
    const review = await reviewPrivateKey(
      await pkcs8Pem(other.privateKey),
      leaf.toString('pem'),
    )
    expect(review.match).toBe('mismatch')
  })

  it('reports a key of another type', async () => {
    const { leaf } = await makeChain()
    const ed = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, [
      'sign',
      'verify',
    ])) as CryptoKeyPair
    const review = await reviewPrivateKey(
      await pkcs8Pem(ed.privateKey),
      leaf.toString('pem'),
    )
    expect(review.match).toBe('mismatch')
    expect(review.detail).toContain('P-256')
  })

  it('cannot check an encrypted key or one it does not recognise', async () => {
    const { leaf } = await makeChain()
    const encrypted =
      '-----BEGIN ENCRYPTED PRIVATE KEY-----\nAAAA\n-----END ENCRYPTED PRIVATE KEY-----'
    expect(
      (await reviewPrivateKey(encrypted, leaf.toString('pem'))).match,
    ).toBe('unverifiable')
    expect((await reviewPrivateKey('hello', leaf.toString('pem'))).match).toBe(
      'unverifiable',
    )
  })

  it('refuses a JWK without a private part', async () => {
    const { leaf, leafKeys } = await makeChain()
    const publicJwk = JSON.stringify(
      await crypto.subtle.exportKey('jwk', leafKeys.publicKey),
    )
    expect(
      (await reviewPrivateKey(publicJwk, leaf.toString('pem'))).match,
    ).toBe('mismatch')
  })
})
