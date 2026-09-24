/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ExoTubeStudio from '../app/page.tsx';

export default function App() {
  // Task 3: API check using import.meta.env.VITE_GEMINI_API_KEY
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isKeyValid = Boolean(
    apiKey &&
    apiKey.trim().length > 10 &&
    !apiKey.includes('MY_GEMINI_API_KEY')
  );

  return <ExoTubeStudio hasValidKey={isKeyValid} apiKey={apiKey} />;
}
