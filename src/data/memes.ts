export type Meme = {
  id: string;
  title: string;
  imageUrl: string;
};

/**
 * PLACEHOLDER: swap for an API call (e.g. GET /memes/next) once the server exists.
 * Images are random placeholder photos, not real memes.
 */
export const MOCK_MEMES: Meme[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  title: `Placeholder meme #${i + 1}`,
  imageUrl: `https://picsum.photos/seed/funnyfarm${i + 1}/800/800`,
}));
