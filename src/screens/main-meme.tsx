import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { MOCK_MEMES } from "@/data/memes";
import { useTheme } from "@/hooks/use-theme";

type Rating = -1 | 0 | 1;

const RATINGS: { value: Rating; emoji: string; label: string }[] = [
  { value: -1, emoji: "👎", label: "Thumbs down" },
  { value: 0, emoji: "🤔", label: "Not sure" },
  { value: 1, emoji: "👍", label: "Thumbs up" },
];

export default function MemesScreen() {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});

  const meme = MOCK_MEMES[index];
  const ratedCount = Object.keys(ratings).length;

  function rate(value: Rating) {
    // TODO: POST the rating to the server.
    setRatings((r) => ({ ...r, [meme.id]: value }));
    setIndex((i) => i + 1);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {meme ? (
          <>
            <ThemedText type="subtitle">{meme.title}</ThemedText>
            <Image
              source={meme.imageUrl}
              style={styles.image}
              contentFit="contain"
              transition={200}
            />
            <ThemedText themeColor="textSecondary" style={styles.center}>
              How funny is it?
            </ThemedText>
            <ThemedView style={styles.ratings}>
              {RATINGS.map(({ value, emoji, label }) => (
                <Pressable
                  key={value}
                  onPress={() => rate(value)}
                  accessibilityLabel={label}
                  style={({ pressed }) => [
                    styles.ratingButton,
                    { backgroundColor: theme.primary },
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText style={styles.ratingText}>{emoji}</ThemedText>
                </Pressable>
              ))}
            </ThemedView>
            <Pressable onPress={() => setIndex((i) => i + 1)}>
              <ThemedText type="link" style={styles.center}>
                Skip
              </ThemedText>
            </Pressable>
          </>
        ) : (
          <ThemedView style={styles.done}>
            <ThemedText type="subtitle" style={styles.center}>
              You're all caught up
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.center}>
              You rated {ratedCount} meme{ratedCount === 1 ? "" : "s"}.
            </ThemedText>
            <Pressable onPress={() => setIndex(0)}>
              <ThemedText type="linkPrimary" style={styles.center}>
                Start over
              </ThemedText>
            </Pressable>
          </ThemedView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", justifyContent: "center" },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  center: { textAlign: "center" },
  image: { flex: 1, width: "100%", borderRadius: Spacing.three },
  ratings: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  ratingButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  ratingText: { fontSize: 40, lineHeight: 48 },
  pressed: { opacity: 0.7 },
  done: { flex: 1, justifyContent: "center", gap: Spacing.three },
});
