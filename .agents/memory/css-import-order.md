---
name: CSS import order
description: Google Fonts @import must precede Tailwind @imports in index.css
---

## Rule

In `artifacts/nexora/src/index.css`, the `@import url('https://fonts.googleapis.com/...')` line MUST be the very first line, before `@import "tailwindcss"` and `@import "tw-animate-css"`.

**Why:** PostCSS/Tailwind v4 enforces that `@import` rules precede all other statements. Putting Google Fonts after Tailwind imports causes a PostCSS error: `@import must precede all other statements`.

**How to apply:** Any time you add an external font @import to index.css, place it at the top before all framework imports.
