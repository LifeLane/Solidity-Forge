
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/solidity-forge/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
                "glow-border-purple text-foreground hover:text-accent-foreground hover:bg-accent/20",
                "h-10 w-10 rounded-md" // Ensure consistent size
             )}
            aria-label="Toggle theme"
        >
          <Sun className="h-[1.4rem] w-[1.4rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.4rem] w-[1.4rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border shadow-xl">
        <DropdownMenuItem 
            onClick={() => setTheme('light')} 
            className="cursor-pointer hover:bg-muted focus:bg-muted"
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
            onClick={() => setTheme('dark')}
            className="cursor-pointer hover:bg-muted focus:bg-muted"
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
            onClick={() => setTheme('system')}
            className="cursor-pointer hover:bg-muted focus:bg-muted"
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
