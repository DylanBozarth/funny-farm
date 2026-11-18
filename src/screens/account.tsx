import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';

export default function AccountScreen() {
  const { user, signOut } = useAuth();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Account</ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Username
          </ThemedText>
          <ThemedText>{user?.username}</ThemedText>
        </ThemedView>

        <Pressable onPress={signOut} style={({ pressed }) => [
            styles.signOut,
            { borderColor: theme.danger },
            pressed && styles.pressed,
          ]}>
          <ThemedText style={[styles.signOutText, { color: theme.danger }]}>Log out</ThemedText>
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
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  card: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
  signOut: { borderWidth: 1, borderRadius: Spacing.three, paddingVertical: 14, alignItems: 'center' },
  signOutText: { fontWeight: '700' },
  pressed: { opacity: 0.5 },
});
