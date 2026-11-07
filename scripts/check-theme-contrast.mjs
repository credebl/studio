#!/usr/bin/env node
/**
 * Checks the WCAG contrast of the themes given as arguments (every theme in public/themes when none are given).
 *
 *   node scripts/check-theme-contrast.mjs [public/themes/credebl_theme.css ...]
 *
 * Text pairs must reach 4.5:1 (AA). Form control outlines and focus rings must reach 3:1. Decorative separators
 * (--border) are not checked. Only hex colors are read; a theme that leaves a token unset inherits it from
 * credebl_theme.css, so partial themes are checked against that base.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const THEMES_DIR = 'public/themes'
const BASE_THEME = 'credebl_theme.css'

function parseBlock(css, selector) {
  const start = css.indexOf(`${selector} {`)
  if (start === -1) {
    return {}
  }
  const end = css.indexOf('\n}', start)
  const body = css.slice(start, end)
  const vars = {}
  for (const [, name, value] of body.matchAll(
    /--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g,
  )) {
    vars[name] = value.toLowerCase()
  }
  return vars
}

const channel = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
const toHex = (rgb) =>
  `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

function luminance(hex) {
  const [r, g, b] = [0, 1, 2].map((i) => {
    const c = channel(hex, i) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** CSS `color-mix(in srgb, top pct%, bottom)`. */
function mix(top, pct, bottom) {
  return toHex(
    [0, 1, 2].map(
      (i) => (channel(top, i) * pct + channel(bottom, i) * (100 - pct)) / 100,
    ),
  )
}

function checksFor(t) {
  const checks = []
  const text = (label, fg, bg) => checks.push({ label, fg, bg, min: 4.5 })
  const ui = (label, fg, bg) => checks.push({ label, fg, bg, min: 3 })

  for (const surface of ['card', 'popover', 'secondary', 'accent', 'sidebar']) {
    text(
      `${surface}-foreground on ${surface}`,
      t[`${surface}-foreground`],
      t[surface],
    )
  }
  text('foreground on background', t.foreground, t.background)
  text(
    'sidebar-primary-foreground on sidebar-primary',
    t['sidebar-primary-foreground'],
    t['sidebar-primary'],
  )
  text(
    'sidebar-accent-foreground on sidebar-accent',
    t['sidebar-accent-foreground'],
    t['sidebar-accent'],
  )
  for (const bg of ['background', 'card', 'muted']) {
    text(`muted-foreground on ${bg}`, t['muted-foreground'], t[bg])
  }

  for (const name of ['primary', 'destructive', 'success', 'warning', 'info']) {
    text(`${name}-foreground on ${name}`, t[`${name}-foreground`], t[name])
    text(`${name} as text on background`, t[name], t.background)
    text(`${name} as text on card`, t[name], t.card)
  }

  // Tinted status surfaces used by alerts, badges and status chips (see globals.css).
  for (const name of ['success', 'warning', 'destructive', 'info']) {
    const alertBg = mix(t[name], 14, t.background)
    text(`alert text on ${name} tint`, mix(t[name], 80, t.foreground), alertBg)
    text(
      `foreground on ${name} badge`,
      t.foreground,
      mix(t[name], 18, t.background),
    )
  }

  ui('input outline on background', t.input, t.background)
  ui('input outline on card', t.input, t.card)
  ui('focus ring on background', t.ring, t.background)
  ui('sidebar focus ring on sidebar', t['sidebar-ring'], t.sidebar)
  return checks
}

const files =
  process.argv.length > 2
    ? process.argv.slice(2)
    : readdirSync(THEMES_DIR)
        .filter((f) => f.endsWith('_theme.css'))
        .map((f) => join(THEMES_DIR, f))

const base = readFileSync(join(THEMES_DIR, BASE_THEME), 'utf8')
const baseModes = {
  light: parseBlock(base, ':root'),
  dark: parseBlock(base, '.dark'),
}

let failures = 0
for (const file of files) {
  const css = readFileSync(file, 'utf8')
  const modes = {
    light: parseBlock(css, ':root'),
    dark: parseBlock(css, '.dark'),
  }
  for (const mode of ['light', 'dark']) {
    const tokens = { ...baseModes[mode], ...modes[mode] }
    const missing = [
      'background',
      'foreground',
      'primary',
      'input',
      'ring',
    ].filter((k) => !tokens[k])
    if (missing.length) {
      console.error(`${file} [${mode}] is missing: ${missing.join(', ')}`)
      failures++
      continue
    }
    let worst = Infinity
    for (const { label, fg, bg, min } of checksFor(tokens)) {
      if (!fg || !bg) {
        console.error(`${file} [${mode}] ${label}: token not set`)
        failures++
        continue
      }
      const ratio = contrast(fg, bg)
      worst = Math.min(worst, ratio)
      if (ratio < min) {
        console.error(
          `FAIL ${file} [${mode}] ${label}: ${ratio.toFixed(2)}:1 (needs ${min}:1)  ${fg} on ${bg}`,
        )
        failures++
      }
    }
    console.log(`${file} [${mode}] lowest ratio ${worst.toFixed(2)}:1`)
  }
}

if (failures) {
  console.error(`\n${failures} contrast problem(s).`)
  process.exit(1)
}
console.log('\nAll theme contrast checks passed.')
