# SciSpark — product concept

## What it is

**SciSpark** is a **visual science and math board** for learners roughly **ages 6–14**. You describe an idea in plain language (for example, “how wind blows” or “why Earth goes around the Sun”), and the app tries to build a **small interactive scene** on a canvas—not a long essay or a generic chat reply.

The product direction is a **Concept Canvas**: ideas take shape as **composed visuals** (a “living diorama” mindset) rather than as disconnected icons on a blank page.

---

## The problem it addresses

- Many explanations rely on **walls of text** or abstract wording, which are hard to map to intuition.
- Static diagrams can feel like **symbol soup**—shapes that don’t connect to a story or a sequence.
- Young learners often need **spatial, sequential, and visual** cues: where things are, what moves first, what happens next.

SciSpark is built around the bet that **a structured visual scene plus a short narrative** teaches better than either alone.

---

## Core concept: primitives, not one-off art

Every scene is made from a **library of reusable blocks** (primitives), not custom illustrations per topic:

| Kind of primitive | Role (informal) | Examples in the app |
|-------------------|-----------------|---------------------|
| **Shapes & bodies** | “Things” | Sun, planet, pie chart, geometric shapes |
| **Motion** | “What moves / how” | Orbits, arrows, falling objects, animated flows |
| **Fields & flow** | “Regions and currents” | Warm/cool blobs, waves, flow ribbons, radiation bursts |
| **Connectors & sequence** | “Relationships and order” | Springs, step chains |
| **Particles & structure** | “Many small parts” | Dot swarms, grids |
| **Containers** | “Boundaries and paths” | Lesson frames, tubes, barriers |
| **Notes** | “Words on the board” | Sticky-style text notes |

The **AI’s job** is to **choose and arrange** these blocks, set labels and colors, and align them with **short explanation sentences**. The **learner’s job** is to ask, read, scrub steps, and optionally **drag, zoom, draw, and add notes** on the same board.

---

## How a session feels (user journey)

1. **Ask** — Type a question or topic (prominently via the bottom prompt bar).
2. **See a scene** — The system returns a **simulation spec**: a title, optional **backdrop** (world layer), a list of **blocks** with positions, and **explanation steps** for the story.
3. **Follow the story** — A **story step** control walks through `explanationSteps`. Blocks can **appear in order** (`showFromStep`) so the board reveals one idea at a time.
4. **Explore** — Drag grouped lessons, open the **block palette** to add more pieces, **write notes**, use the **whiteboard** tools, and **zoom** the board.
5. **Iterate** — Ask follow-up questions; the teacher panel keeps a **short transcript** of the conversation.

---

## Three layers of a “concept scene” (product vision)

These map directly to product behavior:

1. **Background (world)** — Optional **backdrop** behind the grid (e.g. sky and ground for weather, dark space for orbits). It answers: *where are we?*
2. **Motion and mechanism (verbs)** — Blocks that **animate** or **read as flow** (waves, ribbons, blobs, arrows, orbits). It answers: *what’s happening?*
3. **Step narrative** — **Explanation steps** plus **progressive reveal** tie the visuals to a sequence. It answers: *in what order should I understand this?*

---

## Who it’s for

- **Primary:** Kids and young teens exploring science and math concepts with a parent, teacher, or on their own.
- **Secondary:** Anyone who wants a **quick visual explanation** without building slides manually.

---

## What makes it different from “another AI chat”

- **Structured output:** The model is constrained to emit **JSON** that matches a schema (title, steps, blocks, optional backdrop)—not free-form tutoring text as the main artifact.
- **Visual first:** The **canvas is the answer**; chat supports and contextualizes it.
- **Hands-on board:** The same surface supports **AI-generated layout** and **human editing** (palette, notes, drawing).
- **Composable pedagogy:** System instructions push **one group per lesson**, **labeled arrows**, **frames behind clusters**, and **steps that match blocks**—so scenes read as stories, not sticker sheets.

---

## Technical shape (high level)

- **Frontend:** Next.js app; main experience is `SciSparkShell` (palette, canvas, teacher sidebar, bottom prompt).
- **Spec:** `SimulationSpec` — validated with Zod (`simulation-schema.ts`); blocks are positioned in **percent** of the stage for responsive layout.
- **AI:** `POST /api/scispark` → `generateSimulationFromQuestion()`; **system prompt** + user message (+ history); response parsed and validated. If no API key or errors, **built-in demos** can supply a spec.
- **Prompts:** Described in [`scispark-visual-prompts.md`](./scispark-visual-prompts.md).

---

## Scope and honesty

- Quality depends on the **model following the prompt** and on **block coverage** for a topic. Some questions will still look sparse until primitives and rules improve.
- The app is **not** a full simulation engine (no arbitrary physics); it is a **visual language** plus **light animation** to support explanation.

---

## Related documents

| Document | Purpose |
|----------|---------|
| [`scispark-visual-prompts.md`](./scispark-visual-prompts.md) | Exact teaching rules and block list sent to the AI |
| `src/lib/scispark/simulation-schema.ts` | Data shape for scenes |
| `src/lib/scispark/block-catalog.ts` | Palette categories and block metadata |

---

## One-line pitch

**SciSpark turns questions into small, explorable visual lessons—built from reusable blocks, guided by story steps, on a board you can actually touch.**
