import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  title: string;
  description: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  iconBg: string;
  slideWidth: number;
}

export default function OnboardingSlide({
  title,
  description,
  iconName,
  iconColor,
  iconBg,
  slideWidth,
}: Props) {
  return (
    <View style={[styles.slide, { width: slideWidth }]}>
      {/* Illustration area */}
      <View style={styles.illustrationArea}>
        <View style={[styles.glowRing, { borderColor: iconColor + "28" }]} />
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <View style={[styles.iconInner, { borderColor: iconColor + "45" }]}>
            <Ionicons name={iconName} size={70} color={iconColor} />
          </View>
        </View>
        {/* GitHub badge decoration */}
        <View
          style={[
            styles.badge,
            { backgroundColor: iconBg, borderColor: iconColor + "45" },
          ]}
        >
          <Ionicons name="logo-github" size={15} color={iconColor} />
        </View>
      </View>

      {/* Text area */}
      <View style={styles.textArea}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 16,
  },
  illustrationArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 178,
    height: 178,
    borderRadius: 89,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  badge: {
    position: "absolute",
    bottom: "12%",
    right: "12%",
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textArea: {
    paddingBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#E6EDF3",
    textAlign: "center",
    letterSpacing: -0.7,
    marginBottom: 14,
    lineHeight: 34,
  },
  description: {
    fontSize: 15,
    color: "#8B949E",
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 310,
  },
});
