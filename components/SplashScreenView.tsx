import React, { useEffect, useRef } from "react";
import { Animated, Image, StatusBar, StyleSheet, View } from "react-native";

export default function SplashScreenView() {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 70,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoScale, taglineOpacity]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Background glow blobs */}
      <View style={styles.blobGreen} />
      <View style={styles.blobBlue} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.logoGlowRing} />
        <Image
          source={require("../assets/brand/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Turn GitHub into your developer portfolio
      </Animated.Text>

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        <LoadingDot delay={0} />
        <LoadingDot delay={190} />
        <LoadingDot delay={380} />
      </View>
    </View>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.delay(Math.max(0, 570 - delay)),
      ]),
    ).start();
  }, [delay, opacity]);

  return <Animated.View style={[styles.dot, { opacity }]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D1117",
    alignItems: "center",
    justifyContent: "center",
  },

  // Background decoration
  blobGreen: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#2EA043",
    opacity: 0.055,
    top: -60,
    right: -110,
  },
  blobBlue: {
    position: "absolute",
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: "#58A6FF",
    opacity: 0.055,
    bottom: 70,
    left: -90,
  },

  // Logo
  logoWrap: {
    marginBottom: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 280,
    height: 160,
    zIndex: 2,
  },
  logoGlowRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#00FFFF",
    opacity: 0.15,
  },
  tagline: {
    fontSize: 15,
    color: "#8B949E",
    textAlign: "center",
    paddingHorizontal: 48,
    lineHeight: 22,
  },

  // Loading dots
  dotsRow: {
    flexDirection: "row",
    gap: 9,
    position: "absolute",
    bottom: 68,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2EA043",
  },
});
