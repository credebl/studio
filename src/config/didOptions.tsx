const MODE = process.env.MODE || ''

export const didExamples: Record<string, string> = {
  'did:indy:bcovrin:testnet': 'did:indy:bcovrin:testnet:123abc456xyz',
  'did:indy:indicio:demonet': 'did:indy:indicio:demonet:abc123xyz789',
  'did:indy:indicio:mainnet': 'did:indy:indicio:mainnet:did123example',
  'did:indy:indicio:testnet': 'did:indy:indicio:testnet:xyz987abc654',
  'did:polygon:testnet': 'did:polygon:testnet:0xabcdef123456',
  'did:polygon:mainnet': 'did:polygon:mainnet:0x1234abcd5678',
  'did:key': 'did:key:z6MkfExampleAbc123',
  'did:web': 'did:web:example.com',
}

export const protocolOptions = [
  {
    id: 'didcomm',
    title: 'DIDComm',
    desc: 'Use decentralized identifiers for peer-to-peer verifiable communication.',
    icon: (
      <img
        src="/images/didcomm-logo.png"
        alt="DIDComm Logo"
        className="h-14 w-16"
      />
    ),
  },
  {
    id: 'oid4vc',
    title: 'OID4VC',
    desc: 'Use OpenID Connect-based verifiable credential exchange.',
    icon: (
      <img
        src="/images/oid4vc_logo.png"
        alt="OID4VC Logo"
        className="h-10 w-30"
      />
    ),
  },
]

export const subOptionsMap = {
  didcomm: [
    {
      id: 'anoncreds',
      title: 'AnonCreds',
      desc: 'Privacy-preserving credentials issued over DIDComm.',
      tooltip:
        'AnonCreds enables privacy-preserving credentials using ZK proofs.',
    },
    {
      id: 'w3c',
      title: 'W3C VCDM',
      desc: 'W3C Verifiable Credentials compatible with DIDComm transport.',
      tooltip: 'W3C VCDM defines interoperable verifiable credentials.',
    },
  ],

  oid4vc: [
    {
      id: 'mdoc',
      title: 'MDOC',
      desc: 'Mobile Document (ISO/IEC 18013-5) via OID4VC.',
      tooltip: 'MDOC follows ISO/IEC mobile identity standard.',
    },
    {
      id: 'sdjwt',
      title: 'SD-JWT',
      desc: 'Selective Disclosure JWT-based credentials for OID4VC.',
      tooltip: 'SD-JWT supports selective disclosure with JWT format.',
    },
  ],
}

export const didOptionsMap: Record<string, string[]> = {
  anoncreds: [
    'did:indy:bcovrin:testnet',
    'did:indy:indicio:demonet',
    'did:indy:indicio:mainnet',
    'did:indy:indicio:testnet',
  ],

  w3c: [
    'did:polygon:testnet',
    ...(MODE === 'PROD' ? ['did:polygon:mainnet'] : []),
    'did:key',
    'did:web',
  ],
}
