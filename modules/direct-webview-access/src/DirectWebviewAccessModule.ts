import { NativeModule, requireNativeModule } from "expo";

declare class DirectWebviewAccessModule extends NativeModule {
  injectJavaScriptByNativeId(nativeId: string, script: string): Promise<string>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<DirectWebviewAccessModule>(
  "DirectWebviewAccess"
);
