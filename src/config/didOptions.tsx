export const didExamples: Record<string, string> = {
  'did:indy:bcovrin:testnet': 'Example: did:indy:bcovrin:testnet:123abc456xyz',
  'did:indy:indicio:demonet': 'Example: did:indy:indicio:demonet:abc123xyz789',
  'did:indy:indicio:mainnet': 'Example: did:indy:indicio:mainnet:did123example',
  'did:indy:indicio:testnet': 'Example: did:indy:indicio:testnet:xyz987abc654',
  'did:polygon:testnet': 'Example: did:polygon:testnet:0xabcdef123456',
  'did:polygon:mainnet': 'Example: did:polygon:mainnet:0x1234abcd5678',
  'did:key': 'Example: did:key:z6MkfExampleAbc123',
  'did:web': 'Example: did:web:example.com',
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
    id: 'oid',
    title: 'OID',
    desc: 'Use OpenID Connect-based verifiable credential exchange.',
    icon: (
      <img src="/images/oid4vc_logo.png" alt="OID Logo" className="h-10 w-30" />
    ),
  },
]
