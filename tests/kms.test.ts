import { describe, expect, it } from 'vitest'

import { kmsBackendLabel } from '../src/lib/kms'

describe('kmsBackendLabel', () => {
  it('maps the known backends', () => {
    expect(kmsBackendLabel('askar')).toBe('Askar')
    expect(kmsBackendLabel('node')).toBe('Node')
    expect(kmsBackendLabel('openbao')).toBe('OpenBao')
    expect(kmsBackendLabel('mixed')).toBe('Mixed')
  })

  it('is case-insensitive', () => {
    expect(kmsBackendLabel('OpenBao')).toBe('OpenBao')
  })

  it('shows a dash when unknown', () => {
    expect(kmsBackendLabel(null)).toBe('—')
    expect(kmsBackendLabel(undefined)).toBe('—')
    expect(kmsBackendLabel('')).toBe('—')
  })

  it('passes an unrecognised value through and ignores prototype keys', () => {
    expect(kmsBackendLabel('hsm')).toBe('hsm')
    expect(kmsBackendLabel('constructor')).toBe('constructor')
  })
})
