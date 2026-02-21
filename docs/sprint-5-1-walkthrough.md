# Walkthrough - Auth UI Customization & Brand Alignment

I have fully refactored the authentication flow to match the "Madness 2026" brand and provide a more authoritative, sports-centric user experience.

## 1. Brand-Aligned UI
The default Auth.js pages have been replaced with custom components at `/auth/login`, `/auth/register`, and `/auth/reset-password`.
- **Aesthetic**: Light gray background with a subtle basketball court watermark.
- **Color Palette**: Royal Blue (#143278) and Basketball Orange (#F58220).
- **Logo**: Centered "Madness 2026" logo on all auth forms.

## 2. Secure Auth Flows
### Password Reset (Magic Token)
- Users can request a reset link via email.
- **Token Security**: Tokens are generated as UUIDs and are valid for exactly **1 hour**.
- **Nodemailer Integration**: Professional HTML email templates for reset links.

### Registration
- Simple onboarding flow for new players.
- **Security**: Passwords are securely hashed using `bcryptjs` before storage.

### Login Guidance
- Added italicized instructions for Magic Link (Nodemailer) login to clarify the "Magic Link" experience.

## 3. Infrastructure & Schema
- **User Model**: Added a `password` field (optional to support both Credentials and OAuth/Magic Link).
- **PasswordResetToken Model**: New model to manage secure time-limited reset sessions.
- **Auth Config**: Redirects all default paths to our custom `/auth/*` routes.

## Verification Results

### Path Mapping
Verified that navigating to a protected route without a session correctly redirects to our custom `/auth/login`.

### Email Delivery (Mock)
Verified that the `forgotPassword` action correctly generates tokens and logs the intended email output in development.

---
> [!NOTE]
> All brand assets (logo and background) have been placed in the `public/` directory.
