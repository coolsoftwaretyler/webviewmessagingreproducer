import { NativeModules } from 'react-native';

interface WebViewAccessModule {
  /**
   * Get the current URL of a WebView by its nativeID
   * @param nativeId The nativeID prop value of the WebView
   * @returns Promise that resolves with the current URL
   */
  getWebViewByNativeId(nativeId: string): Promise<string>;

  /**
   * Inject JavaScript into a WebView by its nativeID
   * @param nativeId The nativeID prop value of the WebView
   * @param script The JavaScript code to inject
   * @returns Promise that resolves with the result of the script execution
   */
  injectJavaScriptByNativeId(nativeId: string, script: string): Promise<string>;

  /**
   * Get the title of a WebView page by its nativeID
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
