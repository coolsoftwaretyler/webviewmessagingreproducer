import Constants from "expo-constants";
import { useRef, useState } from "react";
import { Button, StyleSheet, View, Alert } from "react-native";
import {
  create,
  dismissLink,
  LinkExit,
  LinkIOSPresentationStyle,
  LinkLogLevel,
  LinkSuccess,
  open,
  usePlaidEmitter,
} from "react-native-plaid-link-sdk";
import { WebView } from "react-native-webview";
import WebViewAccess from "../../WebViewAccess";

const linkToken = "link-sandbox-3d3a5dbd-3fa0-4bf2-a9b8-f4cff7b60249";

export default function App() {
  const webviewRef = useRef<WebView>(null);
  const [linkReady, setLinkReady] = useState(false);

  usePlaidEmitter((data) => {
    console.log("Plaid link event at ", new Date().toISOString());
    injectJavaScriptToWebView();
  });

  const injectJavaScriptToWebView = () => {
    webviewRef.current?.injectJavaScript(
      `document.body.innerHTML = "JavaScript injected at ${new Date().toISOString()}";`
    );
  };

  const reloadWebView = () => {
    webviewRef.current?.reload();
  };

  const initializePlaidLink = () => {
    if (!linkToken) {
      alert("Please enter a link token first");
      return;
    }

    if (!linkToken.startsWith("link-")) {
      alert(
        "Invalid link token format. Plaid link tokens must start with 'link-'. Example: link-sandbox-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      );
      return;
    }

    try {
      // Create/initialize the Plaid Link configuration
      create({
        token: linkToken,
        logLevel: LinkLogLevel.ERROR,
        noLoadingState: false,
      });

      setLinkReady(true);
      alert("Plaid Link initialized! Now tap 'Open Plaid Link' to open it.");
    } catch (error) {
      console.error("Error initializing Plaid Link:", error);
      alert(`Error initializing Plaid Link: ${error}`);
    }
  };

  const openPlaidLink = () => {
    if (!linkReady) {
      alert("Please initialize Plaid Link first");
      return;
    }

    open({
      onSuccess: (success: LinkSuccess) => {
        dismissLink();
      },
      onExit: (linkExit: LinkExit) => {
        dismissLink();
      },
      iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
    });
  };

  // Demo: Access WebView using nativeID
  const getWebViewUrl = async () => {
    try {
      const url = await WebViewAccess.getWebViewByNativeId("webview");
      Alert.alert("WebView URL", url);
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const getWebViewTitle = async () => {
    try {
      const title = await WebViewAccess.getWebViewTitle("webview");
      Alert.alert("WebView Title", title);
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const injectJSViaModule = async () => {
    try {
      const result = await WebViewAccess.injectJavaScriptByNativeId(
        "webview",
        "document.body.style.backgroundColor = 'lightblue'; document.title;"
      );
      Alert.alert("Injected JS", `Background changed to blue. Title: ${result}`);
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Initialize Plaid Link"
        onPress={initializePlaidLink}
        disabled={linkReady}
      />
      <Button
        title="Open Plaid Link"
        onPress={openPlaidLink}
        disabled={!linkReady}
      />
      <Button
        title="Inject JS to webview"
        onPress={() => injectJavaScriptToWebView()}
      />
      <Button title="Reload Webview" onPress={reloadWebView} />

      {/* Native Module Demo Buttons */}
      <Button title="Get WebView URL (Native)" onPress={getWebViewUrl} />
      <Button title="Get WebView Title (Native)" onPress={getWebViewTitle} />
      <Button title="Inject JS via Native Module" onPress={injectJSViaModule} />

      <WebView
        style={styles.webview}
        source={{ uri: "https://infinite.red" }}
        ref={webviewRef}
        nativeID="webview"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
  },
});
