import Constants from "expo-constants";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

type ExpoExtra = {
  apiUrl?: string;
  wsUrl?: string;
  firebase?: Partial<FirebaseConfig>;
};

function getExtra(): ExpoExtra {
  return (Constants.expoConfig?.extra as ExpoExtra | undefined) ?? {};
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function deriveWebSocketUrl(apiUrl: string) {
  const trimmed = trimTrailingSlash(apiUrl);
  const withoutApiSuffix = trimmed.replace(/\/api$/, "/ws");
  return withoutApiSuffix.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
}

const extra = getExtra();

export const runtimeConfig = {
  apiUrl: trimTrailingSlash(
    process.env.EXPO_PUBLIC_API_URL?.trim() ||
      extra.apiUrl ||
      "http://localhost:8000/api",
  ),
  wsUrl: trimTrailingSlash(
    process.env.EXPO_PUBLIC_WS_URL?.trim() ||
      extra.wsUrl ||
      deriveWebSocketUrl(
        process.env.EXPO_PUBLIC_API_URL?.trim() ||
          extra.apiUrl ||
          "http://localhost:8000/api",
      ),
  ),
  firebase: {
    apiKey:
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ||
      extra.firebase?.apiKey ||
      "",
    authDomain:
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ||
      extra.firebase?.authDomain ||
      "",
    projectId:
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
      extra.firebase?.projectId ||
      "",
    storageBucket:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
      extra.firebase?.storageBucket ||
      "",
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ||
      extra.firebase?.messagingSenderId ||
      "",
    appId:
      process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ||
      extra.firebase?.appId ||
      "",
  } satisfies FirebaseConfig,
};

export const hasFirebaseConfig = Boolean(
  runtimeConfig.firebase.apiKey &&
  runtimeConfig.firebase.authDomain &&
  runtimeConfig.firebase.projectId &&
  runtimeConfig.firebase.appId,
);

export const hasBackendConfig = Boolean(runtimeConfig.apiUrl);
