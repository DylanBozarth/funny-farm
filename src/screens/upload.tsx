import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { uploadMeme } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export default function UploadScreen() {
  const theme = useTheme();
  const { token } = useAuth();
  const [picked, setPicked] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);

  async function pick() {
    setStatus(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!ALLOWED.includes(asset.mimeType ?? 'image/jpeg')) {
      setPicked(null);
      setStatus({ text: 'Please choose a JPEG, PNG or WebP image.', error: true });
      return;
    }
    setPicked(asset);
  }

  async function upload() {
    if (!picked || !token) return;
    setBusy(true);
    setStatus(null);
    try {
      await uploadMeme(token, picked.uri, picked.mimeType ?? 'image/jpeg');
      setPicked(null);
      setStatus({ text: 'Uploaded! It will show up in the meme feed.' });
    } catch (e) {
      setStatus({ text: e instanceof Error ? e.message : 'Upload failed', error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Upload a meme</ThemedText>

        {picked ? (
          <Image source={{ uri: picked.uri }} style={styles.preview} contentFit="contain" />
        ) : (
          <ThemedView type="backgroundElement" style={[styles.preview, styles.empty]}>
            <ThemedText themeColor="textSecondary">No image selected</ThemedText>
          </ThemedView>
        )}

        {status && (
          <ThemedText style={[styles.center, status.error && { color: theme.danger }]}>
            {status.text}
          </ThemedText>
        )}

        <Pressable
          onPress={pick}
          disabled={busy}
          style={({ pressed }) => [styles.button, { borderColor: theme.primary }, pressed && styles.pressed]}>
          <ThemedText style={styles.buttonText}>{picked ? 'Choose a different image' : 'Choose image'}</ThemedText>
        </Pressable>

        <Pressable
          onPress={upload}
          disabled={!picked || busy}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary, borderColor: theme.primary },
            (!picked || busy) && styles.disabled,
            pressed && styles.pressed,
          ]}>
          <ThemedText style={styles.buttonText}>{busy ? 'Uploading…' : 'Upload'}</ThemedText>
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
  preview: { flex: 1, width: '100%', borderRadius: Spacing.three },
  empty: { alignItems: 'center', justifyContent: 'center' },
  button: { borderWidth: 1, borderRadius: Spacing.three, paddingVertical: 14, alignItems: 'center' },
  buttonText: { fontWeight: '700' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
});
