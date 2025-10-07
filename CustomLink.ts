import { useEffect } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';

interface CallbackData {
  nativeTimestamp: string;
  nativeTimestampMillis: number;
  jsTimestampMillis: number;
}

interface CustomLinkModule {
  open(onInject: (data: CallbackData) => void): void;
}

type CustomEventListener = (data: CallbackData) => void;

const { CustomLink } = NativeModules;

export const useCustomLinkEmitter = (customEventListener: CustomEventListener) => {
  useEffect(() => {
    const emitter = new NativeEventEmitter(CustomLink);
    const listener = emitter.addListener('onCustomEvent', customEventListener);

    return function cleanup() {
      listener.remove();
    };
  }, []);
};

export default CustomLink as CustomLinkModule;
export type { CallbackData, CustomEventListener };
