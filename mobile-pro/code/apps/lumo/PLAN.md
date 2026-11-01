# Lumo: build plan

Social photo sharing from `docs/PRD.md` section 3. Brand `lumo` in `@pro/ui`
(gradient #F58529 -> #DD2A7B -> #8134AF, accent #0095F6). Every Lumo endpoint
already has a typed client call and a React Query hook in `@pro/api`
(`useFeed`, `useStories`, `useToggleLike`, `useComments`, `useMessages`, ...).

Look: content first, quiet chrome. White bars, hairline dividers, black
outline icons that fill when active, brand gradient only on story rings,
the wordmark and the Share button. Photos are edge to edge, square.

## Routes (Expo Router, `src/app`)

| Route | Screen | Data |
| --- | --- | --- |
| `_layout` | Providers (theme, safe area, session, toasts), fonts, auth gate | `SessionProvider` |
| `login` | Phone, then 6-digit OTP | `useRequestOtp`, `useVerifyOtp` |
| `(tabs)/_layout` | Home, Explore, Create, Activity (unread dot), Profile (avatar) | `useLumoNotifications`, `useMe` |
| `(tabs)/index` | Wordmark, messages button (unread badge); stories row (your story first, then unseen gradient rings, then seen gray); post cards with infinite scroll | `useStories`, `useFeed`, `useConversations` |
| `(tabs)/explore` | User search box, mixed-size grid (a 2x2 tile every 6, alternating sides) | `useExplore`, `useSearchUsers` |
| `(tabs)/create` | Big preview, art picker (hero + up to 2 accents), backdrop tone strip, filter strip with live thumbnails, caption, tag people, Share | `useCreatePost`, `useSuggestions` |
| `(tabs)/activity` | Notifications grouped New / This week / Earlier; follow back buttons; post thumbnails; mark read on open | `useLumoNotifications`, `useMarkLumoNotificationsRead`, `useToggleFollow` |
| `(tabs)/profile` | Your profile (shared `ProfileView`) | `useProfile`, `useProfilePosts` |
| `user/[handle]` | Someone else's profile with Follow / Message | same + `useToggleFollow`, `useStartConversation` |
| `post/[id]` | One post (from grids and notifications) | `usePost` |
| `story/[id]` | Full-screen viewer: progress bars, tap left/right, hold to pause, swipe down to close, moves across users; `?highlight=1` plays a highlight | `useStories`, `useHighlightStories`, `useMarkStorySeen` |
| `messages` | Conversation list with unread state | `useConversations` |
| `chat/[id]` | Thread: bubbles grouped by sender, day separators, composer | `useConversation`, `useMessages`, `useSendMessage` |

## App components (`src/components`)
PostCard (header, photo with double-tap like + heart burst, action row,
"Liked by", caption with more, comment preview, time), CommentsSheet,
StoriesRow, ProfileView (stats, bio, highlights, grid / tagged tabs),
PostGrid, Caption (bold @mentions and #tags).

## App logic (`src/lib`, unit tested)
- `caption.ts`: caption -> text / mention / hashtag segments; truncation.
- `explore.ts`: posts -> rows of mixed tiles.
- `activity.ts`: notifications -> New / This week / Earlier sections.
- `chat.ts`: messages -> day separators and sender groups.
- `likes.ts`: "Liked by kabir.trails and 5,406 others" text.
- `create.ts`: art choices, picked arts -> `CreatePostInput`.

## Shared pieces to add (with tests)
- `@pro/ui`:
  - `PhotoScene`: a post's "photo". Composes a seeded backdrop (layered
    gradients, a soft glow, bokeh orbs, a horizon band, sparkles) under the
    scene's hero and accents (hero gets a ground shadow), then the photo
    filter. Photos keep their colors in dark mode, like real photos.
  - `photoBackdrop(seed, tone)`, `composeScene(arts, seed, tone)` (hero +
    accents from any art list), `PHOTO_FILTER_NAMES`, `photoFilterWash`,
    `hashSeed` and `seededRandom` (pure, tested).
  - `StoryProgress` (segmented bars) with `segmentFill`.
  - `useDoubleTap` (single vs double tap timing) with `createTapDetector`.
- `@pro/api`: `orderStoryGroups`, `firstUnseenIndex`, `stepStory` (story
  navigation across groups), `conversationTitle`.

## Verification
Each screen in headless Chromium (393x852, DPR 3); final screenshots in
`screenshots/`; `npm run check` green for the workspace.
