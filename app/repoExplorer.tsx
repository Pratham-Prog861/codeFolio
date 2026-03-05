import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TrendingRepoCard, { TrendingRepo } from "../components/TrendingRepoCard";
import { Since, useTrendingRepos } from "../hooks/useTrendingRepos";

// ── Filter config ────────────────────────────────────────────
const TIME_FILTERS: { label: string; value: Since }[] = [
  { label: "Today", value: "daily" },
  { label: "This Week", value: "weekly" },
  { label: "This Month", value: "monthly" },
];

const LANGUAGES = [
  "All",
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C++",
  "Swift",
  "Kotlin",
  "PHP",
  "Ruby",
  "C#",
  "Dart",
];

// ── Pill component ───────────────────────────────────────────
function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Screen ───────────────────────────────────────────────────
export default function RepoExplorerScreen() {
  const [since, setSince] = useState<Since>("daily");
  const [language, setLanguage] = useState("");

  const { repos, loading, error, refetch } = useTrendingRepos(since, language);

  const renderItem: ListRenderItem<TrendingRepo> = ({ item, index }) => (
    <TrendingRepoCard repo={item} rank={index + 1} />
  );

  const ListHeader = (
    <>
      {/* Time range filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Time Range</Text>
        <View style={styles.segmentRow}>
          {TIME_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.segment,
                since === f.value && styles.segmentActive,
              ]}
              onPress={() => setSince(f.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  since === f.value && styles.segmentTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Language filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Language</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {LANGUAGES.map((lang) => {
            const val = lang === "All" ? "" : lang;
            return (
              <Pill
                key={lang}
                label={lang}
                active={language === val}
                onPress={() => setLanguage(val)}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* Section label */}
      <View style={styles.resultHeaderRow}>
        <Text style={styles.resultCount}>
          {loading ? "Loading…" : `${repos.length} repositories`}
        </Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={refetch}
          disabled={loading}
          activeOpacity={0.75}
        >
          <Ionicons
            name="refresh-outline"
            size={15}
            color={loading ? "#484F58" : "#58A6FF"}
          />
          <Text style={[styles.refreshText, loading && styles.refreshDisabled]}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Ionicons name="flame" size={20} color="#E6EDF3" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Repo Explorer</Text>
          <Text style={styles.headerSub}>Trending on GitHub</Text>
        </View>
      </View>

      {/* ── Error ── */}
      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#F85149" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ── Loading overlay (first load) ── */}
      {loading && repos.length === 0 ? (
        <View style={styles.loadingOverlay}>
          {ListHeader}
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color="#2EA043" />
            <Text style={styles.loadingText}>Fetching trending repos…</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={repos}
          keyExtractor={(item) => `${item.author}/${item.name}`}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={40} color="#30363D" />
                <Text style={styles.emptyText}>No repositories found.</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────
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
    color: "#F78166",
    fontWeight: "600",
    letterSpacing: 0.4,
    lineHeight: 16,
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
    margin: 16,
    marginBottom: 0,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#F85149",
  },
  retryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#21262D",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#30363D",
  },
  retryText: {
    fontSize: 12,
    color: "#E6EDF3",
    fontWeight: "600",
  },

  // Filters
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8B949E",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  segmentRow: {
    flexDirection: "row",
    backgroundColor: "#161B22",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#30363D",
    overflow: "hidden",
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: "#2EA043",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8B949E",
  },
  segmentTextActive: {
    color: "#fff",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 7,
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#161B22",
    borderWidth: 1,
    borderColor: "#30363D",
  },
  pillActive: {
    backgroundColor: "rgba(88,166,255,0.15)",
    borderColor: "#58A6FF",
  },
  pillText: {
    fontSize: 12,
    color: "#8B949E",
    fontWeight: "500",
  },
  pillTextActive: {
    color: "#58A6FF",
    fontWeight: "700",
  },

  // Result header
  resultHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  resultCount: {
    fontSize: 13,
    color: "#8B949E",
    fontWeight: "500",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  refreshText: {
    fontSize: 13,
    color: "#58A6FF",
    fontWeight: "600",
  },
  refreshDisabled: {
    color: "#484F58",
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // Loading
  loadingOverlay: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingBottom: 80,
  },
  loadingText: {
    color: "#8B949E",
    fontSize: 14,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: "#8B949E",
    fontSize: 14,
  },
});
