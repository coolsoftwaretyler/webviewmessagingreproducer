import { NativeModule, requireNativeModule } from 'expo';

import { DirectWebviewAccessModuleEvents } from './DirectWebviewAccess.types';

declare class DirectWebviewAccessModule extends NativeModule<DirectWebviewAccessModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  registerWebView(nativeId: string): Promise<string>;
  unregisterWebView(nativeId: string): Promise<string>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<DirectWebviewAccessModule>('DirectWebviewAccess');
