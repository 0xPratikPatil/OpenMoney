'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTypewriterOptions {
  /** Full text string to type */
  text: string;
  /** Speed in ms per character. Default: 50 */
  speed?: number;
  /** Initial delay before typing starts. Default: 0 */
  startDelay?: number;
  /** If true, loop forever. Default: false */
  loop?: boolean;
  /** If true, start typing immediately. Default: true */
  start?: boolean;
  /** Callback when typing finishes one cycle */
  onComplete?: () => void;
}

/**
 * Types text character by character with configurable speed and looping.
 * Returns the current displayed text.
 *
 * @example
 * const text = useTypewriter({ text: 'Hello World', speed: 40 });
 * return <span>{text}<span className="animate-caret-blink">|</span></span>
 */
export function useTypewriter(options: UseTypewriterOptions) {
  const {
    text,
    speed = 50,
    startDelay = 0,
    loop = false,
    start = true,
    onComplete,
  } = options;

  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const reset = useCallback(() => {
    setIndex(0);
    setDisplayText('');
  }, []);

  useEffect(() => {
    if (!start) {
      reset();
      return;
    }

    if (index === 0 && startDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        setDisplayText('');
        setIndex(1);
      }, startDelay);
      return;
    }

    if (index > text.length) {
      onComplete?.();
      if (loop) {
        timeoutRef.current = setTimeout(() => {
          reset();
        }, 1000);
      }
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setDisplayText(text.slice(0, index));
      setIndex((i) => i + 1);
    }, speed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, text, speed, startDelay, loop, start, onComplete, reset]);

  return displayText;
}
