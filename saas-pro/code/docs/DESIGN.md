# Design: What "Professional SaaS" Looks Like Here

The bar: products that look and feel like the best modern SaaS tools. Calm,
fast, information-dense where it helps (tables, dashboards) and generous
where it sells (landing and pricing pages). Light and dark themes.

## Shared look (`packages/ui`)

- **Type**: Inter (bundled with `next/font`), tabular numbers for money
  and tables. Clear hierarchy: page title, section title, body, caption.
- **Layout**: app shell with a left sidebar (product logo, workspace
  switcher, navigation with icons, plan badge and usage meter at the
  bottom), a top bar (search or quick actions, notifications, user menu),
  and content in a max-width container. Collapses to a drawer on phones.
- **Components**: buttons (primary, secondary, ghost, destructive, sizes,
  loading), inputs with labels, help and error text, select, combobox,
  date picker, switch, checkbox, radio, textarea, file drop zone, tabs,
  dialog, sheet, dropdown menu, toast, tooltip, badge, avatar, card, stat
  card with trend, data table (sort, filter, pagination, empty state,
  row actions), charts (bar, line, donut), empty states with an
  illustration and one clear action, skeleton loading states, a pricing
  table, a usage meter, an upgrade prompt.
- **States**: every page designs loading, empty, error and full states.
- **Money and dates**: ₹ with Indian digit grouping (`en-IN`), dates like
  "5 Nov 2026", times in the workspace's time zone.
- **Accessibility**: WCAG 2.2 AA contrast, visible focus rings, every
  control labelled, keyboard reachable, reduced motion respected.
- **Icons**: Lucide. Illustrations: simple, original, built in SVG.

## Brands

| Product | Primary | Accent | Feel |
| --- | --- | --- | --- |
| Billora | Teal `#0F766E` | Amber `#F59E0B` | Trustworthy, financial, crisp |
| Slotra | Violet `#7C3AED` | Coral `#FB7185` | Friendly, calm, scheduled |
| Wordloom | Ink `#1F2937` with orange `#EA580C` | Cream `#FFF7ED` | Editorial, focused, warm |
| Formora | Blue `#2563EB` | Lime `#84CC16` | Bright, simple, approachable |

Each app's theme sets these as CSS variables; components use roles
(primary, accent, surface, muted, border, success, warning, danger), never
raw colours.

## Marketing pages

A landing page per product with a hero (headline, one-line value, primary
and secondary call to action, a product screenshot in a browser frame),
three to six feature blocks, social proof with fictional customers clearly
fictional, the pricing table, FAQ and a final call to action. Fast, no
layout shift, good on phones.
