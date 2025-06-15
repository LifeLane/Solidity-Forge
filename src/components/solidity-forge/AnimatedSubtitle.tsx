
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedSubtitleProps {
  text: string;
  isVisible: boolean;
}

export function AnimatedSubtitle({ text, isVisible }: AnimatedSubtitleProps) {
  const words = useMemo(() => text.split(' '), [text]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  useEffect(() => {
    if (!isVisible || words.length === 0) return;

    const intervalId = setInterval(() => {
      setActiveWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 400);

    return () => clearInterval(intervalId);
  }, [words, isVisible]);

  if (!isVisible) {
    // Render with opacity 0 to maintain layout space and prevent content flash
    return <span className="block opacity-0 min-h-[2.5em]">{text}</span>;
  }

  return (
    <span className="flex flex-wrap justify-center items-center gap-x-1.5 gap-y-1 min-h-[2.5em]">
      {words.map((word, index) => (
        <span
          key={index}
          className={cn(
            'inline-block', // Ensures proper spacing and individual styling
            index === activeWordIndex ? 'word-glow-active' : 'word-dimmed'
          )}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
