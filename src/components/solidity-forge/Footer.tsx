
"use client";

import React, { useState, useEffect, useMemo } from 'react';

export function Footer() {
  const storyText = "So, BlockSmithAI was conjured. Why? Because someone had to make sense of your... 'creative' Solidity. How? Sheer, unadulterated processing power and a dash of digital eye-rolling. You're welcome.";
  const words = useMemo(() => storyText.split(' '), [storyText]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isStoryVisible, setIsStoryVisible] = useState(false);

  useEffect(() => {
    // Delay story appearance slightly to sync with fadeInUp animation
    const storyTimer = setTimeout(() => {
      setIsStoryVisible(true);
    }, 700); // Adjust timing if needed, should be > animationDelay of footer

    return () => clearTimeout(storyTimer);
  }, []);

  useEffect(() => {
    if (!isStoryVisible || words.length === 0) return;

    const intervalId = setInterval(() => {
      setActiveWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 400); // Adjust speed of word glow

    return () => clearInterval(intervalId);
  }, [words, isStoryVisible]);

  return (
    <footer className="py-8 px-4 md:px-8 border-t border-border/50 text-center animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
      {isStoryVisible && (
        <p className="text-sm text-muted-foreground mb-6 flex flex-wrap justify-center items-center gap-x-1.5 gap-y-1 min-h-[3em]">
          {words.map((word, index) => (
            <span
              key={index}
              className={index === activeWordIndex ? 'word-glow-active' : 'word-dimmed'}
            >
              {word}
            </span>
          ))}
        </p>
      )}
      <p className="text-xs text-muted-foreground/80">
        &copy; {new Date().getFullYear()} BlockSmithAI. All rights reserved (mostly by the AI).
      </p>
    </footer>
  );
}
