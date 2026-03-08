import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GitHubUser } from "./ProfileCard";

interface Props {
  user: GitHubUser;
}

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function StatRow({
  icon,
  label,
  value,
}: {
  icon: IoniconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={14} color="#58A6FF" />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function ResumeCard({ user }: Props) {
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Account Statistics</Text>
      <StatRow
        icon="git-branch-outline"
        label="Public Repositories"
        value={String(user.public_repos)}
      />
      <View style={styles.sep} />
      <StatRow
        icon="people-outline"
        label="Followers"
        value={user.followers.toLocaleString()}
      />
      <View style={styles.sep} />
      <StatRow
        icon="person-add-outline"
        label="Following"
        value={user.following.toLocaleString()}
      />
      <View style={styles.sep} />
      <StatRow icon="calendar-outline" label="Member Since" value={joinDate} />
      <View style={styles.sep} />
      <StatRow
        icon="link-outline"
        label="Profile URL"
        value={user.html_url.replace("https://", "")}
      />
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
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8B949E",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#21262D",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: "#8B949E",
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
    color: "#E6EDF3",
    fontWeight: "600",
    maxWidth: "55%",
    textAlign: "right",
  },
  sep: {
    height: 1,
    backgroundColor: "#21262D",
  },
});
