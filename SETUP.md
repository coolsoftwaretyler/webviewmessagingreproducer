# Plaid Link Setup Guide

This guide will help you securely configure Plaid credentials for this project.

## Quick Start

**One command to set everything up:**

```bash
./setup-plaid.sh
```

The script will:

1. ✅ Prompt you for your Plaid credentials
2. ✅ Save them securely in `.env` (git-ignored)
3. ✅ Ask if you've registered the Android package name
4. ✅ Generate a link token automatically
5. ✅ Update `app/(tabs)/index.tsx` with the token

**That's it!** You're ready to run the app.

### First Time Setup Details

When you run `./setup-plaid.sh`, you'll be prompted for:

1. **Plaid Client ID**

   - Get it from: <https://dashboard.plaid.com/developers/keys>
   - Looks like: `68e58133975dcf00249f7827`

2. **Plaid Sandbox Secret**

   - From the same page
   - Looks like: `a4c431fc38cbd9641a1cfa6314efc1`
   - Note: The script hides this as you type for security

3. **Android package registration** (optional for iOS-only testing)
   - If you haven't registered yet, the script will generate an iOS-only token
   - To enable Android later:
     1. Go to <https://dashboard.plaid.com/developers/api>
     2. Add package name: `com.coolsoftwaretyler.webviewmessage`
     3. Save and wait 1-2 minutes
     4. Run `./setup-plaid.sh` again

## What Gets Created

The setup script creates:

- `.env` - Contains your Plaid credentials (git-ignored for security)

## Files Overview

| File                              | Purpose                                    | Commit to Git? |
| --------------------------------- | ------------------------------------------ | -------------- |
| `.env`                            | Your actual credentials                    | ❌ NO          |
| `.env.example`                    | Template showing format                    | ✅ YES         |
| `setup-plaid.sh`                  | Interactive setup script                   | ✅ YES         |
| `generate-link-token.js`          | Generates link tokens                      | ✅ YES         |
| `generate-link-token-ios-only.js` | iOS-only tokens (no Android config needed) | ✅ YES         |

## Security Best Practices

✅ **DO:**

- Use `./setup-plaid.sh` to configure credentials
- Keep your `.env` file local only
- Use different credentials for development/production
- Rotate secrets if they're accidentally committed

❌ **DON'T:**

- Commit `.env` to git (it's already in `.gitignore`)
- Share credentials in chat/email
- Hardcode credentials in source files
- Use production credentials in development

## Troubleshooting

### "INVALID_API_KEYS" error

Your Client ID or Secret is incorrect. Double-check them at <https://dashboard.plaid.com/developers/keys>

### "INVALID_FIELD" error (Android package name)

- Make sure you added `com.coolsoftwaretyler.webviewmessage` to the dashboard
- Wait 1-2 minutes after saving
- Try `node generate-link-token-ios-only.js` to test without Android

### Link token expired

Link tokens expire after ~4 hours. Just run `node generate-link-token.js` again to get a fresh one.

## Manual Setup (Alternative)

If you prefer not to use the script:

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your credentials:

   ```bash
   nano .env  # or use your favorite editor
   ```

3. Make sure `.env` is in `.gitignore` (already done)

## Getting Plaid Credentials

1. Go to <https://dashboard.plaid.com/>
2. Sign in or create an account
3. Navigate to "Developers" → "Keys"
4. Copy your:
   - `client_id`
   - `sandbox` secret (for development)

## Next Steps

After setup, see the main [README.md](./README.md) for instructions on running the app and reproducing the bug.
