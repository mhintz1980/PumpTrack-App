# Architectural Audit and Remediation Plan

## Objective

Systematically identify and resolve all sources of hydration mismatch (SSR/CSR divergence) and background rendering issues in the application. Ensure the background image is visible as intended and eliminate hydration errors for a robust, maintainable codebase.

---

## 1. Layout and Rendering Flow

```mermaid
graph TD
    A[App Entry: _app/layout.tsx] --> B[RootLayout/EnhancedHeader]
    B --> C[Sidebar (sidebar.tsx)]
    B --> D[Main Content Wrapper]
    D --> E[Kanban Board / Pages]
    style C fill:#b3e6ff,stroke:#333,stroke-width:2px
    style D fill:#fff,stroke:#333,stroke-width:2px
    style E fill:#fff,stroke:#333,stroke-width:2px
```

- **Sidebar**: Uses background image, state from cookies, and is client-only.
- **Main Content Wrapper**: May have a white/opaque background or overlay.
- **Kanban Board/Pages**: Rendered inside the main content wrapper.

---

## 2. Hydration Mismatch Audit

- **SSR/CSR State**: Audit all uses of cookies, localStorage, window, or browser APIs in rendering logic.
- **Client-Only Effects**: Ensure all browser-only logic is deferred to `useEffect` or similar client-only hooks.
- **Props/State**: Ensure all props/state used in SSR are deterministic and do not depend on client-only data.

---

## 3. CSS and Overlay Audit

- **Global CSS**: Check for any `background`, `background-color`, or overlays in `globals.css` and component styles.
- **Main Content**: Audit layout wrappers for white or opaque backgrounds.
- **Remove/Adjust**: Make overlays transparent or remove them to allow the background image to show through.

### CSS/Overlay Audit Checklist

- [ ] Review `src/app/globals.css` for any `background`, `background-color`, or overlay rules that may obscure the background image.
- [ ] Identify all layout wrappers and their background/overlay styles in component files (e.g., `layout.tsx`, `EnhancedHeader.tsx`, Kanban components).
- [ ] Check for inline styles or CSS modules that set opaque backgrounds or overlays.
- [ ] Remove or adjust overlays to be transparent or semi-transparent as needed.
- [ ] Test background image visibility after each change.
- [ ] Ensure overlays provide sufficient readability without fully obscuring the background.
- [ ] Remove any redundant or obsolete CSS related to overlays or backgrounds.
- [ ] Document all changes and rationale for future maintainability.

---

## 4. Systematic Troubleshooting Steps

1. **Map all layout wrappers and their backgrounds.**
2. **Audit all SSR/CSR state usage in layout and sidebar.**
3. **Test with all overlays removed to confirm background image visibility.**
4. **Incrementally reintroduce overlays with transparency as needed for readability.**
5. **Add SSR/CSR logging to all major layout components to catch mismatches.**
6. **Document and remove any obsolete or redundant code/styles.**

---

## Next Steps

- Begin with a full audit of layout and rendering logic.
- Identify and document all SSR/CSR state usage.
- Audit and refactor CSS for overlays and backgrounds.
- Systematically test and resolve hydration and rendering issues.
- Maintain documentation for future maintainability.