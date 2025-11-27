# Google OAuth Setup Guide

## What You Need To Do

You need to get a **Google Client ID** from Google Cloud Console and add it to your project.

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com

### 2. Create or Select a Project
- Click on the project dropdown at the top
- Click "New Project"
- Enter project name (e.g., "UniCafe")
- Click "Create"

### 3. Enable Google+ API
- In the left sidebar, go to **APIs & Services > Library**
- Search for "Google+ API"
- Click on it and click "Enable"

### 4. Create OAuth Credentials
- Go to **APIs & Services > Credentials**
- Click "**+ CREATE CREDENTIALS**" at the top
- Select "**OAuth client ID**"

### 5. Configure OAuth Consent Screen (if prompted)
- Choose "External" (unless you have a Google Workspace)
- Click "Create"
- Fill in:
  - **App name**: UniCafe
  - **User support email**: Your email
  - **Developer contact**: Your email
- Click "Save and Continue"
- Skip the Scopes page (click "Save and Continue")
- Skip Test users page (click "Save and Continue")
- Click "Back to Dashboard"

### 6. Create OAuth Client ID
- Go back to **Credentials** tab
- Click "**+ CREATE CREDENTIALS**" > "**OAuth client ID**"
- Choose **Application type**: "Web application"
- Enter **Name**: "UniCafe Web Client"
- Under **Authorized JavaScript origins**, click "**+ ADD URI**" and add:
  ```
  http://localhost:5173
  http://localhost:5174
  ```
- Under **Authorized redirect URIs**, click "**+ ADD URI**" and add:
  ```
  http://localhost:5173
  http://localhost:5174
  ```
- Click "**CREATE**"

### 7. Copy Your Client ID
- A popup will show your **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
- Click the **copy icon** or select and copy it manually
- Click "OK"

### 8. Add Client ID to Your Project

#### For Backend (Express Server):
Edit the file: `Unicafe/backend/.env`

Replace this line:
```
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

With your actual Client ID:
```
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

#### For Frontend (React):
Edit the file: `Unicafe/customer-side/.env`

Replace this line:
```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

With your actual Client ID:
```
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

**IMPORTANT**: Use the SAME Client ID for both files!

### 9. Restart Your Servers
After adding the Client ID:
1. Stop your backend server (Ctrl+C in terminal)
2. Stop your frontend server (Ctrl+C in terminal)
3. Restart backend: `cd Unicafe/backend` then `npm start` (or `node server.js`)
4. Restart frontend: `cd Unicafe/customer-side` then `npm run dev`

### 10. Test Google Login
- Go to http://localhost:5173 (or your frontend URL)
- Navigate to the Login page
- Click the "Sign in with Google" button
- It should open a Google login popup
- Sign in with your Google account
- You should be redirected to the menu page!

## Troubleshooting

### "Invalid Client" Error
- Make sure you copied the ENTIRE Client ID (it's long!)
- Check that both `.env` files have the same Client ID
- Make sure you restarted both servers after adding the Client ID

### "Origin Not Allowed" Error
- Go back to Google Cloud Console > Credentials
- Click on your OAuth Client ID
- Make sure `http://localhost:5173` and `http://localhost:5174` are in **Authorized JavaScript origins**

### Google Button Not Showing
- Check browser console for errors (F12)
- Make sure you have internet connection (Google OAuth needs to load from Google)
- Try clearing your browser cache

## Security Notes

**DO NOT share your Client ID publicly** - although it's meant for frontend use, keep your `.env` files private.

When deploying to production:
1. Go back to Google Cloud Console
2. Add your production domain (e.g., `https://unicafe.com`) to **Authorized JavaScript origins**
3. Update your `.env` files with production URLs if needed

## What Was Implemented

✅ Backend: Google token verification endpoint (`/api/auth/google`)
✅ Frontend: Google login button on Login page
✅ Database: `google_id` column added to users table
✅ Authentication: Auto-creates accounts for new Google users
✅ Account Linking: Links Google accounts to existing email accounts

## Files Modified

### Backend:
- `backend/routes/auth.js` - Added `/google` endpoint
- `backend/database.js` - Added `google_id` column
- `backend/.env` - Created with placeholder

### Frontend:
- `customer-side/src/main.jsx` - Added GoogleOAuthProvider wrapper
- `customer-side/src/context/AuthContext.jsx` - Added `googleLogin()` function
- `customer-side/src/pages/Login.jsx` - Added Google login button
- `customer-side/.env` - Created with placeholder

### Dependencies Installed:
- Backend: `google-auth-library`, `dotenv`
- Frontend: `@react-oauth/google`
