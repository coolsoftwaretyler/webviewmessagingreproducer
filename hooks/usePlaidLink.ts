import { useEffect, useState } from "react";
import {
  create,
  dismissLink,
  LinkExit,
  LinkIOSPresentationStyle,
  LinkLogLevel,
  LinkSuccess,
  open,
} from "react-native-plaid-link-sdk";

const linkToken = "link-sandbox-acf3d852-78f0-4e59-84d1-d7b7305087af";

export function usePlaidLink() {
  const [linkReady, setLinkReady] = useState(false);

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

  return { linkReady, openPlaidLink };
}
