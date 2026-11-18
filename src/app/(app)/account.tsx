import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';

export default function AccountScreen() {
  const { user, updateDisplayName, signOut } = useAuth();
  const theme = useTheme();
  const [name, setName] = useState(user?.displayName ?? '');
  const [saved, setSaved] = useState(false);

  const dirty = name.trim() !== user?.displayName && name.trim().length > 0;

  function save() {
    updateDisplayName(name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Account</ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Email
          </ThemedText>
          <ThemedText>{user?.email}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.field}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Display name
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Pressable
            onPress={save}
            disabled={!dirty}
            style={({ pressed }) => [styles.button, (!dirty || pressed) && styles.pressed]}>
            <ThemedText style={styles.buttonText}>{saved ? 'Saved ✓' : 'Save changes'}</ThemedText>
          </Pressable>
        </ThemedView>

        <Pressable onPress={signOut} style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}>
          <ThemedText style={styles.signOutText}>Log out</ThemedText>
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
  field: { gap: Spacing.two },
  input: { borderRadius: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 14, fontSize: 16 },
  button: { backgroundColor: '#3c87f7', borderRadius: Spacing.three, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  signOut: { borderWidth: 1, borderColor: '#E5484D', borderRadius: Spacing.three, paddingVertical: 14, alignItems: 'center' },
  signOutText: { color: '#E5484D', fontWeight: '700' },
  pressed: { opacity: 0.5 },
});
