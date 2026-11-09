# SocietyAI Mobile

A production-oriented Expo / React Native client for the SocietyAI housing-society
platform. Residents can view dues, pay maintenance, download invoices and ask the
AI assistant about their own records. Administrators get a mobile operations panel
for residents, roles and the maintenance ledger.

The app talks to the existing Next.js API at
`https://aiscoietyproject-roan.vercel.app/api` and never embeds server secrets.

## Features

- **Authentication** — sign in, sign up, persisted sessions, profile editing,
  password changes and account deletion.
- **Home** — live outstanding balance, next due date, quick actions, recent
  activity and an admin entry point.
- **Maintenance** — open bills, payment method selection, confirmation and
  immediate receipt with invoice routing.
- **Payments** — paid-receipt ledger with period filters and PDF sharing.
- **AI assistant** — grounded chat over the society knowledge base and the signed
  in resident's records, including a confirm-before-pay flow.
- **Admin** — society-wide statistics, resident search, role changes, account
  deletion, maintenance search/filtering and bill creation.
- **Theming** — system / light / dark palettes matching the SocietyAI web app.
- **Resilience** — cached profile for offline starts, normalized API errors,
  pull-to-refresh and session-expiry handling.

## Stack

- Expo SDK 58, React Native 0.88, React 19
- Expo Router (typed routes)
- TanStack Query
- Zustand
- React Hook Form + Zod
- Axios
- Expo SecureStore, Haptics, Clipboard, Print, Sharing, Linear Gradient
- Lucide icons

## Quick start

Requirements: Node.js 20+, npm, and the Expo Go app or an Android/iOS simulator.

```bash
npm install
cp .env.example .env
npx expo start
```

On Windows use `copy .env.example .env`.

The only public setting is the API base URL:

```bash
EXPO_PUBLIC_API_URL=https://aiscoietyproject-roan.vercel.app/api
```

Never add `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, or any other server secret
to an `EXPO_PUBLIC_*` variable — those values are embedded in the shipped bundle.

### Development build

Expo Go is enough for the modules used here, but a development build is closer to
production and is required once custom native code is added:

```bash
npx expo run:android
npx expo run:ios
# or
npx eas-cli build --profile development
```

`ios/` and `android/` are generated. Do not edit them by hand; change `app.json`
or config plugins instead.

## Authentication note

The deployed web backend authenticates from an httpOnly `token` cookie. The mobile
client supports two modes:

1. **Bearer mode (recommended)** — login returns a token for native clients; the
   app stores it in SecureStore and sends `Authorization: Bearer …`.
2. **Cookie fallback** — if the API does not return a token, the app extracts it
   from `Set-Cookie` when the platform exposes it and sends a manual `Cookie`
   header on native.

Apply the small additive backend patch in
[`docs/BACKEND_MOBILE_AUTH.md`](docs/BACKEND_MOBILE_AUTH.md) to make token
persistence reliable. The app only needs one successful login after the patch is
deployed.

## Project structure

```text
src/
  app/                 Expo Router screens and layouts
    (auth)/            Login and signup
    (tabs)/            Home, maintenance, payments, assistant, profile
    invoice/[id].tsx   Invoice detail and PDF sharing
    admin/index.tsx    Admin operations panel
  api/                 Axios client and typed endpoints
  components/          Common, dashboard, maintenance, payments, assistant, admin
  constants/           Runtime config, theme tokens, society identity
  features/            Query/mutation hooks, schemas, assistant controller
  hooks/               Theme hook
  store/               Auth, theme and assistant Zustand stores
  types/               API and OpenUI types
  utils/               Formatting, errors, storage, safe OpenUI parser
docs/                  Backend patch and architecture notes
```

## Scripts

```bash
npm run start       # Expo dev server
npm run android     # Android
npm run ios         # iOS
npm run web         # Web preview (not the primary target)
npm run lint        # ESLint via Expo
npm run typecheck   # tsc --noEmit
```

## API capabilities and limits

- The API exposes no standalone payment list. Payment history is derived from
  paid maintenance records; transaction IDs are shown immediately after a payment.
- There is no announcements, society-profile, or push-notification endpoint.
  Society identity is static configuration, and the assistant covers policy
  questions from the backend knowledge base.
- Mobile requests identify themselves with `X-Client-Platform: mobile`.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full data flow and
security model.

## Verification

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Building

```bash
npx eas-cli build --profile preview
npx eas-cli build --profile production
npx eas-cli submit --profile production
```

SocietyAI icon, adaptive-icon, monochrome and splash artwork are already generated
in `assets/images/` and wired through `app.json`. Replace them if the brand
changes, and confirm the bundle identifiers (`com.societyai.mobile`) match the
store listing before submitting.
# aiscoietymobileapp
