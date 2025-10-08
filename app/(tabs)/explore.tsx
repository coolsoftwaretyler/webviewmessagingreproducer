import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
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

const linkToken = "link-sandbox-fc2f945e-9595-4cfc-9870-f292f1e33833";

const LOGGER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a1a;
      color: #fff;
      padding: 16px;
    }
    h1 {
      font-size: 20px;
      margin-bottom: 16px;
      color: #ef4444;
    }
    #log-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .log-entry {
      padding: 12px;
      border-radius: 6px;
      border-left: 4px solid;
      font-size: 13px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .log-entry.info {
      background: #1e3a5f;
      border-color: #60a5fa;
    }
    .log-entry.success {
      background: #1e3a2f;
      border-color: #34d399;
    }
    .log-entry.error {
      background: #3a1e1e;
      border-color: #ef4444;
    }
    .log-entry.event {
      background: #2e1e3a;
      border-color: #a78bfa;
    }
    .timestamp {
      font-size: 11px;
      opacity: 0.7;
      margin-bottom: 4px;
    }
    .message {
      font-family: 'Courier New', monospace;
    }
  </style>
</head>
<body>
  <h1>Event Logger (No Bypass)</h1>
  <div id="log-container"></div>

  <script>
    window.eventHistory = [];

    window.logger = {
      log: function(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3
        });

        const entry = { timestamp, message, type };
        window.eventHistory.push(entry);

        const container = document.getElementById('log-container');
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry ' + type;
        logEntry.innerHTML =
          '<div class="timestamp">' + timestamp + '</div>' +
          '<div class="message">' + message + '</div>';

        container.appendChild(logEntry);

        // Auto-scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
      },

      clear: function() {
        window.eventHistory = [];
        document.getElementById('log-container').innerHTML = '';
      }
    };

    // Initial log
    window.logger.log('Logger initialized (No Bypass)', 'success');
  </script>
</body>
</html>
`;

export default function NoBypassTab() {
  const webviewRef = useRef<WebView>(null);
  const [linkReady, setLinkReady] = useState(false);

  // Initialize Plaid Link on mount
  useEffect(() => {
    const initializePlaidLink = () => {
      try {
        create({
          token: linkToken,
          logLevel: LinkLogLevel.ERROR,
          noLoadingState: false,
        });
        setLinkReady(true);
      } catch (error) {
        console.error("Error initializing Plaid Link:", error);
      }
    };

    initializePlaidLink();
  }, []);

  // OLD APPROACH: Using webviewRef.current?.injectJavaScript
  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'event' = 'info') => {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });

    const escapedMessage = message.replace(/'/g, "\\'").replace(/\n/g, "\\n");
    const script = `window.logger.log('${escapedMessage}', '${type}');`;

    console.log(`[${timestamp}] [NO BYPASS] [${type.toUpperCase()}]`, message);

    // OLD WAY: Using ref
    webviewRef.current?.injectJavaScript(script);
  };

  usePlaidEmitter((data) => {
    const eventName = data.eventName || "UNKNOWN_EVENT";
    addLog(`${eventName}`, "event");
  });

  const reloadWebView = () => {
    webviewRef.current?.reload();
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
        title="Open Plaid Link"
        onPress={openPlaidLink}
        disabled={!linkReady}
      />
      <Button title="Reload Webview" onPress={reloadWebView} />

      <WebView
        style={styles.webview}
        source={{ html: LOGGER_HTML }}
        ref={webviewRef}
        nativeID="webview-no-bypass"
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
