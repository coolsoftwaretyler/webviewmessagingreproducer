import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, StyleSheet, View } from "react-native";
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

  // Register the WebView on mount for cached access
  useEffect(() => {
    const registerWebViewAsync = async () => {
      try {
        await WebViewAccess.registerWebView("webview");
        console.log("WebView registered successfully");
      } catch (error) {
        console.error("Failed to register WebView:", error);
      }
    };

    // Small delay to ensure WebView is mounted
    const timer = setTimeout(registerWebViewAsync, 500);

    return () => {
      clearTimeout(timer);
      WebViewAccess.unregisterWebView("webview");
    };
  }, []);

  usePlaidEmitter((data) => {
    console.log("Plaid link event at ", new Date().toISOString());
    console.log("Plaid event data:", data);

    // Don't await, but do catch errors
    injectJSViaModule(
      `document.body.innerHTML = "JavaScript injected at ${new Date().toISOString()}";`
    ).catch((error) => {
      console.error("Failed to inject JavaScript from Plaid emitter:", error);
      Alert.alert("Injection Error", String(error));
    });
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
    console.log("injectJSViaModule called with script:", js.substring(0, 50));
    try {
      const result = await WebViewAccess.injectJavaScriptByNativeId("webview", js);
      console.log("JavaScript injection succeeded, result:", result);
      return result;
    } catch (error) {
      console.error("Error injecting JS via module:", error);
      throw error;
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
