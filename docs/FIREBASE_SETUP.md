# Firebase Setup

You need a Firebase project for authentication. This takes about 5 minutes
and is free for this scale of usage.

## 1. Create the project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it (e.g. `youwe-crm`) → disable Google
   Analytics (not needed) → **Create project**.

## 2. Enable sign-in methods

1. In the left sidebar: **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable:
   - **Email/Password**
   - **Google** (set a support email when prompted)

## 3. Create your first users

1. Still in Authentication, go to the **Users** tab → **Add user**.
2. Add the email/password for whoever should be the first Admin (this should
   match `SEED_ADMIN_EMAIL` in `server/.env`).
3. Everyone else can either sign in with **Google** (no manual Firebase user
   needed) or you can add them here too.

> Note: Creating a Firebase *user* just means they can authenticate. Whether
> they can actually access the CRM (and with what role) is controlled
> separately in **Settings → Manage Users** inside the app itself, backed by
> the `Users` Google Sheet tab. A person can sign in to Firebase and still be
> blocked by the CRM until an Admin adds their email there.

## 4. Get the Web App config (for `client/.env`)

1. Project Settings (gear icon, top left) → scroll to **Your apps** → click
   the **</>** (web) icon → register an app (any nickname) → **no** need for
   Firebase Hosting.
2. Copy the `firebaseConfig` values into `client/.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 5. Get the Admin SDK service account (for `server/.env`)

1. Project Settings → **Service accounts** tab → **Generate new private key**.
2. A JSON file downloads. Open it and copy three fields into `server/.env`:

```
FIREBASE_PROJECT_ID=<project_id from the JSON>
FIREBASE_CLIENT_EMAIL=<client_email from the JSON>
FIREBASE_PRIVATE_KEY="<private_key from the JSON, keep the \n as literal \n>"
```

Keep that JSON file private — never commit it or share it. Treat it like a
password.

That's it — Firebase is done. Move on to `GOOGLE_SHEETS_SETUP.md`.
