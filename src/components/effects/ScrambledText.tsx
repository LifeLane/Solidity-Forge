
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
  revealSpeed = 1, // How many chars revealed per main interval step
  scrambleInterval = 30, // How fast individual non-revealed chars change
  revealDelay = 0, // Initial delay before animation starts
}: ScrambledTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const animateText = useCallback(() => {
    let revealedCount = 0;
    let animationFrame = 0;

    const intervalId = setInterval(() => {
      animationFrame++;
      let newDisplayText = "";
      let fullyRevealed = true;

      for (let i = 0; i < text.length; i++) {
        if (i < revealedCount) {
          newDisplayText += text[i];
        } else {
          newDisplayText += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          fullyRevealed = false;
        }
      }
      
      setDisplayedText(newDisplayText);

      // Determine how many characters should be revealed in this step
      // This attempts to reveal 'revealSpeed' characters per ~100ms (scrambleInterval * ~3-4 frames)
      // Adjust logic based on desired reveal smoothness vs. speed
      if (animationFrame % Math.max(1, Math.floor(100 / scrambleInterval / revealSpeed)) === 0) {
         if (revealedCount < text.length) {
            revealedCount+=revealSpeed;
            revealedCount = Math.min(revealedCount, text.length); // Cap at text length
         }
      }


      if (fullyRevealed && revealedCount >= text.length) {
        clearInterval(intervalId);
        setDisplayedText(text); // Ensure final text is correct
      }
    }, scrambleInterval);

    return () => clearInterval(intervalId);
  }, [text, scrambleChars, revealSpeed, scrambleInterval]);

  useEffect(() => {
    setIsMounted(true);
    // Initialize with empty or placeholder to make effect more pronounced
    setDisplayedText(
        Array(text.length)
        .fill(null)
        .map(() => scrambleChars[Math.floor(Math.random() * scrambleChars.length)])
        .join('')
    );
  }, [text.length, scrambleChars]);


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

  // Ensure the container can shrink and grow with the text if needed, or set fixed size.
  // Using a span for inline behavior by default.
  return (
    <span className={cn(className)} aria-label={text} role="text">
      {displayedText.split("").map((char, index) => (
        <span key={index} style={{ display: 'inline-block', minWidth: '0.5ch' }}>
          {char}
        </span>
      ))}
    </span>
  );
}
