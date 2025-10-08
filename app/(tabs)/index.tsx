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
import WebViewAccess from "../../WebViewAccess";

const linkToken = "link-sandbox-fc2f945e-9595-4cfc-9870-f292f1e33833";

export default function App() {
  const webviewRef = useRef<WebView>(null);
  const [linkReady, setLinkReady] = useState(false);

  usePlaidEmitter((data) => {
    console.log("Plaid link event at ", new Date().toISOString());
    injectJSViaModule(
      `document.body.innerHTML = "JavaScript injected at ${new Date().toISOString()}";`
    );
  });

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

  const injectJSViaModule = async (js: string) => {
    try {
      await WebViewAccess.injectJavaScriptByNativeId("webview", js);
    } catch (error) {
      console.error("Error injecting JS via module:", error);
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
        onPress={() =>
          injectJSViaModule(
            `document.body.innerHTML = "JavaScript injected at ${new Date().toISOString()}";`
          )
        }
      />
      <Button title="Reload Webview" onPress={reloadWebView} />

      <Button
        title="Inject JS via Native Module"
        onPress={() =>
          injectJSViaModule(
            `document.body.innerHTML = "JavaScript injected at ${new Date().toISOString()}";`
          )
        }
      />

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
