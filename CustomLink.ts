import { NativeModules } from 'react-native';

interface CallbackData {
  kotlinTimestamp: string;
  kotlinTimestampMillis: number;
  jsTimestampMillis: number;
}

interface CustomLinkModule {
  open(onInject: (data: CallbackData) => void): void;
}

const { CustomLink } = NativeModules;

export default CustomLink as CustomLinkModule;
export type { CallbackData };
