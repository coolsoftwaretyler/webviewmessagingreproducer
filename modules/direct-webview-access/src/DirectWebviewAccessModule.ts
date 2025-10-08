import { NativeModule, requireNativeModule } from "expo";

declare class DirectWebviewAccessModule extends NativeModule {
  /**
   * Injects JavaScript into a WebView by native ID.
   *
   * On Android, it bypasses the React Native UI manager. It looks at the React Native app context activity,
   * and uses ReactFindViewUtil to find the WebView by native ID.
   *
   * If it finds the WebView, it will cache it for future use,
   * then it will invoke the WebView's evaluateJavascript method.
   *
   * Will reject with an error if the WebView is not found, or if some other error occurs.
   *
   * On iOS, it is a no-op.
   *
   * @param nativeId
   * @param script
   */
  injectJavaScriptByNativeId(nativeId: string, script: string): Promise<string>;
}

/**
 * DirectWebviewAccessModule is an Expo Module that provides a way to inject JavaScript into a WebView,
 * given the WebView's native ID on Android. On iOS, it is a no-op.
 *
 * To use, call `injectJavaScriptByNativeId` with the WebView's native ID and the JavaScript to inject.
 */
export default requireNativeModule<DirectWebviewAccessModule>(
  "DirectWebviewAccess"
);
