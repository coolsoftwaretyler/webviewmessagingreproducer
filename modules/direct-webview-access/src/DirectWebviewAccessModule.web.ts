import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './DirectWebviewAccess.types';

type DirectWebviewAccessModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class DirectWebviewAccessModule extends NativeModule<DirectWebviewAccessModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(DirectWebviewAccessModule, 'DirectWebviewAccessModule');
