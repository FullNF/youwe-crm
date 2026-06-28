# Google Sheets API Setup

The backend talks to your sheet through a **service account** (a robot Google
account) rather than your own login, so the CRM keeps working without anyone's
personal Google session being involved.

## 1. Create a Google Cloud project (or reuse one)

1. Go to https://console.cloud.google.com
2. Top-left project dropdown → **New Project** → name it (e.g. `youwe-crm`) →
   **Create**. (You can reuse the same project Firebase made if you used the
   same Google account — either is fine, they're independent of each other.)

## 2. Enable the Google Sheets API

1. With your project selected, go to **APIs & Services → Library**.
2. Search **Google Sheets API** → **Enable**.

## 3. Create the service account

1. **APIs & Services → Credentials → Create Credentials → Service account.**
2. Name it (e.g. `crm-sheets-bot`) → **Create and Continue** → skip the
   optional role/grant steps → **Done**.
3. Click into the service account you just made → **Keys** tab → **Add Key →
   Create new key → JSON** → downloads a JSON file.
4. Open that file and copy two fields into `server/.env`:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email from the JSON>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="<private_key from the JSON, keep \n literal>"
```

## 4. Share your sheet with the service account

This is the step people forget — the service account is a separate Google
account, so it has **zero access** to your sheet until you share it explicitly.

1. Open your sheet: `YouWe Group VVID`
   (`https://docs.google.com/spreadsheets/d/1FuvgHnycrGXrBKKRAhuWnHn4Fm37aN_waLwHJl-F2hI`)
2. Click **Share** (top right).
3. Paste the `GOOGLE_SERVICE_ACCOUNT_EMAIL` value (looks like
   `crm-sheets-bot@your-project.iam.gserviceaccount.com`) → give it **Editor**
   access → **Send** (it won't actually email anyone, that's fine).

## 5. Set the Sheet ID

The sheet ID is already filled in for you in `server/.env.example`:

```
GOOGLE_SHEET_ID=1FuvgHnycrGXrBKKRAhuWnHn4Fm37aN_waLwHJl-F2hI
```

That's the long string between `/d/` and `/edit` in your sheet's URL — if you
ever point this CRM at a different spreadsheet, just swap this value.

## 6. First boot

When you run `npm run dev` in `server/` for the first time, it will:

- Verify it can read your existing `Leads`-equivalent tab (your original
  sheet's first/only tab — make sure `SHEET_TAB_LEADS` in `.env` matches its
  actual tab name; check the tab name at the bottom of your Google Sheet).
- Auto-create the `Timeline`, `NeedAttention`, `Users`, and `Settings` tabs if
  they don't exist yet.
- Seed one Admin user into the `Users` tab, using `SEED_ADMIN_EMAIL` from your
  `.env`.

If you see a permissions error in the server logs, the most common cause is
step 4 (sharing the sheet) being skipped or the service account email being
slightly mistyped.
