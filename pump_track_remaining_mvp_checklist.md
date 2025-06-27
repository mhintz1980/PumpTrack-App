## 📋 **PumpTrack MVP / Demo Checklist**

**1. Smoke Test Core Features**

- Drag-and-drop: Schedule, move, and unschedule pumps (all combos)
- Persistence: Scheduled blocks appear in Firestore and reload on refresh
- Add Pump: Add new pump, verify it appears in plannable/scheduled lists
- Edit Pump: Edit pump, verify changes update everywhere

**2. Clean Up Codebase**

- Remove old/manual seeder scripts not needed (e.g. `scripts/seedPumps.ts` → now archived under `legacy/scripts`)
- Delete old test/migration docs/data not referenced by app
- Clean up unused code, logs, or placeholder logic
- Remove outdated README/comments/instructions

**3. UI/UX Polishing**

- Show scheduled badge/color for scheduled pumps
- Add loader/disabled states for all async actions
- Display inline errors for drag/drop overlap or backend fail
- Responsive: Test on mobile, tablet, desktop

**4. Firestore/Data Improvements**

- Expand pump data fields for realism if needed
- Attach schedule block details to pump cards (dates/status)
- Sync scheduled status between UI and Firestore

**5. Automated Testing**

- Expand API tests (missing dates, overlap, bad IDs)
- Test UI flows (Add/Edit pump, drag/drop success/failure)

**6. (Optional) Security & Deployment**

- Add authentication or basic access control (if needed)
- Deploy to staging/demo

---

**Old/Obsolete Instructions:**

- Move or delete any outdated docs/scripts/instructions from the repo (keep only one up-to-date README or onboarding doc).

---

### **This checklist is now saved in your project as “Pump Track Remaining MVP Checklist”.**

- **Update, check off, and share as you work.**
- Upload this to any agent (OpenAI Codex, Gemini, Jules, etc.) so they follow the same priorities and won’t reference obsolete workflows.

---

## **First Task:**

**Start with “Clean Up Codebase”:**

- Remove or archive `scripts/seedPumps.ts` and any other obsolete docs/scripts (archived to `legacy/scripts`).
- Delete any “README” or inline instructions that are out-of-date or conflict with this new checklist.
