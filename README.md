# React Native WebView injectJavaScript reproducer

This is an Expo SDK 53 app that includes [react-native-webview](https://www.npmjs.com/package/react-native-webview?activeTab=readme). In `app/(tabs)/index.tsx`, it has a function called `injectJavaScriptToWebView`, which replaces the webview content with a string that contains 1 or 2 timestamps: the time at which it was called, and optionally the time a native event triggered it.

You can tap a button to call `injectJavaScriptToWebView` directly from React Native on the JS layer. That will show the side effect immediately, and you'll see the timestamp in the browser is immediate, and the native event timestamp is `undefined`.

Once you've done that, tap "Open Custom Link". This button calls `CustomLink.open`, which is a native module intended to be fairly analogous to the [react-native-plaid-link sdk open function](https://plaid.com/docs/link/react-native/#open).

On the new UI, you'll have the option to "Inject JS to WebView". This will emit events, which `index.tsx` listens to via `useCustomLinkEmitter`. You should see console logs with the current time stamps in Metro/React Native DevTools.

Tap "Close Activity" and observe the timestamps. You should expect to see the JS timestamp is close to the native timestamp (maybe off by a ms or two).

On iOS this works perfectly. But on Android, you'll see the timestamps drift very far, because the `injectJavaScript` call on React Native webview does not fire until after the new activity is closed.

## Get started

1. Install dependencies

   ```bash
   npm install
   cd ios && pod install && cd ..
   ```

2. Start the app

   ```bash
   npm run android
   npm run ios
   ```

## Reproduce the bug

1. Tap "Initialize Plaid Link"
2. Tap "Open Plaid Link"
3. Go through the onboarding - choose a bank, choose an account, accept, come back to the main index screen
4. Compare the logs from Metro/React Native DevTools against the timestamp you see in the webview.
5. The latest time stamp in the logs should match what you see in the WebView

### Android

Android's WebView will have a timestamp much later than your logs

### iOS

Works
