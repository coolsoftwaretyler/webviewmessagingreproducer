import Constants from "expo-constants";
import { useRef } from "react";
import { Button, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import CustomLink from '../../CustomLink';

export default function App() {
  const webviewRef = useRef<WebView>(null);

  const openCustomLink = () => {
    CustomLink.open(
      (success) => {
        console.log('Custom Link Success:', success);
        console.log('Public Token:', success.publicToken);
        console.log('Message:', success.message);
        // Handle successful link
      },
      (exit) => {
        console.log('Custom Link Exit:', exit);
        console.log('Message:', exit.message);
        // Handle exit
      }
    );
  };

  return (
    <View style={styles.container}>
      <Button
        title="Open Custom Link Activity"
        onPress={openCustomLink}
      />
      <Button
        title="Trigger Alert"
        onPress={() =>
          webviewRef.current?.injectJavaScript('alert("Hello, world!")')
        }
      />
      <WebView
        style={styles.webview}
        source={{ uri: "https://expo.dev" }}
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
