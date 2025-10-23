'use client';

import { useEffect } from 'react';

export function ConsoleArt() {
  useEffect(() => {
    const hasShown = sessionStorage.getItem('consoleArtShown');

    if (!hasShown) {
      console.log(`
██████ ██████ ██████ ██████ ██████ ██████  ██████   █████  ██     ██   ██
██  ██ ██       ██     ██   ██     ██   ██ ██   ██ ██   ██ ██      ██ ██
██████ █████    ██     ██   █████  ██████  ██████  ██   ██ ██       ███
██████ ██       ██     ██   ██     ██ ██   ██      ██   ██ ██       ██
██  ██ ██       ██     ██   ██     ██  ██  ██      ██   ██ ██       ██
██████ ██████   ██     ██   ██████ ██   ██ ██       █████  ██████   ██

🚀 Welcome to betterPoly - Real-Time Market Intelligence!
      `);
      sessionStorage.setItem('consoleArtShown', 'true');
    }
  }, []);

  return null;
}
