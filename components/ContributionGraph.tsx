import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0–4
}

interface ContributionData {
  total: Record<string, number>;
  contributions: ContributionDay[];
}

interface Props {
  username: string;
}

// GitHub-style contribution level colors
const LEVEL_COLORS = ["#161B22", "#0e4429", "#006d32", "#26a641", "#39d353"];

const CELL = 11;
const GAP = 2;

export default function ContributionGraph({ username }: Props) {
  const [data, setData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setData(null);

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then((r) => {
        if (!r.ok) throw new Error("not ok");
        return r.json() as Promise<ContributionData>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#2EA043" />
      </View>
    );
  }

  if (failed || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.failText}>Contribution graph unavailable.</Text>
      </View>
    );
  }

  // Group contributions into 7-day columns (weeks), earliest → latest
  const contributions = data.contributions;
  const weeks: (ContributionDay | null)[][] = [];

  if (contributions.length > 0) {
    // date-only strings parse as UTC; use getUTCDay for consistency
    const firstDate = new Date(contributions[0].date);
    const startPad = firstDate.getUTCDay(); // 0 = Sunday
    const padded: (ContributionDay | null)[] = [
      ...Array<null>(startPad).fill(null),
      ...contributions,
    ];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }
  }

  const totalLastYear =
    data.total["lastYear"] ??
    Object.values(data.total).reduce((a, b) => a + b, 0);

  return (
    <View>
      <Text style={styles.totalText}>
        {totalLastYear.toLocaleString()} contributions in the last year
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.col}>
              {week.map((day, di) => (
                <View
                  key={di}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: day
                        ? LEVEL_COLORS[Math.min(day.level, 4)]
                        : "transparent",
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Less</Text>
        {LEVEL_COLORS.map((c, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: c }]} />
        ))}
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    paddingVertical: 20,
  },
  failText: {
    color: "#8B949E",
    fontSize: 13,
  },
  totalText: {
    color: "#8B949E",
    fontSize: 12,
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 2,
  },
  grid: {
    flexDirection: "row",
    gap: GAP,
  },
  col: {
    flexDirection: "column",
    gap: GAP,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.04)",
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    justifyContent: "flex-end",
  },
  legendLabel: {
    color: "#6E7681",
    fontSize: 11,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.04)",
  },
});
