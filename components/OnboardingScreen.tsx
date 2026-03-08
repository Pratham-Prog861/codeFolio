import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingSlide from "./OnboardingSlide";

const { width } = Dimensions.get("window");

interface Slide {
  id: string;
  title: string;
  description: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  iconBg: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    title: "Discover GitHub\nDevelopers",
    description:
      "Search any GitHub username and explore their profile, repositories, and contributions.",
    iconName: "search-outline",
    iconColor: "#58A6FF",
    iconBg: "#0B1F38",
  },
  {
    id: "2",
    title: "Explore Trending\nProjects",
    description:
      "Discover trending repositories and explore amazing open source projects from the GitHub community.",
    iconName: "flame-outline",
    iconColor: "#F78166",
    iconBg: "#2D1407",
  },
  {
    id: "3",
    title: "Build Your\nDeveloper Resume",
    description:
      "Automatically generate a professional resume from your GitHub profile and share it with ease.",
    iconName: "newspaper-outline",
    iconColor: "#2EA043",
    iconBg: "#0E2016",
  },
];

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  );

  const isLast = currentIndex === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) {
      onDone();
    } else {
      flatRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView
      style={styles.root}
      edges={["top", "bottom", "left", "right"]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageHint}>
          {currentIndex + 1} / {SLIDES.length}
        </Text>
        {!isLast ? (
          <TouchableOpacity
            onPress={onDone}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OnboardingSlide
            title={item.title}
            description={item.description}
            iconName={item.iconName}
            iconColor={item.iconColor}
            iconBg={item.iconBg}
            slideWidth={width}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        scrollEventThrottle={16}
        bounces={false}
        style={{ flex: 1 }}
      />

      {/* Bottom navigation */}
      <View style={styles.bottom}>
        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          style={[styles.btn, isLast && styles.btnPrimary]}
          onPress={goNext}
          activeOpacity={0.85}
        >
          {isLast ? (
            <>
              <Ionicons name="rocket-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Get Started</Text>
            </>
          ) : (
            <>
              <Text style={styles.btnText}>Next</Text>
              <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D1117",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  pageHint: {
    fontSize: 13,
    fontWeight: "600",
    color: "#484F58",
    letterSpacing: 0.5,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6E7681",
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 10,
    gap: 18,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#21262D",
  },
  dotActive: {
    width: 28,
    backgroundColor: "#2EA043",
    borderRadius: 4,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#21262D",
    borderRadius: 14,
    height: 54,
    borderWidth: 1,
    borderColor: "#30363D",
  },
  btnPrimary: {
    backgroundColor: "#2EA043",
    borderColor: "#2EA043",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.1,
  },
});
