# React Native WebView injectJavaScript reproducer

This is an Expo SDK 53 app that includes [react-native-webview](https://www.npmjs.com/package/react-native-webview?activeTab=readme). In `app/(tabs)/index.tsx`, it has a function called `injectJavaScriptToWebView`, which replaces the webview content with a string that contains 1 or 2 timestamps: the time at which it was called, and optionally the time a native event triggered it.

You can tap a button to call `injectJavaScriptToWebView` directly from React Native on the JS layer. That will show the side effect immediately.

Then you can reload the webview using the reload button.

Once you've done that, tap "Open Custom Link". This button calls `CustomLink.open`, which is a native module intended to be fairly analogous to the [react-native-plaid-link sdk open function](https://plaid.com/docs/link/react-native/#open).

On the new UI, you'll have the option to "Inject JS to WebView". Once you do that, you'll see a time stamp. If you close the UI, you should see the times at which:

1. The native event was triggered
2. The WebView received the call

On iOS, these times will be very close - almost immediate, with some reasonable millisecond level drift.

On Android, these times will drift much further, because React Native WebView does not receive the message until the UI is totally closed. The hypothesis is that opening in a separate Activity means React Native WebView will not respond to `injectJavaScript` until that activity is done, whereas iOS has a totally different model of process control which allows it to run concurrently.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npm run android
   npm run ios
   ```

## CustomLink parity with react-native-plaid-link-sdk

### 1. Modal Native UI Presentation

- **Plaid**: Presents `PLKHandler` view controller modally
- **Ours**: Presents `CustomLinkViewController` (iOS) / `CustomLinkActivity` (Android) modally

### 2. Callback-Based API

- **Plaid**: `open({ onSuccess, onExit })` with callbacks for results
- **Ours**: `open(onInject)` with callback for button press

### 3. **Android: Activity Result Pattern**

- **Plaid** (`PlaidModule.kt:237-269`):

  - Implements `ActivityEventListener`
  - Uses `onActivityResult` to handle data from Plaid Activity
  - Stores callbacks and invokes them with results

- **Ours** (`CustomLinkModule.kt:43-59`):
  - Implements `ActivityEventListener`
  - Uses `onActivityResult` to handle data from `CustomLinkActivity`
  - Stores callback and invokes it with timestamp data

### 4. **iOS: Modal Presentation with Callbacks**

- **Plaid** (`RNLinksdk.mm:126-176`):

  - Creates handler in `createPlaidLink`
  - Stores `successCallback` and `exitCallback`
  - Presents view controller using `RCTPresentedViewController()`
  - Uses weak/strong self pattern to avoid retain cycles

- **Ours** (`CustomLinkModule.mm:97-126`):
  - Stores `_onInjectCallback`
  - Creates `CustomLinkViewController`
  - Presents using `RCTPresentedViewController()` (same as Plaid!)
  - Uses weak/strong self pattern to avoid retain cycles

### 5. **Main Thread Execution**

- **Plaid**: `requiresMainQueueSetup` and `dispatch_get_main_queue()`
- **Ours**: Same pattern for iOS; Android handles automatically

### 6. **Data Marshaling**

- **Plaid**: Converts native objects to dictionaries/WritableMaps for React Native
- **Ours**: Converts timestamp data to dictionary/WritableMap

### Implementation Details

### Android

**Files:**

- `CustomLinkModule.kt` - React Native module that launches the activity
- `CustomLinkActivity.kt` - Native activity with UI
- `CustomLinkPackage.kt` - Package registration

#### iOS

**Files:**

- `CustomLinkModule.mm` - React Native module
- `CustomLinkModule.h` - Header file
- Inline `CustomLinkViewController` class
