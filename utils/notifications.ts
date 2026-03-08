import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { doc, setDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "../firebaseConfig";

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device.");
    return;
  }

  // Expo Go does not support remote push notifications since SDK 53.
  // getExpoPushTokenAsync() only works in a development build or production build.
  const isExpoGo = Constants.appOwnership === "expo";
  if (isExpoGo) {
    console.log(
      "Push token registration skipped: Expo Go does not support remote push notifications since SDK 53. " +
        "Run a development build (eas build --profile development) to test push notifications.",
    );
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Notification permission denied");
    return;
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: "0a7b5d36-35f2-4ae7-a3d3-c90a65db777c",
    })
  ).data;

  console.log("Expo Push Token:", token);

  try {
    const tokenDocRef = doc(db, "push_tokens", token);
    await setDoc(
      tokenDocRef,
      {
        token: token,
        platform: Platform.OS,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    console.log("Token saved to Firestore automatically!");
  } catch (error) {
    console.error("Error saving push token to Firestore:", error);
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}
