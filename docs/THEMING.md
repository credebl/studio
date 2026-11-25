# Theming Studio

Studio's colors come from CSS variables ("tokens") defined in `public/themes/<name>_theme.css`. The default theme is
`credebl_theme.css`. It has a light palette (`:root`) and a dark palette (`.dark`), which `next-themes` switches by
adding the `dark` class to `<html>`.

## The CREDEBL palette

The brand colors are taken from the CREDEBL logo:

| Brand color | Hex       | Use                                                                           |
| ----------- | --------- | ----------------------------------------------------------------------------- |
| Blue        | `#1f4ead` | Light mode primary: buttons, links, focus ring (7.6:1 on white)               |
| Cyan        | `#25afe1` | Dark mode highlight, focus ring and info color (7.4:1 on the dark background) |

Two constraints shape the dark theme:

- The raw brand blue is only 2.4:1 on a dark background, so dark mode uses a lightened tint of it (`#5b8cf0`) for the
  primary color.
- The cyan is 2.5:1 on white, so it is never used for text, icons or focus rings in light mode.

## Tokens

Use tokens through the Tailwind utilities (`bg-card`, `text-muted-foreground`, `border-border`, `text-success`, ...).
Do not use raw palette classes such as `text-gray-700` or `bg-green-100`, and do not hard-code hex values in
components: they do not follow the theme and are the usual cause of unreadable text in dark mode.

| Token                                                         | Meaning                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `background`, `foreground`                                    | Page background and default text                                         |
| `card`, `popover` (+ `-foreground`)                           | Raised surfaces and their text                                           |
| `primary` (+ `-foreground`)                                   | Main actions, links, active navigation                                   |
| `secondary`, `muted`, `accent`                                | Quiet surfaces. `muted-foreground` is the secondary text color           |
| `destructive`, `success`, `warning`, `info` (+ `-foreground`) | Status colors. Each has a foreground for text on top of it               |
| `border`                                                      | Decorative separators (cards, dividers)                                  |
| `input`                                                       | Outline of form controls. Stronger than `border` so controls are visible |
| `ring`                                                        | Keyboard focus ring                                                      |
| `sidebar-*`                                                   | The sidebar's own set of the above                                       |
| `chart-1` ... `chart-5`                                       | Data visualization series                                                |

Status badges, chips and alerts use the classes in `src/app/globals.css` (`badges-*`, `status-*`, `success-alert`,
`failure-alert`). They mix the status token into the background, so they work in both modes.

## Contrast

Run the check after changing a theme:

```bash
pnpm check:theme
```

It reads `public/themes/credebl_theme.css` and checks, for light and dark:

- Every text and background pair: at least 4.5:1 (WCAG AA).
- Form control outlines and focus rings: at least 3:1.
- Status tints used by alerts and badges.

Decorative `--border` values are not checked. To check another theme, pass its path:
`node scripts/check-theme-contrast.mjs public/themes/my_theme.css`.

## Adding your own theme

1. Copy `public/themes/credebl_theme.css` to `public/themes/<name>_theme.css` and change the values. A theme only needs to
   set the variables it changes; the rest are inherited from the CREDEBL theme.
2. Run `node scripts/check-theme-contrast.mjs public/themes/<name>_theme.css`.
3. Select it with `NEXT_PUBLIC_ACTIVE_THEME=<name>`, or at runtime with the `active_theme` cookie. Available themes are
   listed by `/api/themes`.

The logo and favicon follow the theme name too: add `public/logos/<name>_logo.svg`, `public/logos/<name>_logo_dark.svg`
and `public/favicons/favicon-<name>.ico`. If you reuse the CREDEBL name or logo, make sure you are allowed to.
