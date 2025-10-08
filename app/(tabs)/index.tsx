import { useRef } from "react";
import { usePlaidEmitter } from "react-native-plaid-link-sdk";
import { WebView } from "react-native-webview";
import { PlaidWebViewLogger } from "../../components/PlaidWebViewLogger";
import { createLogScript, formatTimestamp } from "../../constants/logger";
import DirectWebviewAccessModule from "../../modules/direct-webview-access";

export default function App() {
  const webviewRef = useRef<WebView>(null);

  const addLog = async (
    message: string,
    type: "info" | "success" | "error" | "event" = "info"
  ) => {
    const timestamp = formatTimestamp();
    const script = createLogScript(message, type);

    console.log(`[${timestamp}] [${type.toUpperCase()}]`, message);

    try {
      await DirectWebviewAccessModule.injectJavaScriptByNativeId(
        "webview",
        script
      );
    } catch (error) {
      console.error(`[${timestamp}] Failed to add log to WebView:`, error);
    }
  };

  usePlaidEmitter((data) => {
    const eventName = data.eventName || "UNKNOWN_EVENT";
    addLog(eventName, "event");
  });

  return (
    <PlaidWebViewLogger
      title="Event Logger"
      nativeID="webview"
      ref={webviewRef}
    />
  );
}
