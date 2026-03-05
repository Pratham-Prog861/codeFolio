import Ionicons from "@expo/vector-icons/Ionicons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import ContributionGraph from "../components/ContributionGraph";

// ── Types ────────────────────────────────────────────────────
interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
  created_at: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  forks_count: number;
  html_url: string;
}

// ── Helpers ──────────────────────────────────────────────────
function computeTopLanguages(
  repos: GitHubRepo[],
): { lang: string; count: number }[] {
  const counts: Record<string, number> = {};
  repos.forEach((r) => {
    if (r.language) counts[r.language] = (counts[r.language] ?? 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => ({ lang, count }));
}

function computeDevTitle(bio: string | null, topLang: string): string {
  if (bio && bio.length > 0 && bio.length <= 52) return bio;
  if (topLang && topLang !== "Unknown") return `The ${topLang} Architect`;
  return "The Code Artisan";
}

// ── Decorative barcode ───────────────────────────────────────
const BAR_WIDTHS = [
  2, 4, 1, 3, 5, 1, 2, 1, 4, 2, 1, 3, 1, 5, 2, 1, 3, 1, 4, 1, 2, 5, 1, 3, 2, 1,
  4, 1, 2, 3, 1, 4, 2, 1, 3,
];

function Barcode() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        height: 44,
        gap: 1.5,
      }}
    >
      {BAR_WIDTHS.map((h, i) => (
        <View
          key={i}
          style={{
            width: i % 4 === 0 ? 3 : 1.5,
            height: (h / 5) * 44,
            backgroundColor: "#9E9E9E",
            borderRadius: 0.5,
          }}
        />
      ))}
    </View>
  );
}

// ── Language bar chart ───────────────────────────────────────
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

