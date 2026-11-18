import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { MEME_COLORS } from '@/data/memes';
import { useMemeFeed } from '@/hooks/use-meme-feed';
import { useTheme } from '@/hooks/use-theme';

export default function JudgeScreen() {
  const theme = useTheme();
  const { meme, next } = useMemeFeed();

  function judge(choice: string) {
    // TODO: POST the judgement (meme.id, choice) to the server. "explode" is the 💥 button.
    void choice;
    next();
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Judge</ThemedText>
        <Image source={meme.image} style={styles.image} contentFit="contain" transition={200} />
        <ThemedText themeColor="textSecondary" style={styles.center}>
          What color is it?
        </ThemedText>

        <View style={styles.options}>
          {MEME_COLORS.map(({ name, hex }) => (
            <Pressable
              key={name}
              onPress={() => judge(name)}
              accessibilityLabel={name}
              style={({ pressed }) => [styles.option, { backgroundColor: hex }, pressed && styles.pressed]}>
              <ThemedText style={[styles.optionText, { color: theme.onPrimary }]}>{name}</ThemedText>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => judge('explode')}
          accessibilityLabel="Explode"
          style={({ pressed }) => [styles.explode, { backgroundColor: theme.primary }, pressed && styles.pressed]}>
          <ThemedText style={styles.explodeText}>💥</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  center: { textAlign: 'center' },
  image: { flex: 1, width: '100%', borderRadius: Spacing.three },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  option: {
    flexGrow: 1,
    flexBasis: '30%',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  optionText: { fontWeight: '700' },
  explode: { alignItems: 'center', paddingVertical: Spacing.two, borderRadius: Spacing.three },
  explodeText: { fontSize: 40, lineHeight: 48 },
  pressed: { opacity: 0.7 },
});
