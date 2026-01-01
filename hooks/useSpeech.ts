
import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;
  // Keep track of the current utterance to cancel it if needed
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (!synth) return;

    // Cancel any current speech
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance.current = utterance;
    
    // Find a friendly voice if possible
    const voices = synth.getVoices();
    // Try to find a 'Google US English' or similar female/soft voice, fallback to default
    const friendlyVoice = voices.find(v => v.name.includes('Google US English')) || 
                          voices.find(v => v.name.includes('Samantha')) ||
                          voices.find(v => v.lang.startsWith('en'));
    
    if (friendlyVoice) {
      utterance.voice = friendlyVoice;
    }

    // Tweak pitch and rate for a friendlier "guide" tone
    utterance.pitch = 1.2; 
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  }, [synth]);

  const cancel = useCallback(() => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [synth]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synth) synth.cancel();
    };
  }, [synth]);

  return { speak, cancel, isSpeaking };
};
