# Feature Specification: Truncate Utility

**slug:** utils-truncate  
**Status:** Draft  
**Date:** 2025-07-17  
**Author:** Kiro Assistant

---

## 1. Overview
Provide a utility function that truncates strings to a specified maximum length and adds an ellipsis if truncated.  
This is useful for displaying long text in UI components with limited space.

---

## 2. User Stories
- **As a** frontend developer, **I want** a `truncate()` helper **so that** I can display long text in a space-constrained UI.

### 2.1 Acceptance Criteria
- **AC-1** GIVEN `"This is a long string"` WHEN `truncate(text, 10)` THEN `"This is a..."`  
- **AC-2** GIVEN `"Short"` WHEN `truncate(text, 10)` THEN `"Short"`  
- **AC-3** GIVEN `"Exactly 10"` WHEN `truncate(text, 10)` THEN `"Exactly 10"`
- **AC-4** GIVEN `"Exactly 10!"` WHEN `truncate(text, 10)` THEN `"Exactly..."`

---

## 3. Functional Requirements
- **FR-1** The function **SHALL** return the original string if its length is less than or equal to the specified maximum length.
- **FR-2** The function **SHALL** truncate the string to (maxLength - 3) characters and append "..." if the string length exceeds maxLength.
- **FR-3** The function **SHALL** handle edge cases like null, undefined, or empty strings gracefully.
- **FR-4** The function **SHALL NOT** mutate the original string.

---

## 4. Non-Functional Requirements
| Category        | Requirement |
| --------------- | ----------- |
| Performance     | Execution < 1 ms for strings up to 1000 characters |
| Reliability     | 100% unit-test pass rate |

---

## 5. Technical Details
### 5.1 Architecture & Components
- **New file:** `/src/utils/truncate.ts`
- No React components, services, or data stores touched.

### 5.2 Example Input / Expected Output
| Input                    | maxLength | Expected Output        |
| ------------------------ | --------- | ---------------------- |
| `"This is a long text"`  | 10        | `"This is a..."` |
| `"Short"`                | 10        | `"Short"` |
| `""`                     | 5         | `""` |
| `null`                   | 5         | `""` |
| `undefined`              | 5         | `""` |

---

## 6. Testing Notes
- **Unit tests only** → `/__tests__/utils/truncate.spec.ts`
- Target ≥ 90% coverage.
- Test edge cases: empty strings, null, undefined, exact length matches.

---

## 7. Changelog
Add to `CHANGELOG.md` under *Added*: "Truncate utility (`src/utils/truncate.ts`)."

---

> **Remember:** Update **Status** when the implementation is merged.