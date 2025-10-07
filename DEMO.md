# Setup Demo

Here's what happens when you run `./setup-plaid.sh`:

```bash
$ ./setup-plaid.sh

🔐 Plaid Link Setup
==================

This script will help you configure your Plaid credentials securely.
Your credentials will be stored in a .env file (which is git-ignored).

📋 Please enter your Plaid credentials
   (Get these from: https://dashboard.plaid.com/developers/keys)

Plaid Client ID: 68e58133975dcf00249f7827

Plaid Sandbox Secret: ************************************

✅ Configuration saved to .env

📱 Android Setup
================

To use Plaid Link on Android, you need to register your package name:
   https://dashboard.plaid.com/developers/api
   Package name: com.coolsoftwaretyler.webviewmessage

Have you registered the Android package name? (y/N): y

🔄 Generating link token...

✅ Link token generated!

✅ Updated app/(tabs)/index.tsx with link token

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Setup Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 Your link token: link-sandbox-e232bbf6-07f4-4401-9642-d1609d5c4473

🚀 Next steps:
   1. Start your app:
      npm run ios      # or
      npm run android  # (requires Android package registration)

   2. In the app:
      - Tap 'Initialize Plaid Link'
      - Tap 'Open Plaid Link'
      - Test the integration!

🔒 Remember: Never commit your .env file to git!
```

## What Just Happened?

1. ✅ Created `.env` with your credentials
2. ✅ Generated a fresh link token from Plaid API
3. ✅ Automatically updated `app/(tabs)/index.tsx` with the token
4. ✅ Ready to run the app immediately!

## Files Modified

- ✅ `.env` - Created with your credentials (git-ignored)
- ✅ `app/(tabs)/index.tsx` - Line 16 updated with link token

## iOS-Only Mode

If you haven't registered the Android package yet:

```bash
$ ./setup-plaid.sh
[... setup prompts ...]

Have you registered the Android package name? (y/N): n

⚠️  Skipping Android support for now.
   Link tokens will work on iOS only.
   Run 'node generate-link-token.js' later after registering Android package.

🔄 Generating link token...

✅ Link token generated!
✅ Updated app/(tabs)/index.tsx with link token

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Setup Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 Your link token: link-sandbox-27fa592e-482d-454c-94d0-67b104face24

⚠️  Note: Current token works on iOS only.
   To enable Android:
   1. Register Android package name in Plaid Dashboard
   2. Run: node generate-link-token.js
   3. Update linkToken in app/(tabs)/index.tsx
```

## Regenerating Tokens

Link tokens expire after ~4 hours. To get a new one:

```bash
# For both iOS and Android (requires package registration)
node generate-link-token.js

# For iOS only
node generate-link-token-ios-only.js
```

Then manually update line 16 in `app/(tabs)/index.tsx`, or just run `./setup-plaid.sh` again to do it automatically!
