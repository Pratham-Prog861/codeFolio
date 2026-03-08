import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DeveloperCard from "../components/DeveloperCard";
import { GitHubUser } from "../components/ProfileCard";

const STORAGE_KEY = "savedDevelopers";

export default function SavedDeveloperScreen() {
  const router = useRouter();
  const [devs, setDevs] = useState<GitHubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const loadSaved = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const usernames: string[] = raw ? JSON.parse(raw) : [];

      const profiles = await Promise.all(
        usernames.map(async (u) => {
          try {
            const res = await fetch(
              `https://api.github.com/users/${encodeURIComponent(u)}`,
            );
            if (!res.ok) return null;
            return res.json() as Promise<GitHubUser>;
          } catch {
            return null;
          }
        }),
      );

      setDevs(profiles.filter(Boolean) as GitHubUser[]);
    } catch {
      setDevs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, [loadSaved]),
  );

  const handleRemove = async (login: string) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const saved: string[] = raw ? JSON.parse(raw) : [];
      const updated = saved.filter((u) => u !== login);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setDevs((prev) => prev.filter((d) => d.login !== login));
      showToast("Developer removed");
    } catch {}
  };

  const handleViewProfile = (username: string) => {
    router.push({ pathname: "/", params: { username } });
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Ionicons name="bookmark" size={20} color="#E6EDF3" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Saved Developers</Text>
          <Text style={styles.headerSub}>Your favourites</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={loadSaved}
          activeOpacity={0.75}
        >
          <Ionicons name="refresh-outline" size={20} color="#8B949E" />
        </TouchableOpacity>
      </View>

      {/* Toast */}
      {toast ? (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#2EA043" />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2EA043" />
          <Text style={styles.loadingText}>Loading saved developers…</Text>
        </View>
      ) : devs.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconRing}>
            <Ionicons name="bookmark-outline" size={48} color="#30363D" />
          </View>
          <Text style={styles.emptyTitle}>No Saved Developers</Text>
          <Text style={styles.emptyBody}>
            Search a GitHub developer and save them to see them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={devs}
          keyExtractor={(item) => item.login}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.count}>
              {devs.length} saved developer{devs.length !== 1 ? "s" : ""}
            </Text>
          }
          renderItem={({ item }) => (
            <DeveloperCard
              user={item}
              onViewProfile={() => handleViewProfile(item.login)}
              onRemove={() => handleRemove(item.login)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
          ListFooterComponent={<View style={{ height: 24 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D1117",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#21262D",
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#21262D",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E6EDF3",
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  headerSub: {
    fontSize: 12,
    color: "#2EA043",
    fontWeight: "600",
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  refreshBtn: {
    marginLeft: "auto",
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#21262D",
    alignItems: "center",
    justifyContent: "center",
  },

  // Toast
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0E2016",
    borderWidth: 1,
    borderColor: "#2EA043",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toastText: {
    fontSize: 13,
    color: "#2EA043",
    fontWeight: "600",
  },

  // Loading / empty
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loadingText: {
    fontSize: 14,
    color: "#8B949E",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#161B22",
    borderWidth: 1,
    borderColor: "#30363D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E6EDF3",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyBody: {
    fontSize: 14,
    color: "#6E7681",
    textAlign: "center",
    lineHeight: 21,
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  count: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8B949E",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 14,
  },
});
