import { NativeModule, requireNativeModule } from 'expo';

import { DirectWebviewAccessModuleEvents } from './DirectWebviewAccess.types';

declare class DirectWebviewAccessModule extends NativeModule<DirectWebviewAccessModuleEvents> {
  injectJavaScriptByNativeId(nativeId: string, script: string): Promise<string>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<DirectWebviewAccessModule>('DirectWebviewAccess');
