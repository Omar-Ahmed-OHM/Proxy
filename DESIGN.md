# Proxy Design System

Proxy is a personal productivity assistant. The UI is a premium, restrained dark SaaS design: Next.js App Router, TypeScript, Tailwind CSS v4, Lucide React.

## Color tokens

All colors are defined in `src/app/globals.css` under `@theme` and used through Tailwind utilities (`bg-card`, `text-muted`, `border-border`). The default Tailwind palette is disabled, so do not use raw hex values or stock colors like `zinc-500`. If you need a new shade, add a token.

| Token | Value | Use |
| --- | --- | --- |
| `canvas` | #080D27 | Page background |
| `surface` | #0D1535 | Sidebar, inputs, bars |
| `card` | #111A3D | Cards |
| `elevated` / `elevated-hover` | #17224D / #1C2958 | Raised cards, hover, active nav |
| `primary` (+ `-hover`, `-end`, `-soft`) | #742BFF | Primary actions; `-soft` is for purple text and icons on dark backgrounds |
| `secondary` | #16A7FF | Info, focus borders |
| `accent` | #28D7E8 | Focus ring, highlights |
| `foreground` / `muted` | #F4F5FF / #A9B2D7 | Main / secondary text |
| `success` / `warning` / `danger` | #17D6A0 / #FFAA36 / #FF5D8F | Status |
| `border` / `border-strong` | muted at 12% / 24% | Dividers, outlines |

## Rules

- Mobile-first. Shell breakpoints: under `md` there is a top bar plus a bottom tab bar; at `md` an icon rail; at `lg` the full sidebar. No horizontal overflow (`min-w-0` on flex children, `truncate` long text).
- Touch targets are at least 44px tall (`h-11`).
- Use gradients sparingly (primary button, brand mark, switch, voice). Glow is limited to the `shadow-glow` tokens on hover/selected states.
- Shadows and animations come from tokens in `globals.css` (`shadow-card`, `shadow-popover`, `animate-pop-in`, `animate-shimmer`, ...). Reduced motion is respected globally.
- Focus: the global `:focus-visible` accent outline. Don't remove it unless you replace it.
- Icons come from `lucide-react`. Decorative icons get `aria-hidden="true"`.
- Server components by default. Add `"use client"` only at the smallest interactive leaf (see `ActiveNav`).
- With `cacheComponents` on, client components that call `usePathname` or `useSearchParams` go behind `Suspense` (see `PrimaryNav`).
- Write explicit `Props` interfaces with sensible defaults. No `any`, no hardcoded user data, no API calls unless they're requested.
- Don't read the current time or call `Date.now()` during render; use `useNow()` (null on the server). Format dates with `DEFAULT_LOCALE` from `@/lib/date`.
- No code comments.

## Folder architecture

Every route folder follows the same layout. `page.tsx` only imports and renders the route's main component:

```
src/app/(main)/tasks/
  page.tsx          // metadata + <Tasks />
  Tasks.tsx         // the page content
  components/       // components used only by this route (TaskCard, TaskStatusBadge, ...)
  hooks/            // React Query hooks (useQuery / useMutation) that call the api functions
  api/              // axios request functions for this route (tasks.api.ts), no React here
  types/index.ts    // domain types and every props interface for this route
```

Route groups:

- `src/app/(main)/`: every signed-in page, wrapped by `(main)/layout.tsx` (the `AppShell`). `/` is `(main)/(dashboard)`, plus `/tasks`, `/reminders`, `/daily-plan`, `/calendar`, `/notes`, `/profile`, `/settings`.
- `src/app/(auth)/`: `/login` and `/register`, with their own layout and no `AppShell`.
- `src/proxy.ts` redirects to `/login?next=...` when the auth cookie is missing, and away from the auth pages when it exists.

`src/app/notifications/` has `api`, `hooks` and `types` but no page; the top bar uses it. `src/app/(main)/profile/hooks/useCurrentUser` is the single source for the signed-in user.

## API integration

