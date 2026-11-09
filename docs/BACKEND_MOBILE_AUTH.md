# Backend patch: reliable mobile authentication

The mobile app is implemented against the deployed SocietyAI API. No backend files
in this repository are modified. This document describes the **small, additive**
change needed in the web repository (`E:\aiscoietyproject`) so native sessions
survive app restarts reliably.

## Why a patch is needed

The web API signs a JWT and sets it as an httpOnly cookie (`token`). That is the
right browser design, but React Native cannot rely on it:

- `Set-Cookie` is not consistently exposed to JavaScript on iOS/Android.
- Cookie jars differ between Expo Go, development builds and production.
- Bearer tokens are the standard, explicit mobile session mechanism.

The mobile client therefore supports both modes and prefers Bearer when the API
returns a token. Sending both headers keeps the current deployment working during
the transition.

## Patch 1 — return the token to native clients only

File: `app/api/users/login/route.ts`

```diff
     const token = signAuthToken({
       userId: user._id.toString(),
       role: user.role,
     });
 
+    const isMobileClient =
+      request.headers.get("x-client-platform") === "mobile";
+
     const response = NextResponse.json(
       {
         success: true,
         message: "Successfully logged in.",
+        // Native clients persist this in the OS keychain. Browsers never send
+        // the mobile header, so the httpOnly cookie remains the only browser
+        // session mechanism.
+        ...(isMobileClient ? { token } : {}),
         user: {
           id: user._id.toString(),
           name: user.name,
           email: user.email,
           role: user.role,
         },
       },
       { status: 200 }
     );
```

The response type in the mobile app is already compatible:

```ts
type LoginResponse = {
  token: string | null;
  user?: LoginUser;
  message?: string;
};
```

No signup change is needed: the app signs up and then calls the login endpoint.

## Patch 2 — accept `Authorization: Bearer` as well as the cookie

File: `app/lib/auth.ts`

```diff
 export function getAuthenticatedUser(request: NextRequest): AuthUser | null {
-  return verifyAuthToken(request.cookies.get(TOKEN_COOKIE)?.value);
+  const authorization = request.headers.get("authorization");
+  const bearer =
+    authorization?.startsWith("Bearer ")
+      ? authorization.slice("Bearer ".length).trim()
+      : undefined;
+
+  return verifyAuthToken(
+    bearer || request.cookies.get(TOKEN_COOKIE)?.value
+  );
 }
```

This is safe for the web app:

- A browser cannot attach a custom `Authorization` header cross-site without CORS
  consent, so the httpOnly cookie remains its CSRF-resistant credential.
- `verifyAuthToken` performs the same signature/expiry validation for both
  sources.
- Only routes that already call `getAuthenticatedUser` are affected.

## Deployment order

1. Deploy the backend patch.
2. Sign out and sign in once in the mobile app.
3. Confirm the login response contains `token` and no longer needs the cookie.
4. Optionally remove the manual `Cookie` header from
   `src/api/client.ts` after all supported clients run the updated backend.

The manual cookie header is kept intentionally for backwards compatibility with
the currently deployed backend.

## Verification

```bash
# Should return { success: true, token: "...", user: {...} }
curl -s https://aiscoietyproject-roan.vercel.app/api/users/login \
  -H "Content-Type: application/json" \
  -H "X-Client-Platform: mobile" \
  -d '{"email":"resident@example.com","password":"correct-password"}'

# Should authenticate with Bearer only
curl -s https://aiscoietyproject-roan.vercel.app/api/users/profile \
  -H "Authorization: Bearer <token>"
```

Never log the token or place it in analytics, crash reports, or source control.
