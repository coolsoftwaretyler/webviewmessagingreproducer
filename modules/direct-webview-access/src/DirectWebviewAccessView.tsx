import { requireNativeView } from 'expo';
import * as React from 'react';

import { DirectWebviewAccessViewProps } from './DirectWebviewAccess.types';

const NativeView: React.ComponentType<DirectWebviewAccessViewProps> =
  requireNativeView('DirectWebviewAccess');

export default function DirectWebviewAccessView(props: DirectWebviewAccessViewProps) {
  return <NativeView {...props} />;
}
