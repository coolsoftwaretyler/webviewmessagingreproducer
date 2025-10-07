# React Native WebView injectJavaScript reproducer

This is an Expo SDK 53 app that demonstrates the timing difference between iOS and Android when using `injectJavaScript` with React Native WebView during native UI interactions (specifically with Plaid Link).

## Setup

1. Install dependencies

   ```bash
   npm install
   cd ios && pod install && cd ..
   ```

2. **One-command setup** (recommended)

   ```bash
   ./setup-plaid.sh
   ```

   This interactive script will:
   - Prompt you for your Plaid credentials
   - Store them securely in `.env` (git-ignored)
   - Generate a link token
   - Automatically update `app/(tabs)/index.tsx` with the token
   - Guide you through Android package registration

3. Start the app

   ```bash
   npm run ios      # or
   npm run android  # (requires Android package registration)
   ```

### Android Setup

For Android to work, you must register your package name:
1. Go to https://dashboard.plaid.com/developers/api
2. Under "Allowed Android package names", add: `com.coolsoftwaretyler.webviewmessage`
3. Click "Save Changes"
4. Wait 1-2 minutes, then run `./setup-plaid.sh` again to generate a token that works on both platforms

### Manual Setup (Alternative)

If you prefer to do it step-by-step:

1. Configure credentials:
   ```bash
   ./setup-plaid.sh
   ```

2. Generate a link token:
   ```bash
   node generate-link-token.js  # or generate-link-token-ios-only.js
   ```

3. Copy the token and paste it into `app/(tabs)/index.tsx` at line 16

## Reproduce the bug

1. Paste your link token into the app (or update it in `app/(tabs)/index.tsx`)
2. Tap "Initialize Plaid Link"
3. Tap "Open Plaid Link"
4. Go through the onboarding - choose a bank, choose an account, accept, come back to the main index screen
5. Compare the logs from Metro/React Native DevTools against the timestamp you see in the webview.
6. The latest timestamp in the logs should match what you see in the WebView

### Android

Android's WebView will have a timestamp much later than your logs. See ./android-does-not-work.mov

### iOS

Works. See ./ios-works.mov

## Security Notes

- Never commit your `.env` file to git
- The `.env` file contains sensitive Plaid credentials
- Use `./setup-plaid.sh` to configure credentials on new machines
- See `.env.example` for the expected format
