# Codex UI Analysis & Implementation Prompt

## Phase 1: Image Analysis (Before Any Code)

You will receive one or more UI design images. Before writing any code, you MUST:

1. **Document the Layout Structure**
   - Identify all major sections and their hierarchy
   - Note grid columns, row heights, and spacing patterns
   - List breakpoints and responsive behavior observed

2. **Map Component Positions**
   - Document exact positioning of every visual element
   - Note alignment (left, center, right, justify)
   - Record margins, padding, and gaps between components
   - Identify z-index layering if overlaps exist

3. **Analyze User Flow**
   - Trace the visual hierarchy (what draws attention first)
   - Map interactive zones (buttons, forms, clickable areas)
   - Document entry points and exit paths
   - Note state changes (hover, active, disabled, loading)

4. **Color & Typography Audit**
   - List all colors used with hex values
   - Document font families, sizes, weights, line heights
   - Note contrast ratios for accessibility

5. **Create a Written Specification**
   - Output a detailed layout spec as plain text before code
   - Use ASCII diagrams if helpful to show structure
   - List assumptions or clarifications needed

## Phase 2: Implementation

Only after Phase 1 is complete and approved:

1. Build components matching the analyzed layout exactly
2. Implement the documented user flow
3. Apply colors and typography as specified
4. Ensure responsive behavior matches observations

## Output Format

Start with: "ANALYSIS COMPLETE" followed by the full specification.
Then ask: "Shall I proceed with implementation?"
Only write code after explicit approval.

run checks for errors run lint
