import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GitHubUser } from "./ProfileCard";

interface Props {
  user: GitHubUser;
  onViewProfile: () => void;
  onRemove: () => void;
}

export default function DeveloperCard({
  user,
  onViewProfile,
  onRemove,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onViewProfile}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        <View style={styles.info}>
          {user.name ? (
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
          ) : null}
          <Text style={styles.login} numberOfLines={1}>
            @{user.login}
          </Text>
          {user.bio ? (
            <Text style={styles.bio} numberOfLines={2}>
              {user.bio}
            </Text>
          ) : null}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={12} color="#8B949E" />
              <Text style={styles.statText}>{user.followers} followers</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="book-outline" size={12} color="#8B949E" />
              <Text style={styles.statText}>{user.public_repos} repos</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={onViewProfile}
          activeOpacity={0.85}
        >
          <Ionicons name="person-outline" size={14} color="#fff" />
          <Text style={styles.viewBtnText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={onRemove}
          activeOpacity={0.85}
        >
          <Ionicons name="trash-outline" size={14} color="#F85149" />
          <Text style={styles.removeBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#161B22",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#30363D",
    padding: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#30363D",
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E6EDF3",
    lineHeight: 20,
  },
  login: {
    fontSize: 13,
    color: "#58A6FF",
    marginBottom: 4,
  },
  bio: {
    fontSize: 12,
    color: "#8B949E",
    lineHeight: 17,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: "#8B949E",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  viewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#2EA043",
    borderRadius: 8,
    height: 38,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#1A0E0E",
    borderWidth: 1,
    borderColor: "#6E2530",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 38,
  },
  removeBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F85149",
  },
});
