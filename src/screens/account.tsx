import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_URL, getMe, listMyMemes, type UploadedMeme } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';

export default function AccountScreen() {
  const { user, token, signOut } = useAuth();
  const theme = useTheme();
  const [uploads, setUploads] = useState<UploadedMeme[] | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refresh whenever the tab is shown so a just-uploaded image appears.
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      getMe(token)
        .then(({ user }) => setPoints(user.points))
        .catch(() => {}); // keep showing the last known / login-time value
      listMyMemes(token)
        .then(({ memes }) => {
          setUploads(memes);
          setError(null);
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'Could not load your uploads'));
    }, [token]),
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Account</ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Username
            </ThemedText>
            <ThemedText>{user?.username}</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Total points
            </ThemedText>
            <ThemedText type="subtitle">{points ?? user?.points ?? 0}</ThemedText>
          </ThemedView>

          <ThemedText type="smallBold" themeColor="textSecondary">
            My uploads{uploads ? ` (${uploads.length})` : ''}
          </ThemedText>
          {error ? (
            <ThemedText style={{ color: theme.danger }}>{error}</ThemedText>
          ) : uploads && uploads.length === 0 ? (
            <ThemedText themeColor="textSecondary">You haven't uploaded any memes yet.</ThemedText>
          ) : (
            <View style={styles.grid}>
              {uploads?.map((m) => (
                <Image
                  key={m.id}
                  source={{ uri: `${API_URL}${m.url}` }}
                  style={[styles.thumb, { backgroundColor: theme.backgroundElement }]}
                  contentFit="cover"
                  transition={200}
                  accessibilityLabel={m.title}
                />
              ))}
            </View>
          )}

          <Pressable
            onPress={signOut}
            style={({ pressed }) => [styles.signOut, { borderColor: theme.danger }, pressed && styles.pressed]}>
            <ThemedText style={[styles.signOutText, { color: theme.danger }]}>Log out</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: { flex: 1, maxWidth: MaxContentWidth },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  card: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  thumb: { width: '31%', aspectRatio: 1, borderRadius: Spacing.two },
  signOut: { borderWidth: 1, borderRadius: Spacing.three, paddingVertical: 14, alignItems: 'center' },
  signOutText: { fontWeight: '700' },
  pressed: { opacity: 0.5 },
});
