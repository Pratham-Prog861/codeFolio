import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
  language: string | null;
  forks_count: number;
}

interface Props {
  repo: GitHubRepo;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Rust: "#DEA584",
  Go: "#00ADD8",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  "C#": "#178600",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Ruby: "#CC342D",
  PHP: "#4F5D95",
  Dart: "#00B4AB",
  Shell: "#89E051",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Vue: "#41B883",
};

export default function RepoCard({ repo }: Props) {
  const openRepo = () => WebBrowser.openBrowserAsync(repo.html_url);
  const langColor = repo.language
    ? (LANG_COLORS[repo.language] ?? "#8B949E")
    : undefined;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Ionicons name="book-outline" size={13} color="#8B949E" />
        <Text style={styles.repoName} numberOfLines={1}>
          {repo.name}
        </Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {repo.description ?? "No description provided."}
      </Text>

      <View style={styles.bottomRow}>
        {repo.language ? (
          <View style={styles.lang}>
            <View style={[styles.langDot, { backgroundColor: langColor }]} />
            <Text style={styles.langText}>{repo.language}</Text>
          </View>
        ) : null}
        <View style={styles.badge}>
          <Ionicons name="star" size={12} color="#D29922" />
          <Text style={styles.badgeText}>
            {repo.stargazers_count.toLocaleString()}
          </Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="git-network-outline" size={12} color="#8B949E" />
          <Text style={styles.badgeText}>{repo.forks_count}</Text>
        </View>
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#30363D",
    padding: 14,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  repoName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#58A6FF",
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: "#8B949E",
    lineHeight: 18,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  lang: {
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
