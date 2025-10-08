import Constants from "expo-constants";
import { forwardRef } from "react";
import { Button, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { createLoggerHTML } from "../constants/logger";
import { usePlaidLink } from "../hooks/usePlaidLink";

interface PlaidWebViewLoggerProps {
  title: string;
  nativeID: string;
}

export const PlaidWebViewLogger = forwardRef<WebView, PlaidWebViewLoggerProps>(
  ({ title, nativeID }, ref) => {
    const { linkReady, openPlaidLink } = usePlaidLink();

    return (
      <View style={styles.container}>
        <Button
          title="Open Plaid Link"
          onPress={openPlaidLink}
          disabled={!linkReady}
        />
        <Button
          title="Reload Webview"
          onPress={() => (ref as any)?.current?.reload()}
        />

        <WebView
          style={styles.webview}
          source={{ html: createLoggerHTML(title) }}
          ref={ref}
          nativeID={nativeID}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  webview: {
    flex: 1,
  },
});
