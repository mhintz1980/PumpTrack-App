# Feature Specification: \[Feature Name]

**slug:** \[feature-slug]
**Status:** Draft / In Review / Approved / Implemented
**Date:** YYYY-MM-DD
**Author:** \[Your Name or Alias]

---

## 1. Overview

Provide a concise, high‑level summary of the feature. What problem does it solve? What is the main goal? How does it align with the PumpTrack protocol?

---

## 2. User Stories

Define the feature from the user's perspective. Use the classic *As a \[role] I want \[action] so that \[benefit]* pattern.

* As a **\[User Role]**, I want **\[Action]** so that **\[Benefit]**.
* …

### 2.1 Acceptance Criteria

*(These drive the Test‑Designer agent’s assertions)*

* **AC‑1** GIVEN … WHEN … THEN …
* **AC‑2** …

*(Append `<!-- hidden -->` at the end of any bullet that should become a **hidden‑spec** test.)*

---

## 3. Functional Requirements

Numbered “SHALL” statements make it easy for agents to reference them.

* **FR‑1** The system **SHALL** …
* **FR‑2** The system **SHALL** …
* **FR‑3** The system **SHALL NOT** …

---

## 4. Non‑Functional Requirements

Performance, security, usability, accessibility, etc.

| Category          | Requirement                                |
| ----------------- | ------------------------------------------ |
| **Performance**   | e.g. Initial page load < 200 ms on Node 20 |
| **Accessibility** | WCAG AA                                    |
| **Reliability**   | 99.9 % uptime SLA                          |

---

## 5. Technical Details

### 5.1 Architecture & Components

* Existing components touched:

  * `/src/components/[path]`
  * `/src/services/[path]`
* New components:

  * `/src/components/[new‑component]`

### 5.2 Data Model Changes (Firestore)

| Collection          | Field     | Type     | Description |
| ------------------- | --------- | -------- | ----------- |
| `[Collection Name]` | `[field]` | `string` | …           |

### 5.3 Server Actions

| Action         | Input (type) | Output (type) | File                      |
| -------------- | ------------ | ------------- | ------------------------- |
| `[actionName]` | …            | …             | `/src/services/[file].ts` |

### 5.4 Genkit Flows *(optional)*

Describe flow name, input/output Zod schemas, file path.

### 5.5 UI / Styling

* Use ShadCN components: `[Component]`
* Tailwind classes only; theme via `globals.css`
* No hard‑coded colors—use `bg‑primary`, `text‑foreground`, etc.

### 5.6 Example Input / Expected Output

| Input                | Expected Output |
| -------------------- | --------------- |
| `?status=inProgress` | 12 items        |

---

## 6. Mockups / Wireframes

* \[Link to Figma or image]

---

## 7. Testing Notes

* **Unit tests** → `/__tests__/…/*.spec.ts`
* **Component tests** → `/__tests__/*.component.spec.tsx`
* **E2E (Playwright)** → `/e2e/*.spec.ts`
* Target ≥ 90 % line coverage; seed faker with `faker.seed(42)`.

---

## 8. Open Questions / Future Considerations

* …

---

## 9. Changelog

Add a concise summary to `CHANGELOG.md` following *Keep a Changelog* conventions.

---

> **Remember:** Update **Status**, **Date**, and **slug** as the feature progresses.
