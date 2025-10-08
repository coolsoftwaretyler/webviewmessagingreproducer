import * as React from 'react';

import { DirectWebviewAccessViewProps } from './DirectWebviewAccess.types';

export default function DirectWebviewAccessView(props: DirectWebviewAccessViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
