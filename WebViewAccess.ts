import { NativeModules } from 'react-native';

interface WebViewAccessModule {
  /**
   * Register a WebView for cached access by its nativeID.
   * This allows the WebView to be accessed even when the activity is inactive.
   * Call this after the WebView is mounted for best results.
   * @param nativeId The nativeID prop value of the WebView
   * @returns Promise that resolves when registration is complete
   */
  registerWebView(nativeId: string): Promise<string>;

  /**
   * Unregister a WebView from the cache.
   * @param nativeId The nativeID prop value of the WebView
   */
  unregisterWebView(nativeId: string): void;

  /**
   * Get the current URL of a WebView by its nativeID.
   * Uses cached reference if available, otherwise searches view hierarchy.
   * @param nativeId The nativeID prop value of the WebView
   * @returns Promise that resolves with the current URL
   */
  getWebViewByNativeId(nativeId: string): Promise<string>;

  /**
   * Inject JavaScript into a WebView by its nativeID.
   * Uses cached reference if available, otherwise searches view hierarchy.
   * Executes on main thread even when activity is inactive.
   * @param nativeId The nativeID prop value of the WebView
   * @param script The JavaScript code to inject
   * @returns Promise that resolves with the result of the script execution
   */
  injectJavaScriptByNativeId(nativeId: string, script: string): Promise<string>;

  /**
   * Get the title of a WebView page by its nativeID.
   * Uses cached reference if available, otherwise searches view hierarchy.
   * @param nativeId The nativeID prop value of the WebView
   * @returns Promise that resolves with the page title
   */
  getWebViewTitle(nativeId: string): Promise<string>;
}

const { WebViewAccess } = NativeModules;

if (!WebViewAccess) {
  throw new Error(
    'WebViewAccess native module is not available. Make sure you have rebuilt your native app.'
  );
}

export default WebViewAccess as WebViewAccessModule;
