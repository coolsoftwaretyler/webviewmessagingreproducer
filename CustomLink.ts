import { NativeModules } from 'react-native';

interface CustomLinkSuccess {
  status: string;
  publicToken: string;
  message: string;
}

interface CustomLinkExit {
  status: string;
  message: string;
}

interface CustomLinkModule {
  open(
    onSuccess: (success: CustomLinkSuccess) => void,
    onExit: (exit: CustomLinkExit) => void
  ): void;
}

const { CustomLink } = NativeModules;

export default CustomLink as CustomLinkModule;
export type { CustomLinkSuccess, CustomLinkExit };