- Every backend path lives in `src/lib/http/endpoints.ts` as `ENDPOINTS`. `api/` files import it; never write a path string inline.
- The backend wraps responses (`{ task }`, `{ tasks }`, `{ user, token }`, ...). `api/` functions unwrap them so hooks and components get the entity itself.
- Backend errors look like `{ error: { code, message, details: [{ path, message }] } }`. `ApiError` exposes `code`, `status`, `fieldErrors` and `fieldError(path)`, so forms can show server validation next to the right field.
- The JWT is stored in the `proxy_token` cookie (`src/lib/auth/token.ts`) and sent as `Authorization: Bearer`. A 401 while signed in clears it and goes to `/login`.
- `NEXT_PUBLIC_API_MOCK` picks the data source: `off` = real backend only, `pending` = real backend plus mocks for endpoints the backend doesn't have yet (notes, calendar, notifications, settings, dashboard summary, weather, assistant), `all` = everything mocked. Each route keeps its mock next to its api as `api/<route>.mock.ts`, registered in `src/mocks/index.ts` (`backendMocks` or `pendingMocks`).

All components live under `src/app/components/`:

- `layout/`: `AppShell` (sidebar + sticky top bar), `Brand`, `PrimaryNav` / `NavItems` / `ActiveNav`, navigation config (`mobile: true` items appear in the phone bottom bar), `PromoCard`, and the client data pieces `AccountMenu` (current user via `useCurrentUser`), `HeaderSearch` (submits to `/tasks?q=`), `HeaderNotifications`.
- `providers/`: `QueryProvider` (React Query client, mounted in `app/layout.tsx`; it also connects the auth token to `httpClient`).
- `ui/`: core primitives. `Button`, `ButtonLink`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Badge`, `Avatar`, `Card`, `Modal`, `ConfirmDialog`, `Dropdown`, `Tooltip`, `Skeleton`, `EmptyState`, `Toast` / `ToastViewport`, `Spinner`, `PageHeader`, plus `FormField` / `controlStyles` and `PopoverPanel` for building new controls. Import from `@/app/components/ui`.
- `shared/`: composite pieces. `SearchBar`, `FilterBar`, `StatCard`, `DatePicker`, `TimePicker`, `UserMenu`, `NotificationMenu`. Import from `@/app/components/shared`.
- `assistant/`: `AssistantWidget`, `ChatMessage`, `VoiceButton`, `VoiceVisualizer`. Import from `@/app/components/assistant`.

Each of these folders has `types/index.ts`. Component files never declare `interface` or `type`; they import them with `import type { ... } from "./types"`. Barrels re-export the types.

Non-component code stays outside `app/`:

- `src/hooks/`: `useControllableState`, `useDismiss`, `usePopover`, `useNow`.
- `src/lib/`: `cn`, date helpers, `http` (axios client for the whole app: `httpClient.get/post/put/patch/delete` return `data`, every failure is an `ApiError`; `ENDPOINTS` for every path), `auth/token` (the auth cookie). Route `api/` files only call `httpClient`, never axios directly.

When a route-level component starts being used by a second route, move it to `src/app/components/shared/`.

Reuse these before you write new markup.

## PWA

- `src/app/manifest.ts` is the web app manifest; icons live in `public/icons/` (generated from `icon.svg`).
- `public/sw.js` caches `/_next/static` and icons (cache-first), pages network-first with `/offline` as the fallback, never touches the API, and opens the right page on notification click. Bump `VERSION` in it when the caching logic changes.
- `ServiceWorkerRegister` (root layout) registers the worker in production only; set `NEXT_PUBLIC_ENABLE_SW=true` to try it in dev. `InstallAppButton` in the top bar uses `beforeinstallprompt`, and shows Add-to-Home-Screen steps on iOS.
- System notifications go through `registration.showNotification` (`src/lib/notifications.ts`), which is required on Android.
- `src/proxy.ts` must keep `sw.js`, `manifest.webmanifest`, `icons/` and `/offline` public.
