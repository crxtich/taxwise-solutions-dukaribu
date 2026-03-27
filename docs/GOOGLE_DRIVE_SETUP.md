# Google Drive Integration Setup

This guide sets up Google OAuth2 so clients can connect their Google Drive to the Taxwise Solutions portal.

---

## 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **New Project** → name it `Taxwise Solutions Portal`
3. Select the project

---

## 2. Enable the Google Drive API

1. Go to **APIs & Services → Library**
2. Search for **Google Drive API** and click **Enable**

---

## 3. Configure the OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** → Create
3. Fill in:
   - App name: `Taxwise Solutions`
   - User support email: `info@taxwisesolutions.co.ke`
   - Developer contact: `info@taxwisesolutions.co.ke`
4. Click **Save and Continue**
5. On the **Scopes** screen, click **Add or Remove Scopes**
   - Add: `https://www.googleapis.com/auth/drive.file`
6. Save and Continue through remaining steps
7. Add test users (your email) while in development
8. Submit for verification when ready for production

---

## 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: `Taxwise Portal`
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:8080/client-portal/drive/callback` (development)
   - `https://taxwise-solutions.onrender.com/client-portal/drive/callback` (production)
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

---

## 5. Set Environment Variables

### In `.env` (local development):
```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:8080/client-portal/drive/callback
```

> ⚠️ Never put `GOOGLE_CLIENT_SECRET` in `.env` — it goes only in Supabase Edge Function secrets.

### In Supabase Edge Function Secrets:

Go to your Supabase dashboard → **Edge Functions → Manage Secrets** and add:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### In Render (production):

Go to your Render service → **Environment** and add:
```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_REDIRECT_URI=https://taxwise-solutions.onrender.com/client-portal/drive/callback
```

---

## 6. Deploy the Supabase Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref tdpftyozykpmgjaofilj

# Deploy the function
supabase functions deploy google-oauth-callback
```

---

## 7. Test the Integration

1. Log in as a client at `/client-portal/login`
2. Go to **Google Drive** in the sidebar
3. Click **Connect Google Drive**
4. Complete the Google OAuth consent screen
5. You should be redirected back and see "Google Drive Connected ✓"
6. A `Taxwise Solutions — [Business Name]` folder with 9 subfolders will be created in the client's Drive

---

## Folder Structure Created in Client's Google Drive

```
Taxwise Solutions — [Business Name]/
├── Invoices/
├── Receipts/
├── Payroll Records/
├── Tax Returns/
├── Bank Statements/
├── Contracts/
├── Permits & Licenses/
├── Audit Reports/
└── Management Accounts/
```

---

## Security Notes

- The `access_token` and `refresh_token` are stored in the `client_drive_tokens` table with RLS enabled — only the client and staff can access their own tokens.
- The `GOOGLE_CLIENT_SECRET` is never exposed to the frontend — it lives only in Supabase Edge Function secrets.
- The OAuth scope `drive.file` only grants access to files created by this app — not the client's entire Drive.
