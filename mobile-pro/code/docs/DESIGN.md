# Design system (packages/ui)

Each app has its own brand color on a shared neutral system, light and dark.

| App | Primary | Accent | Feel |
| --- | --- | --- | --- |
| Platter | #FC5A1E (tangerine) | #1BA672 (fresh green) | warm, appetizing |
| Cartly | #2453FF (cobalt) | #FFC21A (deal yellow) | trustworthy, busy |
| Lumo | gradient #F58529 -> #DD2A7B -> #8134AF | #0095F6 | clean, content-first |
| Minutely | #0C831F (basil green) | #F8CB46 (butter) | fast, friendly |
| Reelhouse TV | #E50914-like red is NOT allowed; use #7C5CFF (violet) | #22D3EE | cinematic, dark only |

- Type: Inter (via @expo-google-fonts/inter): 12/14/16/18/22/28/34, weights
  400/500/600/700/800. Numbers use tabular figures for prices.
- Spacing scale 4/8/12/16/20/24/32/40; radii 8/12/16/24/999.
- Elevation: soft, low-opacity shadows (iOS) and elevation (Android),
  consistent across platforms; cards on #FFFFFF over #F5F6F8 background.
- Components: Text, Button (primary, secondary, ghost, sizes), IconButton,
  Chip, Badge, RatingPill, Price (with MRP strike and discount),
  QuantityStepper (ADD -> - 1 +), SearchBar, Card, Skeleton (shimmer),
  BottomSheet, Tabs, SegmentedControl, Avatar (with story ring), Divider,
  ListItem, EmptyState, Toast, CountdownTimer, ProgressSteps, ArtTile
  (3D illustration on a soft gradient background), MapView (SVG).
- Motion: Reanimated 4 for press scale (0.97), sheet springs, like-heart
  burst, skeleton shimmer, focus scale on TV. Respect reduce-motion.
- Icons: @expo/vector-icons (Ionicons / MaterialCommunityIcons).
