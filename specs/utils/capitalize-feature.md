# Feature Specification: Capitalize Utility

**slug:** utils-capitalize  
**Status:** Implemented  
**Date:** 2025-07-07  
**Author:** Mark

---

## 1. Overview
Provide a single function that capitalizes the first character of a word.  
This avoids scattered one-off helpers and keeps string-formatting logic in `/src/utils`.

---

## 2. User Stories
- **As a** frontend developer, **I want** a `capitalize()` helper **so that** I can display labels with proper casing.

### 2.1 Acceptance Criteria
*(These will become unit-test assertions)*  
- **AC-1** GIVEN `"pump"` WHEN `capitalize()` THEN `"Pump"`  
- **AC-2** GIVEN `"card"` WHEN `capitalize()` THEN `"Card"`  
- **AC-3** GIVEN `""` (empty) WHEN `capitalize()` THEN returns `""`

---

## 3. Functional Requirements
- **FR-1** The function **SHALL** return a new string whose first character is uppercase and all remaining characters are unchanged.  
- **FR-2** The function **SHALL** return the input unchanged if it is an empty string.  
- **FR-3** The function **SHALL NOT** mutate the original string argument.

---

## 4. Non-Functional Requirements
| Category        | Requirement |
| --------------- | ----------- |
| Performance     | Execution < 1 ms for a single call |
| Reliability     | 100 % unit-test pass rate |

---

## 5. Technical Details
### 5.1 Architecture & Components
- **New file:** `/src/utils/capitalize.ts`
- No React components, services, or data stores touched.

*All other subsections (Data Model, Server Actions, Genkit Flows, UI/Styling) — **N/A***  

### 5.2 Example Input / Expected Output
| Input        | Expected Output |
| ------------ | --------------- |
| `"pump"`     | `"Pump"` |
| `"Pump"`     | `"Pump"` |
| `""`         | `""` |

---

## 6. Testing Notes
- **Unit tests only** → `/__tests__/utils/capitalize.spec.ts`
- Target ≥ 90 % coverage (trivial here).

---

## 7. Changelog
Add to `CHANGELOG.md` under *Added*: “Capitalize utility (`src/utils/capitalize.ts`).”

---

> **Remember:** Update **Status** when the implementation is merged.
