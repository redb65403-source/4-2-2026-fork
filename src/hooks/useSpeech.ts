import { useState } from 'react';

export const useSpeech = () => {
  const [isReading, setIsReading] = useState(false);

  const speak = (text: string, lang = 'en-US') => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech Synthesis not supported');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => setIsReading(false);
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
  };

  return { speak, stop, isReading };
};