import type { ImageSource } from "expo-image";

export type Meme = {
  id: string;
  title: string;
  image: ImageSource;
  /** For now the category is simply the image's color. */
  category: string;
};

/**
 * PLACEHOLDER: swap for an API call (e.g. GET /memes/next) once the server exists.
 * These are solid-color test images from assets/test-images.
 */
export const MOCK_MEMES: Meme[] = [
  {
    id: "1",
    title: "Red meme",
    category: "Red",
    image: require("../../assets/test-images/red.jpg"),
  },
  {
    id: "2",
    title: "Blue meme",
    category: "Blue",
    image: require("../../assets/test-images/blue.jpg"),
  },
  {
    id: "3",
    title: "Green meme",
    category: "Green",
    image: require("../../assets/test-images/green.webp"),
  },
  {
    id: "4",
    title: "Orange meme",
    category: "Orange",
    image: require("../../assets/test-images/orange.jpg"),
  },
  {
    id: "5",
    title: "Teal meme",
    category: "Teal",
    image: require("../../assets/test-images/teal.jpg"),
  },
];

/**
 * Returns the memes in random order (Fisher-Yates). If `notFirst` is given, the
 * new order won't start with that meme, so the same one never shows twice in a row
 * when a new round begins.
 */
export function shuffleMemes(notFirst?: string): Meme[] {
  const deck = [...MOCK_MEMES];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  if (deck.length > 1 && deck[0].id === notFirst) {
    [deck[0], deck[1]] = [deck[1], deck[0]];
  }
  return deck;
}
