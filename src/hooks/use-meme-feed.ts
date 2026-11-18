import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { API_URL, listUploadedMemes } from '@/api/auth';
import { shuffleMemes, type Meme } from '@/data/memes';

/**
 * Endless shuffled feed of memes (bundled + uploaded). Plays through a shuffled deck,
 * then reshuffles. Uploaded images are pulled in whenever the screen gains focus.
 */
export function useMemeFeed() {
  const [{ deck, index }, setFeed] = useState(() => ({ deck: shuffleMemes(), index: 0 }));
  const [uploadedCount, setUploadedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      listUploadedMemes()
        .then(({ memes }) => {
          if (memes.length === uploadedCount) return;
          const extra: Meme[] = memes.map((m) => ({
            id: m.id,
            title: m.title,
            category: 'Uploaded',
            image: { uri: `${API_URL}${m.url}` },
          }));
          setUploadedCount(memes.length);
          setFeed({ deck: shuffleMemes(undefined, extra), index: 0 });
        })
        .catch(() => {}); // server offline: keep the bundled memes
    }, [uploadedCount]),
  );

  const next = useCallback(() => {
    setFeed(({ deck, index }) =>
      index + 1 < deck.length
        ? { deck, index: index + 1 }
        : { deck: shuffleMemes(deck[index].id, deck.filter((m) => m.category === 'Uploaded')), index: 0 },
    );
  }, []);

  return { meme: deck[index], next };
}
