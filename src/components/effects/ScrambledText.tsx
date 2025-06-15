
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ScrambledTextProps {
  text: string;
  className?: string;
  scrambleChars?: string;
  revealSpeed?: number; // Chars to reveal per cycle
  scrambleInterval?: number; // Interval for updating scramble effect
  revealDelay?: number; // Delay before starting reveal
}

const DEFAULT_SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

export function ScrambledText({
  text,
  className,
  scrambleChars = DEFAULT_SCRAMBLE_CHARS,
  revealSpeed = 1,
  scrambleInterval = 30,
  revealDelay = 0,
}: ScrambledTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [revealedCharacterCount, setRevealedCharacterCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const animateText = useCallback(() => {
    let currentRevealedCount = 0;
    let animationFrame = 0;

    const intervalId = setInterval(() => {
      animationFrame++;
      let newDisplayText = "";
      let fullyRevealed = true;

      for (let i = 0; i < text.length; i++) {
        if (i < currentRevealedCount) {
          newDisplayText += text[i];
        } else {
          newDisplayText += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          fullyRevealed = false;
        }
      }
      
      setDisplayedText(newDisplayText);
      setRevealedCharacterCount(currentRevealedCount); // Update shared state

      if (animationFrame % Math.max(1, Math.floor(100 / scrambleInterval / revealSpeed)) === 0) {
         if (currentRevealedCount < text.length) {
            currentRevealedCount += revealSpeed;
            currentRevealedCount = Math.min(currentRevealedCount, text.length);
         }
      }

      if (fullyRevealed && currentRevealedCount >= text.length) {
        clearInterval(intervalId);
        setDisplayedText(text);
        setRevealedCharacterCount(text.length); // Ensure all are marked revealed
      }
    }, scrambleInterval);

    return () => clearInterval(intervalId);
  }, [text, scrambleChars, revealSpeed, scrambleInterval, setRevealedCharacterCount]);

  useEffect(() => {
    setIsMounted(true);
    setRevealedCharacterCount(0); // Reset on text change or mount
    setDisplayedText(
        Array(text.length)
        .fill(null)
        .map(() => scrambleChars[Math.floor(Math.random() * scrambleChars.length)])
        .join('')
    );
  }, [text, scrambleChars]); // text.length removed as text implies length, added scrambleChars

  useEffect(() => {
    if (!isMounted || !text) return;

    let cleanupFunction: () => void = () => {};

    if (revealDelay > 0) {
      const timeoutId = setTimeout(() => {
        cleanupFunction = animateText();
      }, revealDelay);
      return () => {
        clearTimeout(timeoutId);
        cleanupFunction();
      };
    } else {
      cleanupFunction = animateText();
      return cleanupFunction;
    }
  }, [isMounted, text, animateText, revealDelay]);

  return (
    <span className={cn(className)} aria-label={text} role="text">
      {displayedText.split("").map((char, index) => (
        <span
          key={index}
          className={cn({
            'animate-text-multicolor-glow': index < revealedCharacterCount,
          })}
          style={{ display: 'inline-block', minWidth: '0.5ch' }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
