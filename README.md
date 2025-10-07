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

### 7. **Event Emitter Pattern**

- **Plaid** (`usePlaidEmitter`):

  - Emits events **during** the Link flow while UI is still open
  - iOS: Uses `RCTEventEmitter` with `sendEventWithName:@"onEvent"` (RNLinksdk.mm:98-114)
  - Android: Uses `DeviceEventManagerModule.RCTDeviceEventEmitter` (PlaidModule.kt:109-114)
  - React hook uses `NativeEventEmitter` with cleanup on unmount

- **Ours** (`useCustomLinkEmitter`):

  - **iOS** (`CustomLinkModule.mm:88-119`):
    - Extends `RCTEventEmitter` instead of `NSObject`
    - Implements `supportedEvents`, `startObserving`, `stopObserving`
    - Implements required `addListener` and `removeListeners` methods
    - Uses `_hasObservers` to track active listeners
    - Emits events via `sendEventWithName:@"onCustomEvent"` when button is tapped while view controller is still open

  - **Android** (`CustomLinkModule.kt:19-27, 80-86`):
    - Static `emitEvent` method in companion object for activity-to-module communication
    - `sendEvent` helper with `hasActiveCatalystInstance()` check for safety
    - Activity calls `CustomLinkModule.emitEvent()` when button is tapped while activity is still open
    - Emits via `DeviceEventManagerModule.RCTDeviceEventEmitter`

  - **React Hook** (`CustomLink.ts:18-27`):
    - Creates `NativeEventEmitter` instance
    - Adds listener for `onCustomEvent`
    - Returns cleanup function to remove listener on unmount
    - Same pattern as Plaid's `usePlaidEmitter`

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
