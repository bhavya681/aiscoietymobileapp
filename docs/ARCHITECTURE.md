# SocietyAI Mobile architecture

## Goals

- A native-first resident and admin experience over the existing SocietyAI API.
- Auth that works with the deployed httpOnly-cookie backend and with a documented
  Bearer-token patch.
- Fast, resilient screens with explicit loading, empty and error states.
- Safe rendering of AI-generated OpenUI Lang. No `eval`, no arbitrary components.

## App shell and navigation

`src/app/_layout.tsx` wires the shared query client, splash screen, theme/auth
hydration and the root stack.

```text
Root stack
├── Stack.Protected (unauthenticated)
│   └── (auth)      Login / Signup
└── Stack.Protected (authenticated)
    ├── (tabs)      Home / Maintenance / Payments / Assistant / Profile
    ├── invoice/[id]  Invoice detail + PDF share
    └── admin/index   Admin-only operations panel
```

- Hydration waits for both the cached session and the persisted theme before
  hiding the splash screen.
- Expo Router's protected groups move users between auth and the app shell, so a
  guarded screen never mounts with the wrong session. Signing out or expiring a
  session removes the authenticated history.
- Clearing a session also clears the TanStack Query cache and the in-memory
  assistant conversation, so the next account cannot see the previous user's data.
- Admin entry is shown only for `role === "admin"` and is also guarded inside the
  admin screen.

## Data layer

TanStack Query wraps the API in `src/features/**/queries.ts`:

| Key family | Used by | Refresh behavior |
| --- | --- | --- |
| `maintenance.pending` | Home, Maintenance, Payments | Stale after 60s |
| `maintenance.history` | Home, Maintenance, Payments | Stale after 5min |
| `maintenance.invoice(id)` | Invoice detail | Stale after 5min |
| `payments.history` | Payments | Derived from paid maintenance |
| `admin.users` | Admin | Stale after 60s |
| `admin.maintenance` | Admin | Stale after 60s |

Mutations invalidate the related families. Payment success refreshes maintenance,
payments and admin views. Creating a bill invalidates admin and resident
maintenance data.

The Axios client (`src/api/client.ts`) applies:

- base URL and 25s timeout
- `X-Client-Platform: mobile`
- `Authorization: Bearer <token>` when available
- manual `Cookie: token=<token>` on native for the current deployment
- 401 handling that excludes login/signup/reset-password
- normalized `ApiError` messages for every failure

## Session model

`src/store/auth-store.ts` persists a versioned session in SecureStore:

```ts
{ version: 1, token, mode: "bearer" | "cookie", user, savedAt }
```

- Startup validates the session with `GET /users/profile`.
- Network failures keep the cached profile so the app opens offline; data screens
  surface connection errors and can retry.
- A 401 from any non-login endpoint clears the session through a callback
  registered by the auth store. Session validation also treats 403/404 as an
  invalid session. Other failures do not sign the user out.
- `sessionExpired` drives a login-screen notice without creating an import cycle
  between Axios and Zustand.

## Payments and invoices

- Open bills come from `GET /maintenance/pending`.
- Receipts come from paid rows in `GET /maintenance/history`; there is no
  payments endpoint.
- `POST /maintenance/pay/[id]` requires `{ paymentMethod, confirmation: true }`
  and returns `{ amount, transactionId }`.
- The receipt sheet shows the transaction ID immediately. Invoice detail can
  always be reopened, but historic transaction IDs are not stored by the backend.
- Invoice PDFs are generated client-side with `expo-print` and shared with
  `expo-sharing`.

## AI assistant

`src/features/assistant/use-assistant.ts`:

1. Sends the trimmed message plus the last 20 turns to `POST /ai/chat`.
2. Appends the assistant message and any OpenUI program.
3. Handles a `confirmation` block by showing an explicit approve/cancel UI.
4. Sends `confirmActionId` only after the resident confirms.
5. Invalidates financial queries when a payment actually completes.

`src/utils/openui-parser.ts` parses the backend program into a typed, inert tree.
`src/components/assistant/openui.tsx` renders a closed allow-list: text, callouts,
stats, key/value lists, tables, artifacts, approvals, timelines and cards. Unknown
or malformed nodes degrade to text. No generated code is executed.

## Admin panel

- Statistics are derived from `GET /admin/users` and `GET /admin/maintenance`.
  Ledger rows arrive with raw owner ids, so the panel joins them against the user
  list before rendering or searching.
- Residents can be promoted/demoted or deleted; self-role changes and self-deletion
  are disabled in the UI.
- Bills are created with resident, amount and due date. The backend rejects
  duplicate bills for the same resident/due date.
- Tapping a ledger row opens the same invoice screen; admins may read any record.

## Design system

`src/constants/theme.ts` is the source of truth for the light/dark palettes,
spacing, radii and typography. `useAppTheme` resolves the system scheme and the
user's persisted `system | light | dark` preference.

Primitives in `src/components/common/` cover text, buttons, cards, badges,
avatars, inputs, sheets, segmented controls, skeletons and empty/error states.
Screens compose these rather than defining one-off styles.

## Failure and edge cases

- Every screen has loading skeletons, retryable errors and an empty state.
- Lists use query-derived data and are filtered locally for instant search.
- Forms disable dismissal while submitting and surface backend error messages.
- Session expiry from any API call clears credentials exactly once.
- Offline start is supported when a cached profile exists.

## Known backend gaps

| Gap | Mobile behavior |
| --- | --- |
| No `GET /payments` | Receipts are derived from paid maintenance history. |
| No transaction history | Transaction ID is shown immediately after payment only. |
| No announcements or society profile | Static society identity and support copy. |
| No push notifications | In-app data refresh only; no notification permission is requested. |
| No email password reset | Copy directs residents to the society office. |
