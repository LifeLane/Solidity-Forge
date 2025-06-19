
"use client";

import React from 'react';

export function Footer() {
  return (
    <footer className="py-8 px-section-x border-t border-glass-section-border/30 text-center mt-auto">
      <p className="text-sm text-muted-foreground font-share-tech-mono">
        &copy; {new Date().getFullYear()} BlockSmithAI // SolidityForge Sentient Interface v1.0
      </p>
       <p className="text-xs text-muted-foreground/70 mt-1.5 font-uncut-sans">
        Transcending traditional smart contract creation with advanced AI sentience.
      </p>
    </footer>
  );
}
