/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import "@/styling/global.css";

import { Platform } from "react-native";

/** Brand palette (from src/styling/global.css). */
export const Palette = {
  vibrantCoral: "#FF5E5B",
  dustGrey: "#D8D8D8",
  ivory: "#FFFFEA",
  strongCyan: "#00CECB",
  bananaCream: "#FFED66",
} as const;

// Near-black used for text on light surfaces and for text on bright brand colors (better contrast than white).
const ink = "#1A1A1A";

export const Colors = {
  light: {
    text: ink,
    background: Palette.ivory,
    backgroundElement: "#F1F1D8",
    backgroundSelected: Palette.dustGrey,
    textSecondary: "#5E5E55",
    primary: Palette.vibrantCoral,
    onPrimary: ink,
    accent: Palette.strongCyan,
    highlight: Palette.bananaCream,
    danger: "#D6403D",
  },
  dark: {
    text: Palette.ivory,
    background: ink,
    backgroundElement: "#262624",
    backgroundSelected: "#34342F",
    textSecondary: Palette.dustGrey,
    primary: Palette.vibrantCoral,
    onPrimary: ink,
    accent: Palette.strongCyan,
    highlight: Palette.bananaCream,
    danger: "#FF7A77",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
