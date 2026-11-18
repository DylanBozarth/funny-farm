import { useRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/hooks/use-theme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const theme = useTheme();
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    if (!username.trim() || !password)
      return setError("Enter your username and password.");

    setLoading(true);
    try {
      await signIn(username.trim(), password);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Lifts the form above the keyboard (iOS); Android resizes the window itself. */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          {/* Scrolls on short screens/landscape so no field or button is hidden behind the keyboard,
              and lets taps on the button work while the keyboard is open. */}
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            automaticallyAdjustKeyboardInsets
          >
            <ThemedView style={styles.form}>
              <ThemedText type="title" style={styles.center}>
                Funny Farm
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.center}>
                Rate memes. Harvest laughs.
              </ThemedText>

              <TextInput
                style={inputStyle}
                placeholder="Username"
                placeholderTextColor={theme.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect={false}
                textContentType="username"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <TextInput
                ref={passwordRef}
                style={inputStyle}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={submit}
              />

              {error && <ThemedText style={[styles.error, { color: theme.danger }]}>
                  {error}
                </ThemedText>}

              <Pressable
                onPress={submit}
                disabled={loading}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: theme.primary },
                  (pressed || loading) && styles.pressed,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={theme.onPrimary} />
                ) : (
                  <ThemedText style={[styles.buttonText, { color: theme.onPrimary }]}>
                    Log in
                  </ThemedText>
                )}
              </Pressable>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", justifyContent: "center" },
  safeArea: { flex: 1, maxWidth: MaxContentWidth, width: "100%" },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: Spacing.four },
  form: { gap: Spacing.three },
  center: { textAlign: "center" },
  input: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    
    borderRadius: Spacing.three,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { fontWeight: "700" },
  pressed: { opacity: 0.7 },
  error: { textAlign: "center" },
});
