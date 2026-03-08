import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import OnboardingScreen from "../components/OnboardingScreen";
import SplashScreenView from "../components/SplashScreenView";
import { registerForPushNotificationsAsync } from "../utils/notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type AppState = "splash" | "onboarding" | "main";

export default function RootLayout() {
  const [appState, setAppState] = useState<AppState>("splash");

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const seen = await AsyncStorage.getItem("hasSeenOnboarding");
        const nextState = seen === "true" ? "main" : "onboarding";
        setAppState(nextState);
        if (nextState === "main") {
          registerForPushNotificationsAsync().then((token) => {
            if (token) console.log("Push token:", token);
          });
        }
      } catch {
        setAppState("main");
      }
    }, 2300);
    return () => clearTimeout(timer);
  }, []);

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
    } catch {}
    setAppState("main");
    registerForPushNotificationsAsync().then((token) => {
      if (token) console.log("Push token:", token);
    });
  };

  if (appState === "splash") return <SplashScreenView />;
  if (appState === "onboarding")
    return <OnboardingScreen onDone={finishOnboarding} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#161B22",
          borderTopColor: "#30363D",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#2EA043",
        tabBarInactiveTintColor: "#6E7681",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="repoExplorer"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="savedDeveloper"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="githubResume"
        options={{
          title: "Resume",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
