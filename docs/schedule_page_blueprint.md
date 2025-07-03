
# PumpTrack – Schedule Page Blueprint (Iteration 6)

*Last updated:* 2025-07-03 05:01 UTC

This document describes the complete technical blueprint for the **Schedule** page used in the PumpTrack web‑app.  
It adheres to the project conventions outlined in `README.md`, `AGENTS.md`, and the MVP checklist.

---

## 1 · High‑level Anatomy (React 18 / Next 15)

```txt
src/
└─ app/
   ├─ layout.tsx                 – <AppLayout>
   │
   ├─ components/
   │   ├─ TopBar/
   │   │   └─ TopBar.tsx         – search ▸ KPI row ▸ AddPump  (RSC)
   │   │
   │   ├─ SideBar/
   │   │   └─ SideBar.tsx        – Filter & Sort buttons + Unscheduled list
   │   │
   │   ├─ PumpCard/
   │   │   └─ PumpCard.tsx       – draggable unscheduled card      (client)
   │   │
   │   ├─ KpiTile/
   │   │   └─ KpiTile.tsx        – Scheduled / In‑Progress tiles   (RSC)
   │   │
   │   ├─ DonutChart/Donut.tsx   – Remaining Qty donut chart       (client)
   │   ├─ PoBars/PoBars.tsx      – Open‑PO progress bars           (client)
   │   └─ Calendar/Calendar.tsx  – Month | Week | Quarter grid     (client)
   │
   └─ ai/
       └─ suggestSchedule.ts     – Genkit action (see §5)
```

* **RSC by default** – Components become `"use client"` **only** when they need interactivity (drag‑n‑drop, charts, filter modals).

---

## 2 · Tailwind / CVA Design Tokens

| Token | HEX (light) | HEX (dark) (current) | Purpose |
|-------|-------------|----------------------|---------|
| `canvas`            | `#F5F8FD` | `#071723` | Body background |
| `surface`           | `#FFFFFF` | `#0D2437` | Cards & panels |
| `border-default`    | `#D4D9E4` | `#1C3347` | Grid lines |
| `text-primary`      | `#091A2A` | `#E2ECF7` | Main copy |
| `primary`           | `#0061FF` | `#0070F3` | Buttons, active pills |
| `accent`            | `#FFB445` | `#FFC860` | Highlight / donut slice |

> Full dual‑mode palette lives in `docs/theme-tokens.md`.

All atoms use **class‑variance‑authority** with a `variant` prop (`default | muted | danger`).

---

## 3 · Prop & State Contracts (Zod‑validated)

```ts
// lib/schemas.ts
export const PumpSchema = z.object({{
  id:        z.string(),
  model:     z.string(),
  customer:  z.string(),
  priority:  z.enum(['low','med','high']).default('med'),
  status:    z.enum(['unscheduled','scheduled','inProgress','delayed']),
  poNumber:  z.string().optional(),
  schedule:  z.object({{ start:z.date(), end:z.date() }}).optional(),
}});
export type Pump = z.infer<typeof PumpSchema>;
```

### `PumpCard` props

```ts
interface PumpCardProps {{
  pump: Pump;
  onSchedule?: (range:{{s:Date; e:Date}}) => void;
  isDragging?: boolean;
}}
```

### `Calendar` props

```ts
interface CalendarProps {{
  view: 'month' | 'week' | 'quarter';
  pumps: Pump[];          // scheduled only
  filteredIds: string[];  // grey these
  onDragEnd: (id:string, s:Date, e:Date) => void;
}}
```

---

## 4 · Firestore Shape & React‑Query Hooks

```txt
/pumps/{{pumpId}}
  model        "RL200"
  customer     "Ring Power"
  priority     "high"
  status       "scheduled"
  poNumber     "MSP-JN-1004"
  schedule {{
      start   Timestamp
      end     Timestamp
  }}
```

```ts
export const usePumps = () =>
  useFirestoreQuery<Pump[]>(['pumps'], q(collection(db,'pumps')));

export const useMutatePump = () =>
  useFirestoreDocumentMutation<Pump>(doc(db,'pumps', id));
```

---

## 5 · Genkit AI Action

```ts
// src/ai/suggestSchedule.ts
export const suggestSchedule = defineAction({{
  name: 'suggestSchedule',
  input: PumpSchema,
  output: z.object({{ start:z.date(), end:z.date() }}),
  async handler(pump) {{
    // call LLM / heuristic here
  }}
}});
```

*Triggered via PumpCard kebab → “Auto‑Schedule”.*

---

## 6 · Drag‑and‑Drop Wiring

| Element         | Role | DnD type |
|-----------------|------|----------|
| `PumpCard`      | **source** | `"PUMP"` |
| `CalendarDay`   | **target** | `"PUMP"` |

* Library: `react-dnd` + HTML5 backend (already in `package.json`).  
* On drop → convert pointer cell ➜ `start`/`end` → call `onDragEnd`.

---

## 7 · Accessibility

* All actionable icons have `aria-label`.  
* PumpCard drag handle focusable (`Space` pick up, `Enter` drop).  
* Tab order: Filter → Sort → AddPump → KPI tiles → charts → calendar grid.  
* Contrast meets WCAG AA in both themes.

---

## 8 · Testing Checklist

| Test name | Scenario |
|-----------|----------|
| `dragSchedule.test.tsx` | Card dragged from sidebar to calendar; Firestore updated. |
| `overlapGuard.test.tsx` | Prevent scheduling if slot already occupied. |
| `filterView.test.tsx`   | Filter hides unscheduled + greys scheduled. |

Run **`pnpm lint && pnpm test && pnpm typecheck`** pre‑commit.

---

## 9 · Branch & Deployment

* Work on branch **`code/schedule-page`**.  
* PR against `main` → GitHub action runs lint/test/typecheck → Cloud Build deploys preview to Firebase Hosting **channel `pr-<id>`**.

---

> **Hand‑off complete.**  
> Save this file as `docs/schedule-page-blueprint.md` or share directly with an AI coding assistant.
