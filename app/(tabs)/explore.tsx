import { useRef } from "react";
import { usePlaidEmitter } from "react-native-plaid-link-sdk";
import { WebView } from "react-native-webview";
import { PlaidWebViewLogger } from "../../components/PlaidWebViewLogger";
import { createLogScript, formatTimestamp } from "../../constants/logger";

export default function NoBypassTab() {
  const webviewRef = useRef<WebView>(null);

  const addLog = (
    message: string,
    type: "info" | "success" | "error" | "event" = "info"
  ) => {
    const timestamp = formatTimestamp();
    const script = createLogScript(message, type);

    console.log(`[${timestamp}] [NO BYPASS] [${type.toUpperCase()}]`, message);

    // OLD WAY: Using ref
    webviewRef.current?.injectJavaScript(script);
  };

  usePlaidEmitter((data) => {
    const eventName = data.eventName || "UNKNOWN_EVENT";
    addLog(eventName, "event");
  });

  return (
    <PlaidWebViewLogger
      title="Event Logger (No Bypass)"
      nativeID="webview-no-bypass"
      ref={webviewRef}
    />
  );
}
