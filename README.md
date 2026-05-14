# FAST-ener

**LGS Self-Drilling Fastener Selection Engine**

[![CI](https://github.com/cohenxx/fast-ener/actions/workflows/ci.yml/badge.svg)](https://github.com/cohenxx/fast-ener/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/tests-17%20passing-4ade80?logo=vitest&logoColor=white)](#tests)
[![License](https://img.shields.io/badge/license-MIT-94a3b8)](LICENSE)
[![Zero runtime deps](https://img.shields.io/badge/runtime%20deps-0-f59e0b)](#architecture)

---

Specifying self-drilling screws for light-gauge steel assemblies means cross-referencing drill-point capacity tables, computing a minimum-length formula per SAE J78, and then manually hunting the correct part number across a supplier catalog — every time the substrate gauge or attachment stack changes. FAST-ener replaces that workflow with a real-time selection engine: configure the attachment stack once, and every qualifying fastener surfaces instantly, sorted by length, with the code-minimum shown alongside each result.

The app is a fully static SPA with no backend, no network calls at runtime, and no external API keys. It can be cloned, built, and deployed to GitHub Pages in under two minutes.

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⚡ FAST-ener  LGS Self-Drilling Fastener Selection Engine                   │
│                              IBC / AISI S100 · ASTM C955  McMaster-Carr     │
├──────────────────────┬──────────────────────────────────────────────────────┤
│  ATTACHMENT LAYERS   │   CROSS-SECTION PREVIEW                              │
│  Layer 1 = outermost │                                                       │
│ ┌──────────────────┐ │  ░░░░░░░░░░░  1. Polyiso / Foam · 2.000"  ░░░░░░░   │
│ │1│ Polyiso / Foam ▼│ │  ▓▓▓  ⬡ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ▓▓▓  │        │
│ │  [1/2"] [1"] [2"] │ │  ▒▒▒▒▒▒▒▒▒▒▒  2. Steel (LGS) · 0.033"  ▒▒▒▒▒▒▒   │
│ │  [1-1/2"][3"] [4"]│ │  ┌────────────────────────────────────┐            │
│ │  [2.000    ✓] in. │ │  │▓▓▓▓▓▓   LGS Stud  18 ga  0.048"  │            │
│ └──────────────────┘ │  │                                    │            │
│  [+ Add Layer]        │  └────────────────────────────────────┘            │
│                       │                ↕ Stack 2.081"                       │
│  SUBSTRATE GAUGE      ├──────────────────────────────────────────────────────┤
│  [ 25 ga  ]           │  MATCHING FASTENERS                            8    │
│  [ 20 ga  ]           │  Part #      Thread  Length  Min. L  Head/Drive     │
│  [▶ 18 ga ◀]          │  92198A169   #10-16  2.00"   1.54"   Pan/Phillips   │
│  [ 16 ga  ]           │  90926A025   #10-16  2.00"   1.54"   Pan/Phillips   │
│  [ 14 ga  ]           │  ...                                                 │
│  [ 12 ga  ]           │                                                      │
│                       │                                                      │
│  ENVIRONMENT          │                                                      │
│  [Interior][Exterior] │                                                      │
├───────────────────────┴──────────────────────────────────────────────────────┤
│  FAST-ener v1.1  ·  Static SPA · Zero network deps  ·  L ≥ TMT+Pt+3/TPI    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Features

- **Multi-layer attachment stack** — add foam, gypsum, OSB/plywood, and LGS attachment layers in any order; re-order or remove them with drag-style up/down controls
- **Live cross-section preview** — proportional SVG rendering at 40 px/in; screw head type (Hex Washer vs Pan) switches automatically based on the outermost layer material; drill point and shaft track actual fastener geometry
- **SAE J78 minimum-length formula** — `L_min = totalStack + drillPointLength + 3/TPI`; each result row shows the computed floor so you can see the actual code margin
- **Drill-point capacity gate** — only steel layers count toward total metal thickness (TMT); non-steel materials (gypsum, foam, wood) are excluded from the TMT gate per ASTM C1513
- **Head exclusion logic** — gypsum and foam outermost layers automatically suppress Hex Washer Head results, which crush the paper face / punch through soft materials
- **Exterior / corrosive environment mode** — limits results to 410 Stainless Steel per IBC corrosion exposure requirements
- **155-entry McMaster-Carr catalog** — thread sizes #6–#14, Point 2 / Point 3, Zinc-Plated and 410 SS, lengths 3/8" to 10", Hex Washer / Pan Phillips / Flat Torx drive types
- **Deep McMaster links** — every result row links directly to the part-number search on McMaster-Carr
- **Custom thickness input** — type any value; drawing and results update only after you press ✓ or Enter; input stays highlighted amber while a pending change is uncommitted
- **10" attachment cap** — Add Layer is disabled and individual presets are greyed out once the stack total reaches the 10" practical limit
- **Zero runtime dependencies** — static SPA; the entire app is `dist/index.html` + hashed JS/CSS bundles

---

## Engineering Logic

### Total Metal Thickness (TMT) and Drill-Point Gate

The drill point must physically penetrate all steel in the connection. Only steel layers count — non-metallic materials compress and don't resist the point tip.

```
steelTMT = Σ(steel attachment layers) + substrateThickness

DRILL_POINT_MAX[drillPoint][threadSize]  ≥  steelTMT          ← Gate 1
```

| Thread | Point #2 max | Point #3 max |
|--------|-------------|-------------|
| #6     | 0.190″      | 0.220″      |
| #8     | 0.211″      | 0.251″      |
| #10    | 0.235″      | 0.300″      |
| #12    | 0.283″      | 0.353″      |
| #14    | 0.318″      | 0.393″      |

*Source: ASTM C1513 / SST reference tables*

### Minimum Fastener Length (SAE J78)

The screw must span the entire stack — including non-steel layers — and provide thread engagement past the substrate back face.

```
L_min = totalStack + drillPointLength + (3 / TPI)
```

| Thread | TPI | 3-thread engagement |
|--------|-----|---------------------|
| #6     | 20  | 0.150″              |
| #8     | 18  | 0.167″              |
| #10    | 16  | 0.188″              |
| #12    | 14  | 0.214″              |
| #14    | 14  | 0.214″              |

*Source: SAE J78-2013 BSD (Spaced Thread) TPI table*

### Result Filtering

Results are sorted ascending by length and capped at the two shortest distinct catalog lengths — the minimum-compliant selection plus one step up. Anything longer would be structural overkill for the joint.

---

## Architecture

| Decision | Choice | Rationale |
|---|---|---|
| **Rendering** | Static SPA — Vite 5 + React 18 + SWC | Ships as HTML/JS/CSS with no server; trivially deployable to any CDN or GitHub Pages |
| **Data model** | Single-source TypeScript objects | Type-safe at compile time; zero runtime fetch latency; catalog errors caught at build |
| **Calculation engine** | Pure functions — no side effects | Fully unit-testable, referentially transparent, wrappable in `useMemo` with no stale-closure risk |
| **Styling** | Tailwind CSS v4 (CSS-first `@import`) | Utility-first; zero unused CSS via JIT; no PostCSS config required |
| **Testing** | Vitest — co-located with source | Native Vite integration; sub-2 s test runs with no extra bundler config |
| **SVG preview** | Inline, imperative geometry at 40 px/in | No SVG library dependency; all geometry is deterministic from the layer data |

---

## Project Structure

```
src/
├── types/
│   └── index.ts              Fastener, AttachmentLayer, FastenerResult interfaces
├── data/
│   ├── gauges.ts             Trade gauge → decimal-inch lookup (8 gauges, IBC/AISI aligned)
│   ├── attachments.ts        Material definitions — presets, head exclusions, warnings
│   ├── fasteners.ts          McMaster-Carr catalog — 155 entries, #6–#14, 3/8″–10″
│   └── drillPoints.ts        Point #2 / #3 capacity matrix + SAE J78 TPI table
├── utils/
│   ├── lgsEngine.ts          Pure filter + sort engine (zero side effects)
│   └── lgsEngine.test.ts     Vitest suite — 17 tests, all filter rules and edge cases
└── components/
    ├── InputPanel.tsx         Attachment stack editor, gauge selector, environment toggle
    ├── CrossSection.tsx       Inline SVG cross-section renderer (40 px/in scale)
    └── ResultsTable.tsx       Results table — thread/TPI, length, computed Min. L, McMaster links
```

---

## Tests

```bash
npx vitest run     # single-pass, 17 tests, ~2 s
npx vitest         # watch mode
```

Test coverage includes:

- SAE J78 minimum-length formula correctness for each drill point / thread combination
- Drill-point capacity gate rejects fasteners where `DRILL_POINT_MAX < steelTMT`
- Non-steel materials excluded from TMT gate, included in total stack for length
- Head-type exclusion: Hex Washer Head suppressed for gypsum and foam outer layers
- Outdoor mode returns 410 SS only
- Multi-layer: head type follows `layers[0]` (outermost), not inner layers
- Results capped at two shortest distinct catalog lengths
- Field-validated formula numerics: `#10-16 Pt3 → drillPointLength=0.300, engagement=0.1875`

---

## Getting Started

```bash
git clone https://github.com/cohenxx/fast-ener.git
cd fast-ener
npm install
npm run dev        # → http://localhost:5173
```

**Build for production**

```bash
npm run build      # type-check → bundle → dist/
npm run preview    # serve the production build locally
```

**Deploy to Vercel** *(recommended)*

1. Push to GitHub (public repo)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Vercel auto-detects Vite — accept the defaults and click **Deploy**

Every subsequent `git push` to `master` redeploys automatically.

---

## Catalog

The fastener catalog (`src/data/fasteners.ts`) covers the cross-product of:

| Dimension | Values |
|-----------|--------|
| Thread size | #6, #8, #10, #12, #14 |
| Drill point | Type 2 (≤ 18 ga steel), Type 3 (up to 12 ga / 1/4″ structural) |
| Material | Zinc-Plated Steel (interior), 410 Stainless Steel (exterior) |
| Head / drive | Hex Washer Head, Pan Head Phillips, Flat Head Torx |
| Lengths | 3/8″ – 10″ (21 catalog sizes) |

Part numbers follow the McMaster-Carr 92198A (zinc) and 90926A (410 SS) self-drilling series. Verify current availability and pricing at [mcmaster.com](https://www.mcmaster.com) before specifying for construction.

---

## Standards Reference

| Standard | Scope |
|----------|-------|
| **SAE J78-2013** | Self-drilling tapping screws — BSD thread form, TPI table, minimum-length formula |
| **ASTM C1513** | Standard Specification for Steel Tapping Screws for Cold-Formed Steel Framing Connections |
| **ASTM C955** | Load-Bearing (Transverse and Axial) Steel Studs, Runners (Tracks), and Bracing or Bridging |
| **AISI S100** | North American Specification for the Design of Cold-Formed Steel Structural Members |
| **IBC 2021** | International Building Code, Chapter 22 — Steel; Table 2211.1.2 corrosion protection |

---

## License

[MIT](LICENSE) — free to use, modify, and redistribute.
