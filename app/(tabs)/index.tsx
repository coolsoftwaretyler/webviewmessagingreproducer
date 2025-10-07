import Constants from "expo-constants";
import { useRef, useState } from "react";
import { Button, StyleSheet, View } from "react-native";
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

const linkToken = "link-sandbox-27fa592e-482d-454c-94d0-67b104face24";

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
