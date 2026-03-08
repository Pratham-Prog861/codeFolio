import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface TrendingRepo {
  author: string;
  name: string;
  avatar: string;
  url: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  currentPeriodStars: number;
}

interface Props {
  repo: TrendingRepo;
  rank: number;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function TrendingRepoCard({ repo, rank }: Props) {
  const openRepo = () => WebBrowser.openBrowserAsync(repo.url);

  return (
    <View style={styles.card}>
      {/* Top row: rank + owner/repo name */}
      <View style={styles.topRow}>
        <Text style={styles.rank}>#{rank}</Text>
        <View style={styles.nameBlock}>
          <Text style={styles.owner} numberOfLines={1}>
            {repo.author}
          </Text>
          <Text style={styles.slash}> / </Text>
          <Text style={styles.repoName} numberOfLines={1}>
            {repo.name}
          </Text>
        </View>
      </View>

      {/* Description */}
      {repo.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {repo.description}
        </Text>
      ) : null}

      {/* Bottom row: language + stars + forks + open */}
      <View style={styles.bottomRow}>
        {repo.language ? (
          <View style={styles.langBadge}>
            <View
              style={[
                styles.langDot,
                {
                  backgroundColor: repo.languageColor
                    ? repo.languageColor
                    : "#8B949E",
                },
              ]}
            />
            <Text style={styles.langText}>{repo.language}</Text>
          </View>
        ) : null}

        <View style={styles.badge}>
          <Ionicons name="star" size={12} color="#D29922" />
          <Text style={styles.badgeText}>{formatCount(repo.stars)}</Text>
        </View>

        <View style={styles.badge}>
          <Ionicons name="git-network-outline" size={12} color="#8B949E" />
          <Text style={styles.badgeText}>{formatCount(repo.forks)}</Text>
        </View>

        {repo.currentPeriodStars > 0 ? (
          <View style={styles.trendBadge}>
            <Ionicons name="trending-up" size={12} color="#2EA043" />
            <Text style={styles.trendText}>
              +{formatCount(repo.currentPeriodStars)}
            </Text>
          </View>
        ) : null}

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.openBtn}
          onPress={openRepo}
          activeOpacity={0.75}
        >
          <Text style={styles.openBtnText}>Open</Text>
          <Ionicons name="arrow-forward" size={12} color="#2EA043" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#161B22",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#30363D",
    padding: 14,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  rank: {
    fontSize: 11,
    fontWeight: "700",
    color: "#484F58",
    minWidth: 22,
  },
  nameBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  owner: {
    fontSize: 13,
    color: "#8B949E",
    fontWeight: "500",
    flexShrink: 1,
  },
  slash: {
    fontSize: 13,
    color: "#484F58",
  },
  repoName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#58A6FF",
    flexShrink: 1,
  },
  description: {
    fontSize: 13,
    color: "#8B949E",
    lineHeight: 18,
    marginBottom: 10,
    marginLeft: 30,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 30,
  },
  langBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  langDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  langText: {
    fontSize: 12,
    color: "#8B949E",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  badgeText: {
    fontSize: 12,
    color: "#8B949E",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(46,160,67,0.12)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  trendText: {
    fontSize: 11,
    color: "#2EA043",
    fontWeight: "600",
  },
  spacer: { flex: 1 },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#21262D",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#30363D",
  },
  openBtnText: {
    fontSize: 12,
    color: "#2EA043",
    fontWeight: "600",
  },
});
