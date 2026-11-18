import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Hamburger button pinned to the top-right of every app screen, with a small dropdown menu. */
export function HamburgerMenu() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  function goToUpload() {
    setOpen(false);
    router.push('/upload');
  }

  return (
    <>
      {open && (
        // Full-screen backdrop: tapping anywhere outside the menu closes it.
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel="Close menu" />
      )}
      <View style={[styles.anchor, { top: insets.top + Spacing.two, right: Spacing.three }]} pointerEvents="box-none">
        <Pressable
          onPress={() => setOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityLabel="Menu"
          accessibilityState={{ expanded: open }}
          style={({ pressed }) => [styles.button, { backgroundColor: theme.backgroundElement }, pressed && styles.pressed]}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.bar, { backgroundColor: theme.text }]} />
          ))}
        </Pressable>

        {open && (
          <View style={[styles.menu, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
            <Pressable
              onPress={goToUpload}
              accessibilityRole="menuitem"
              style={({ pressed }) => [styles.item, pressed && { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText>Upload a meme</ThemedText>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', alignItems: 'flex-end', gap: Spacing.one, zIndex: 10 },
  button: {
    width: 44,
    height: 44,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  bar: { width: 20, height: 2, borderRadius: 1 },
  menu: { borderWidth: 1, borderRadius: Spacing.three, overflow: 'hidden', minWidth: 180 },
  item: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.three },
  pressed: { opacity: 0.7 },
});
