import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
  created_at: string;
  location: string | null;
  company: string | null;
  blog: string | null;
}

interface Props {
  user: GitHubUser;
}

export default function ProfileCard({ user }: Props) {
  const openProfile = () => WebBrowser.openBrowserAsync(user.html_url);

  const shareProfile = () =>
    Share.share({
      message: `Check out ${user.name ?? user.login}'s GitHub profile: ${user.html_url}`,
      title: `${user.name ?? user.login} on GitHub`,
    });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        <View style={styles.nameBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {user.name ?? user.login}
          </Text>
          <Text style={styles.login}>@{user.login}</Text>
          {user.location ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={12} color="#8B949E" />
              <Text style={styles.metaText}>{user.location}</Text>
            </View>
          ) : null}
          {user.company ? (
            <View style={styles.metaRow}>
              <Ionicons name="business-outline" size={12} color="#8B949E" />
              <Text style={styles.metaText}>{user.company}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {user.followers.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {user.following.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user.public_repos}</Text>
          <Text style={styles.statLabel}>Repos</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={openProfile}
          activeOpacity={0.8}
        >
          <Ionicons name="open-outline" size={15} color="#fff" />
          <Text style={styles.primaryBtnText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={shareProfile}
          activeOpacity={0.8}
        >
          <Ionicons name="share-social-outline" size={15} color="#2EA043" />
          <Text style={styles.secondaryBtnText}>Share</Text>
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
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#30363D",
  },
  nameBlock: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E6EDF3",
    letterSpacing: -0.3,
  },
  login: {
    fontSize: 14,
    color: "#58A6FF",
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: "#8B949E",
  },
  bio: {
    fontSize: 14,
    color: "#8B949E",
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1117",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#E6EDF3",
  },
  statLabel: {
    fontSize: 11,
    color: "#8B949E",
    marginTop: 2,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#30363D",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2EA043",
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2EA043",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  secondaryBtnText: {
    color: "#2EA043",
    fontSize: 14,
    fontWeight: "600",
  },
});
