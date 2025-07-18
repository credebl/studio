import { JSX } from 'react'

export const ToolTipDataForOrganization = (): JSX.Element => (
  <div className="text-left text-xs">
    <p className="text-base">What is Organization?</p>
    An organization is a participating entity, such as
    <br />a business, institution, or group. Organizations
    <br />
    typically issue and verify some kind of digital
    <br />
    credentials, fostering trust within the digital
    <br />
    ecosystem.
    <br />
    Each organization is uniquely identified by a DID
    <br />
    (Decentralized Identifier), which is verifiable
    <br />
    publicly, thus enhancing the level of trust.
  </div>
)

export const ToolTipDataForSchema = (): JSX.Element => (
  <div className="text-left text-xs">
    <p className="text-base">What is Schema?</p>
    Schema is a machine-readable semantic
    <br />
    structure, a predefined data template
    <br />
    that provides a standard format for the
    <br />
    digital credential contents. Schemas
    <br />
    define attributes that are used in one
    <br />
    or more Credential Definitions.
    <br />
    Schemas are stored on the ledger.
  </div>
)

export const ToolTipDataForCredDef = (): JSX.Element => (
  <div className="text-left text-xs">
    <p className="text-base">What is Credential Definition?</p>
    A Credential Definition is a machine-readable
    <br />
    definition of any Schema or in simple terms,
    <br />a tag created specific to an issuer and Schema.
    <br />
    Credentials are always issued by an issuer
    <br />
    using Cred-Def created by them.
    <br />
    Credential Definitions are stored on the ledger.
  </div>
)
