import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContributionGraph from "../components/ContributionGraph";
import ProfileCard, { GitHubUser } from "../components/ProfileCard";
import RepoCard, { GitHubRepo } from "../components/RepoCard";
import ResumeCard from "../components/ResumeCard";

const STORAGE_KEY = "savedDevelopers";

export default function Index() {
  const params = useLocalSearchParams<{ username?: string }>();

  const [query, setQuery] = useState("");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedUser, setSearchedUser] = useState("");
  const [saveMsg, setSaveMsg] = useState<"saved" | "exists" | null>(null);

  useEffect(() => {
    if (params.username) {
      const name = params.username as string;
      setQuery(name);
      fetchProfile(name);
    }
  }, [params.username]);

  const handleSearch = async () => {
    const name = query.trim();
    if (!name) return;
    fetchProfile(name);
  };

  const fetchProfile = async (name: string) => {
    setLoading(true);
    setError(null);
    setSaveMsg(null);
    setUser(null);
    setRepos([]);

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(name)}`),
        fetch(
          `https://api.github.com/users/${encodeURIComponent(name)}/repos?per_page=100&sort=stars`,
        ),
      ]);

      if (userRes.status === 404) {
        setError(`No GitHub user found for "${name}".`);
        setLoading(false);
        return;
      }

      if (!userRes.ok) {
        setError(
          userRes.status === 403
            ? "GitHub API rate limit reached. Try again in a moment."
            : "Failed to fetch data. Please try again.",
        );
        setLoading(false);
        return;
      }

      const userData: GitHubUser = await userRes.json();
      const reposData: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];

      const top5 = [...reposData]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5);

      setUser(userData);
      setRepos(top5);
      setSearchedUser(name);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const saved: string[] = raw ? JSON.parse(raw) : [];
    if (saved.includes(user.login)) {
      setSaveMsg("exists");
    } else {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...saved, user.login]),
      );
      setSaveMsg("saved");
    }
    setTimeout(() => setSaveMsg(null), 2500);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Ionicons name="logo-github" size={22} color="#E6EDF3" />
          </View>
          <View>
            <Text style={styles.headerTitle}>GitHub Profile</Text>
            <Text style={styles.headerSub}>Viewer</Text>
          </View>
        </View>

        {/* ── Search bar ── */}
        <View style={styles.searchBarRow}>
          <Ionicons
            name="search-outline"
            size={16}
            color="#484F58"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search GitHub username…"
            placeholderTextColor="#484F58"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity
              onPress={() => setQuery("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={16} color="#484F58" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.searchBtn, loading && styles.searchBtnLoading]}
          onPress={handleSearch}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="search" size={15} color="#fff" />
              <Text style={styles.searchBtnText}>Search</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── Error ── */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#F85149" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Results ── */}
        {user ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ProfileCard user={user} />

            {/* ── Save Developer ── */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                saveMsg === "exists" && styles.saveBtnExists,
              ]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Ionicons
                name={saveMsg === "exists" ? "bookmark" : "bookmark-outline"}
                size={16}
                color={saveMsg === "exists" ? "#E3B341" : "#fff"}
              />
              <Text
                style={[
                  styles.saveBtnText,
                  saveMsg === "exists" && styles.saveBtnTextExists,
                ]}
              >
                {saveMsg === "exists"
                  ? "Already saved"
                  : saveMsg === "saved"
                    ? "Developer saved!"
                    : "Save Developer"}
              </Text>
            </TouchableOpacity>

            <ResumeCard user={user} />

            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>Contribution Graph</Text>
              <ContributionGraph username={searchedUser} />
            </View>

            {repos.length > 0 ? (
              <View>
                <Text style={styles.sectionLabel}>
                  Top {repos.length} Repositories
                </Text>
                {repos.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </View>
            ) : null}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        ) : null}

        {/* ── Empty state ── */}
        {!user && !loading && !error ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconRing}>
              <Ionicons name="logo-github" size={52} color="#30363D" />
            </View>
            <Text style={styles.emptyTitle}>Find a developer</Text>
            <Text style={styles.emptyBody}>
              Enter any GitHub username to explore their profile, repositories,
              and contribution history.
            </Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D1117",
  },
  flex: { flex: 1 },

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

  // Search
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161B22",
    borderWidth: 1,
    borderColor: "#30363D",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#E6EDF3",
    height: "100%",
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#2EA043",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
    height: 46,
  },
  searchBtnLoading: {
    opacity: 0.7,
  },
  searchBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#160B0B",
    borderWidth: 1,
    borderColor: "#6E2530",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#F85149",
  },

  // Results scroll
  scroll: {
    flex: 1,
    marginTop: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionCard: {
    backgroundColor: "#161B22",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#30363D",
    padding: 16,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8B949E",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 14,
  },

  // Empty state
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#30363D",
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
  bottomSpacer: { height: 24 },

  // Save button
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2EA043",
    borderRadius: 10,
    height: 44,
    marginBottom: 12,
  },
  saveBtnExists: {
    backgroundColor: "#2D2A1A",
    borderWidth: 1,
    borderColor: "#6E5B00",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },
  saveBtnTextExists: {
    color: "#E3B341",
  },
});
