import Constants from "expo-constants";
import { useRef } from "react";
import { Button, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import CustomLink from "../../CustomLink";

export default function App() {
  const webviewRef = useRef<WebView>(null);

  const injectJavaScriptToWebView = (
    timestamp: string,
    nativeTimestamp?: string 
  ) => {
    webviewRef.current?.injectJavaScript(
      `document.body.innerHTML = "JavaScript injected at ${timestamp} with native timestamp ${nativeTimestamp}";`
    );
  };

  const reloadWebView = () => {
    webviewRef.current?.reload();
  };

  const openCustomLink = () => {
    CustomLink.open((data) => {
      // Debug output
      console.log('Callback received:', data);
      console.log('Native Timestamp:', data.nativeTimestamp);
      console.log('Native Timestamp (ms):', data.nativeTimestampMillis);
      console.log('JS Callback Timestamp (ms):', data.jsTimestampMillis);

      const delay = data.jsTimestampMillis - data.nativeTimestampMillis;
      console.log(`Delay between Native and JS callback: ${delay}ms`);

      injectJavaScriptToWebView(new Date().toISOString(), data.nativeTimestamp);
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Inject JS to webview"
        onPress={() => injectJavaScriptToWebView(new Date().toISOString())}
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
