
"use client";

import React from 'react';

export function Footer() {
  return (
    <footer className="py-6 px-4 md:px-8 border-t border-border/50 text-center">
      <p className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} BlockSmithAI. All Rights Reserved.
      </p>
       <p className="text-xs text-muted-foreground/70 mt-1">
        Crafting smart contracts with AI precision.
      </p>
    </footer>
  );
}
