"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedSubtitleProps {
  text: string;
  className?: string;
  baseDelay?: number; // ms
  wordGlowInterval?: number; // ms
}

const AnimatedSubtitle: React.FC<AnimatedSubtitleProps> = ({
  text,
  className,
  baseDelay = 500,
  wordGlowInterval = 300,
}) => {
  const words = useMemo(() => text.split(' '), [text]);
  const [activeWordIndex, setActiveWordIndex] = useState(-1); // Start at -1 so no word is active initially
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, baseDelay); // Delay for initial appearance

    return () => clearTimeout(visibilityTimer);
  }, [baseDelay]);


  useEffect(() => {
    if (!isVisible || words.length === 0) return;

    // Start the word glow animation after the initial visibility delay
    const glowTimer = setTimeout(() => {
      setActiveWordIndex(0); // Activate the first word
    }, 100); // Short delay after becoming visible to start glowing

    return () => clearTimeout(glowTimer);
  }, [isVisible, words.length]);


  useEffect(() => {
    if (!isVisible || activeWordIndex === -1 || words.length === 0) return;

    const intervalId = setInterval(() => {
      setActiveWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, wordGlowInterval);

    return () => clearInterval(intervalId);
  }, [words, wordGlowInterval, isVisible, activeWordIndex]);

  if (!isVisible) {
    return <p className={cn("text-base text-muted-foreground opacity-0 min-h-[1.5em]", className)}>&nbsp;</p>; // Keep space, but invisible
  }

  return (
    <p className={cn("text-base text-muted-foreground flex flex-wrap justify-center items-center gap-x-1.5 gap-y-1 min-h-[1.5em]", className)}>
      {words.map((word, index) => (
        <span
          key={index}
          className={cn(
            'transition-all duration-300 ease-in-out inline-block',
            index === activeWordIndex ? 'word-glow-active' : 'word-dimmed'
          )}
        >
          {word}
        </span>
      ))}
    </p>
  );
};

export default React.memo(AnimatedSubtitle);"