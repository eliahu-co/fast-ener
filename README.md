# FAST-ener

**LGS Self-Drilling Fastener Selection Engine**

A static, zero-dependency single-page application for structural engineers and BIM managers working with Light Gauge Steel (LGS) framing. Select the correct self-drilling screw for any steel-to-steel connection in real time — no backend, no API calls, no build-time data pipeline.

---

## Architecture Overview

| Decision | Choice | Rationale |
|---|---|---|
| **Rendering** | Static SPA — Vite 5 + React 18 + SWC | Ships as pure HTML/JS/CSS; deployable to any CDN or GitHub Pages |
| **Data model** | Single-source TypeScript objects | Type-safe at compile time, zero runtime fetch latency |
| **Calculation engine** | Pure functions — no side effects | Fully unit-testable, referentially transparent, memoizable |
| **Styling** | Tailwind CSS v4 (CSS-first `@import`) | Utility-first with zero unused CSS via JIT; no config file |
| **Testing** | Vitest — co-located with source | Native Vite integration, sub-2s test runs |

---

## Engineering Logic

### Total Metal Thickness (TMT)

```
TMT = t_attachment + t_substrate
```

`t_substrate` is resolved from the gauge lookup map aligned to IBC / AISI C955 nominal base metal thickness values.

### Drill Point Capacity Constraint

Each self-drilling fastener carries a drill point designation. The point's rated maximum penetration capacity must meet or exceed the full TMT:

```
DRILL_POINT_MAX[drillPoint][threadSize] ≥ TMT
```

| Thread | Point #2 Max | Point #3 Max |
|--------|-------------|-------------|
| #6     | 0.190"      | 0.220"      |
| #8     | 0.211"      | 0.251"      |
| #10    | 0.235"      | 0.300"      |
| #12    | 0.283"      | 0.353"      |
| #14    | 0.318"      | 0.393"      |

### Minimum Fastener Length — Thread Engagement Rule

Per AISI S100 / industry standard thread engagement practice:

```
L_min = t_attachment + t_substrate + 0.25"
```

The 0.25" margin ensures a minimum of three full thread engagements past the substrate flange after full drive.

### Corrosion Environment Filter

Outdoor or corrosive environments require 410 Stainless Steel exclusively. Zinc-plated steel is excluded when the `isOutdoor` flag is active.

---

## UI Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  ⚡ FAST-ener          LGS Self-Drilling Fastener Selection Engine    │
├──────────────────┬───────────────────────────────────────────────────┤
│                  │                                                    │
│  Attachment      │        SVG Cross-Section  (1" = 300 px)           │
│  Thickness       │   ┌──────────────────────────────┐                │
│  ──────────○──   │   │▓▓▓▓  Attachment  t=x.xxx"  ▓▓│               │
│  0.033"          │   ├──────────────────────────────┤                │
│                  │   │░░░  LGS Stud  18ga  0.048"  ░│               │
│  Substrate Gauge │   └──────────────────────────────┘                │
│  ┌────────────┐  │         ↑ screw: head / shaft / drill point       │
│  │ 25 ga      │  │                                                    │
│  │ 20 ga (DW) │  ├───────────────────────────────────────────────────┤
│  │ 20 ga (ST) │  │  MATCHING FASTENERS                    N results  │
│  │▶ 18 ga  ◀  │  │  Part #    Thread  Length  Drive  Material    ↗   │
│  │ 16 ga      │  │  92198A248  #10    1.00"   HWH    Zinc-Plated  →  │
│  └────────────┘  │  90926A020  #10    1.00"   PHP    410 SS       →  │
│                  │  ...                                               │
│  [Indoor / Dry]  │                                                    │
└──────────────────┴───────────────────────────────────────────────────┘
```

---

## Gauge Reference

| Trade Gauge          | Decimal Thickness |
|----------------------|-------------------|
| 25 ga                | 0.021"            |
| 20 ga (Drywall)      | 0.033"            |
| 20 ga (Structural)   | 0.036"            |
| 18 ga                | 0.048"            |
| 16 ga                | 0.060"            |
| 14 ga                | 0.075"            |
| 12 ga                | 0.105"            |
| 1/8 in Structural    | 0.125"            |

---

## Project Structure

```
src/
├── types/
│   └── index.ts            TypeScript interfaces — Fastener, ThreadSize, Material…
├── data/
│   ├── gauges.ts           Gauge name → decimal-inch lookup map (8 entries)
│   ├── fasteners.ts        Static fastener catalog — 18 McMaster-Carr entries
│   └── drillPoints.ts      Point #2 / #3 max-capacity matrix by thread size
├── utils/
│   ├── lgsEngine.ts        Pure filter + sort function (zero side effects)
│   └── lgsEngine.test.ts   Vitest suite — 6 tests covering all filter rules
└── components/
    ├── InputPanel.tsx      Left panel — thickness slider, gauge buttons, env toggle
    ├── CrossSection.tsx    Inline SVG cross-section renderer (scale: 1" = 300px)
    └── ResultsTable.tsx    Recommendation table with live McMaster-Carr deep links
```

---

## Installation

```bash
git clone <repo-url>
cd fast-ener
npm install
npm run dev        # http://localhost:5173
```

## Tests

```bash
npx vitest run     # single pass — all 6 tests
npx vitest         # watch mode
```

## Build

```bash
npm run build      # type-check + bundle → dist/
npm run preview    # serve production build locally
```

---

## Standards Reference

- **AISI S100** — North American Specification for the Design of Cold-Formed Steel Structural Members
- **ASTM C955** — Standard Specification for Load-Bearing Steel Studs, Runners (Tracks), and Bracing or Bridging
- **IBC 2021** — International Building Code, Chapter 22 (Steel)
- **McMaster-Carr** — Self-drilling fastener catalog: 92198A series (zinc), 90926A series (410 SS)
