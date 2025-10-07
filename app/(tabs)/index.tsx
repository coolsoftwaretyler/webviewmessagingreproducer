import Constants from "expo-constants";
import { useRef } from "react";
import { Button, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import CustomLink, { useCustomLinkEmitter } from "../../CustomLink";

export default function App() {
  const webviewRef = useRef<WebView>(null);

  // Listen to custom events from the native module
  useCustomLinkEmitter((data) => {
    console.log("Event received via emitter:", data);
    console.log("Native Timestamp:", data.nativeTimestamp);
    console.log("Native Timestamp (ms):", data.nativeTimestampMillis);
    console.log("JS Event Timestamp (ms):", data.jsTimestampMillis);

    const delay = data.jsTimestampMillis - data.nativeTimestampMillis;
    console.log(`Delay between Native and JS event: ${delay}ms`);
    injectJavaScriptToWebView(data.nativeTimestamp);
  });

  const injectJavaScriptToWebView = (nativeTimestamp?: string) => {
    webviewRef.current?.injectJavaScript(
      `document.body.innerHTML = "JavaScript injected at ${new Date().toISOString()} with native timestamp ${nativeTimestamp}";`
    );
  };

  const reloadWebView = () => {
    webviewRef.current?.reload();
  };

  const openCustomLink = () => {
    CustomLink.open(() => {
      console.log("Callback fired at ", new Date().toISOString());
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Inject JS to webview"
        onPress={() => injectJavaScriptToWebView()}
      />
      <Button title="Open Custom Link" onPress={openCustomLink} />
      <Button title="Reload Webview" onPress={reloadWebView} />
      <WebView
        style={styles.webview}
        source={{ uri: "https://infinite.red" }}
        ref={webviewRef}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  webview: {
    flex: 1,
  },
});