function LanguageBar({ langs }: { langs: { lang: string; count: number }[] }) {
  const max = langs[0]?.count ?? 1;
  return (
    <View style={langBarStyles.container}>
      {langs.map(({ lang, count }) => (
        <View key={lang} style={langBarStyles.row}>
          <View style={langBarStyles.labelRow}>
            <View
              style={[
                langBarStyles.dot,
                { backgroundColor: LANG_COLORS[lang] ?? "#8B949E" },
              ]}
            />
            <Text style={langBarStyles.langName}>{lang}</Text>
            <Text style={langBarStyles.langCount}>
              {count} repo{count !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={langBarStyles.track}>
            <View
              style={[
                langBarStyles.fill,
                {
                  width: `${(count / max) * 100}%` as `${number}%`,
                  backgroundColor: LANG_COLORS[lang] ?? "#8B949E",
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const langBarStyles = StyleSheet.create({
  container: { gap: 8 },
  row: { gap: 4 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  langName: { flex: 1, fontSize: 13, color: "#E6EDF3", fontWeight: "500" },
  langCount: { fontSize: 12, color: "#8B949E" },
  track: {
    height: 5,
    backgroundColor: "#21262D",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 3 },
});

// ── PDF HTML generator ───────────────────────────────────────
function buildPdfHtml(
  user: GitHubUser,
  repos: GitHubRepo[],
  langs: { lang: string; count: number }[],
  contributions: number,
  topLang: string,
): string {
  const joinYear = new Date(user.created_at).getFullYear();
  const devTitle = computeDevTitle(user.bio, topLang);
  const contribVal =
    contributions > 0
      ? contributions.toLocaleString()
      : String(user.public_repos * 10);
  const repoRows = repos
    .map(
      (r, i) => `
    <tr>
      <td style="padding:8px 4px;color:#58A6FF;font-weight:700;font-size:13px;">${i + 1}. ${r.name}</td>
      <td style="padding:8px 4px;color:#8B949E;font-size:12px;max-width:200px;">${r.description ?? "—"}</td>
      <td style="padding:8px 4px;color:#D29922;text-align:right;font-size:12px;">★ ${r.stargazers_count}</td>
      <td style="padding:8px 4px;color:#8B949E;text-align:right;font-size:12px;">${r.language ?? "—"}</td>
    </tr>`,
    )
    .join("");
  const langRows = langs
    .map(
      (l) =>
        `<span style="background:${LANG_COLORS[l.lang] ?? "#444"};color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;margin:3px;">${l.lang}</span>`,
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#0D1117;font-family:Georgia,serif;padding:32px;}
.card{background:#1A1A1A;border-radius:16px;padding:36px;max-width:680px;margin:0 auto;border:1px solid #333;}
.film-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;}
.avatar{width:80px;height:80px;border-radius:50%;border:2px solid #333;}
.brand-title{font-size:40px;font-style:italic;color:#E6EDF3;text-align:right;}
.brand-year{font-size:22px;color:#666;text-align:right;margin-top:4px;}
hr{border:none;border-top:1px solid #2A2A2A;margin:22px 0;}
.label{font-size:10px;letter-spacing:2px;color:#666;text-transform:uppercase;margin-bottom:6px;}
.username{font-size:40px;font-weight:900;color:#E6EDF3;margin-bottom:4px;}
.subtitle{font-size:18px;font-style:italic;color:#58A6FF;margin-bottom:24px;}
.stats{display:flex;gap:48px;margin-bottom:24px;}
.stat-val{font-size:28px;font-style:italic;color:#E6EDF3;}
.opus-name{font-size:20px;font-weight:700;color:#E6EDF3;}
.opus-desc{font-size:12px;color:#8B949E;margin-top:2px;}
table{width:100%;border-collapse:collapse;margin-top:6px;}
th{text-align:left;font-size:10px;letter-spacing:1.5px;color:#666;padding:0 4px 8px;text-transform:uppercase;}
.footer{display:flex;justify-content:space-between;align-items:center;margin-top:24px;}
.directed{font-size:9px;letter-spacing:2px;color:#555;text-transform:uppercase;}
</style></head><body>
<div class="card">
  <div class="film-top">
    <img class="avatar" src="${user.avatar_url}"/>
    <div><div class="brand-title">CodeFolio</div><div class="brand-year">${joinYear}</div></div>
  </div>
  <hr/>
  <div class="label">Starring</div>
  ${user.name ? `<div style="font-size:18px;font-weight:700;color:#8B949E;margin-bottom:4px;">${user.name}</div>` : ""}
  <div class="username">@${user.login}</div>
  <div class="subtitle">${devTitle}</div>
  <div class="stats">
    <div><div class="label">Commits</div><div class="stat-val">${contribVal}</div></div>
    <div><div class="label">Top Lang</div><div class="stat-val">${topLang || "N/A"}</div></div>
    <div><div class="label">Repos</div><div class="stat-val">${user.public_repos}</div></div>
  </div>
  ${repos[0] ? `<div class="label">Magnum Opus</div><div class="opus-name">${repos[0].name}</div>${repos[0].description ? `<div class="opus-desc">${repos[0].description}</div>` : ""}` : ""}
  <hr/>
  <div class="label">Top Repositories</div>
  <table>
    <thead><tr><th>Repository</th><th>Description</th><th>Stars</th><th>Language</th></tr></thead>
    <tbody>${repoRows}</tbody>
  </table>
  <hr/>
  <div class="label">Top Languages</div>
  <div style="margin-top:6px;">${langRows}</div>
  <div class="footer">
    <div style="font-size:9px;color:#444;">${user.html_url}</div>
    <div class="directed">Directed by You</div>
  </div>
</div></body></html>`;
}

// ── Main Screen ──────────────────────────────────────────────
export default function GitHubResumeScreen() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [allLangs, setAllLangs] = useState<{ lang: string; count: number }[]>(
    [],
  );
  const [topLang, setTopLang] = useState("");
  const [contributions, setContributions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportLabel, setExportLabel] = useState("");

  const resumeRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);

  const generate = async () => {
    const username = query.trim();
    if (!username) return;
    setLoading(true);
    setError(null);
    setUser(null);
    setRepos([]);
    setContributions(0);

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}`),
        fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=stars`,
        ),
      ]);

      if (userRes.status === 404) {
        setError(`No GitHub user found for "${username}".`);
        return;
      }
      if (userRes.status === 403) {
        setError("GitHub API rate limit reached. Wait a moment and retry.");
        return;
      }
      if (!userRes.ok) {
        setError("Failed to fetch GitHub data. Please try again.");
        return;
      }

      const userData: GitHubUser = await userRes.json();
      const reposData: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];

      const sorted = [...reposData].sort(
        (a, b) => b.stargazers_count - a.stargazers_count,
      );
      const langs = computeTopLanguages(reposData);
      const lang = langs[0]?.lang ?? "";

      setUser(userData);
      setRepos(sorted.slice(0, 5));
      setAllLangs(langs);
      setTopLang(lang);

      // Fetch contributions in the background (non-blocking)
      fetch(
        `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
      )
        .then((r) => r.json())
        .then((data: { total: Record<string, number> }) => {
          const total = Object.values(data.total).reduce((a, b) => a + b, 0);
          setContributions(total);
        })
        .catch(() => {});

      setTimeout(
        () => scrollRef.current?.scrollTo({ y: 500, animated: true }),
        300,
      );
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const exportAsImage = async () => {
    if (!resumeRef.current) return;
    try {
      setExporting(true);
      setExportLabel("Capturing…");
      const uri = await captureRef(resumeRef, { format: "jpg", quality: 0.95 });
      await Sharing.shareAsync(uri, {
        mimeType: "image/jpeg",
        dialogTitle: "Save GitHub Resume Image",
      });
    } catch {
      Alert.alert(
        "Export Failed",
        "Could not capture the resume. Please try again.",
      );
    } finally {
      setExporting(false);
      setExportLabel("");
    }
  };

  const exportAsPDF = async () => {
    if (!user) return;
    try {
      setExporting(true);
      setExportLabel("Generating PDF…");
      const html = buildPdfHtml(user, repos, allLangs, contributions, topLang);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Save Resume PDF",
      });
    } catch {
      Alert.alert("Export Failed", "Could not generate PDF. Please try again.");
    } finally {
      setExporting(false);
      setExportLabel("");
    }
  };

  const shareProfile = () => {
    if (!user) return;
    Share.share({
      message: `Check out ${user.name ?? user.login}'s GitHub profile: ${user.html_url}`,
    });
  };

  const openProfile = () => {
    if (user) WebBrowser.openBrowserAsync(user.html_url);
  };

  const magnumOpus = repos[0] ?? null;
  const joinYear = user ? new Date(user.created_at).getFullYear() : null;
  const devTitle = user ? computeDevTitle(user.bio, topLang) : "";

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#E6EDF3"
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>GitHub Resume</Text>
              <Text style={styles.headerSub}>codeFolio</Text>
            </View>
          </View>

          {/* ── Search ── */}
          <View style={styles.searchBarRow}>
            <Ionicons
              name="at-outline"
              size={16}
              color="#484F58"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter GitHub username…"
              placeholderTextColor="#484F58"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={generate}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
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
            style={[styles.generateBtn, loading && { opacity: 0.7 }]}
            onPress={generate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.generateBtnText}>Generating…</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles-outline" size={15} color="#fff" />
                <Text style={styles.generateBtnText}>Generate Resume</Text>
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

          {/* ── Resume (film card) ── */}
          {user ? (
            <>
              <View ref={resumeRef} style={styles.filmCard} collapsable={false}>
                {/* TOP ROW: avatar + brand */}
                <View style={styles.filmTop}>
                  <Image
                    source={{ uri: user.avatar_url }}
                    style={styles.filmAvatar}
                  />
                  <View style={styles.brandBlock}>
                    <Text style={styles.brandTitle}>codeFolio</Text>
                    <Text style={styles.brandYear}>{joinYear}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* STARRING */}
                <Text style={styles.sectionLabel}>Starring</Text>
                {user.name ? (
                  <Text
                    style={styles.realName}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {user.name}
                  </Text>
                ) : null}
                <Text
                  style={styles.username}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  @{user.login}
                </Text>
                <Text style={styles.devTitle} numberOfLines={2}>
                  {devTitle}
                </Text>

                {/* STATS ROW */}
                <View style={styles.statsRow}>
                  <View style={styles.statCol}>
                    <Text style={styles.sectionLabel}>Commits</Text>
                    <Text
                      style={styles.statVal}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                    >
                      {contributions > 0
                        ? contributions.toLocaleString()
                        : String(user.public_repos * 10)}
                    </Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.sectionLabel}>Top Lang</Text>
                    <Text
                      style={styles.statVal}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                    >
                      {topLang || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.sectionLabel}>Repos</Text>
                    <Text
                      style={styles.statVal}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                    >
                      {user.public_repos}
                    </Text>
                  </View>
                </View>

                {/* MAGNUM OPUS */}
                {magnumOpus ? (
                  <View style={styles.magnumBlock}>
                    <Text style={styles.sectionLabel}>Magnum Opus</Text>
                    <Text style={styles.magnumName} numberOfLines={1}>
                      {magnumOpus.name}
                    </Text>
                    {magnumOpus.description ? (
                      <Text style={styles.magnumDesc} numberOfLines={1}>
                        {magnumOpus.description}
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                <View style={styles.divider} />

                {/* TOP REPOS */}
                <Text style={styles.sectionLabel}>Top Repositories</Text>
                {repos.map((repo, i) => (
                  <View key={repo.id} style={styles.repoRow}>
                    <Text style={styles.repoRank}>{i + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.repoName} numberOfLines={1}>
                        {repo.name}
                      </Text>
                      {repo.description ? (
                        <Text style={styles.repoDesc} numberOfLines={1}>
                          {repo.description}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.repoMeta}>
                      {repo.language ? (
                        <Text style={styles.repoLang}>{repo.language}</Text>
                      ) : null}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Ionicons name="star" size={10} color="#D29922" />
                        <Text style={styles.repoStar}>
                          {repo.stargazers_count.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}

                <View style={styles.divider} />

                {/* TOP LANGUAGES */}
                <Text style={styles.sectionLabel}>Top Languages</Text>
                <View style={{ marginTop: 4 }}>
                  <LanguageBar langs={allLangs} />
                </View>

                <View style={styles.divider} />

                {/* CONTRIBUTION GRAPH */}
                <Text style={styles.sectionLabel}>Contribution Graph</Text>
                <View style={{ marginTop: 4 }}>
                  <ContributionGraph username={user.login} />
                </View>

                <View style={styles.divider} />

                {/* FOOTER: barcode + directed by */}
                <View style={styles.filmFooter}>
                  <Barcode />
                  <Text style={styles.directedBy}>Directed by You</Text>
                </View>
              </View>

              {/* ── Action Buttons ── */}
              {exporting ? (
                <View style={styles.exportingRow}>
                  <ActivityIndicator size="small" color="#2EA043" />
                  <Text style={styles.exportingText}>{exportLabel}</Text>
                </View>
              ) : null}

              <View style={styles.actionsGrid}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnGreen]}
                  onPress={exportAsImage}
                  disabled={exporting}
                  activeOpacity={0.82}
                >
                  <Ionicons name="image-outline" size={17} color="#fff" />
                  <Text style={styles.actionBtnGreenText}>Save Image</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnBlue]}
                  onPress={exportAsPDF}
                  disabled={exporting}
                  activeOpacity={0.82}
                >
                  <Ionicons name="document-outline" size={17} color="#58A6FF" />
                  <Text style={styles.actionBtnBlueText}>Export PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnBlue]}
                  onPress={shareProfile}
                  activeOpacity={0.82}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={17}
                    color="#58A6FF"
                  />
                  <Text style={styles.actionBtnBlueText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnBlue]}
                  onPress={openProfile}
                  activeOpacity={0.82}
                >
                  <Ionicons name="open-outline" size={17} color="#58A6FF" />
                  <Text style={styles.actionBtnBlueText}>Open Profile</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          {/* ── Empty state ── */}
          {!user && !loading && !error ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyRing}>
                <Ionicons name="newspaper-outline" size={48} color="#30363D" />
              </View>
              <Text style={styles.emptyTitle}>Generate your Resume</Text>
              <Text style={styles.emptyBody}>
                Enter any GitHub username to create a codeFolio developer resume
                card you can share or export.
              </Text>
            </View>
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D1117" },
  scroll: { paddingBottom: 24 },

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
    fontWeight: "700",
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
  input: { flex: 1, fontSize: 15, color: "#E6EDF3", height: "100%" },
  generateBtn: {
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
  generateBtnText: {
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
  errorText: { flex: 1, fontSize: 13, color: "#F85149" },

  // Film card
  filmCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginHorizontal: 16,
    marginTop: 18,
    padding: 22,
  },
  filmTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  filmAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: "#333",
  },
  brandBlock: { alignItems: "flex-end" },
  brandTitle: {
    fontSize: 36,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#E6EDF3",
    letterSpacing: -1,
  },
  brandYear: {
    fontSize: 20,
    color: "#555",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginTop: 2,
    textAlign: "right",
  },
  divider: { height: 1, backgroundColor: "#2A2A2A", marginVertical: 18 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#666",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  realName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#8B949E",
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  username: {
    fontSize: 34,
    fontWeight: "900",
    color: "#E6EDF3",
    letterSpacing: -0.5,
    marginBottom: 4,
    flexShrink: 1,
  },
  devTitle: {
    fontSize: 17,
    fontStyle: "italic",
    color: "#58A6FF",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 22,
    lineHeight: 24,
  },
  statsRow: { flexDirection: "row", gap: 4, marginBottom: 20 },
  statCol: { flex: 1, minWidth: 0, overflow: "hidden" },
  statVal: {
    fontSize: 26,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#E6EDF3",
    flexShrink: 1,
  },
  magnumBlock: { marginBottom: 2 },
  magnumName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E6EDF3",
    marginBottom: 2,
  },
  magnumDesc: { fontSize: 12, color: "#8B949E" },
  repoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    gap: 10,
  },
  repoRank: {
    fontSize: 12,
    color: "#555",
    fontWeight: "700",
    width: 18,
    paddingTop: 1,
  },
  repoName: { fontSize: 13, fontWeight: "700", color: "#C9D1D9" },
  repoDesc: { fontSize: 11, color: "#8B949E", marginTop: 2 },
  repoMeta: { alignItems: "flex-end", gap: 3 },
  repoLang: { fontSize: 10, color: "#8B949E" },
  repoStar: { fontSize: 11, color: "#D29922" },
  filmFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  directedBy: {
    fontSize: 9,
    fontWeight: "700",
    color: "#555",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // Actions
  exportingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    marginTop: 14,
  },
  exportingText: { fontSize: 13, color: "#8B949E" },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
    minWidth: "47%",
    flex: 1,
  },
  actionBtnGreen: { backgroundColor: "#2EA043" },
  actionBtnGreenText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  actionBtnBlue: {
    backgroundColor: "rgba(88,166,255,0.1)",
    borderWidth: 1,
    borderColor: "#58A6FF33",
  },
  actionBtnBlueText: { fontSize: 13, fontWeight: "600", color: "#58A6FF" },

  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyRing: {
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
});
