
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/solidity-forge/ThemeToggle';

const SolidityForgeIcon = () => (
  <svg
    width="28" // Slightly smaller
    height="28"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="SolidityForge Logo"
    className="text-primary" // Use primary color
  >
    <path d="M50 5L75 20L95 50L75 80L50 95L25 80L5 50L25 20L50 5Z" stroke="currentColor" strokeWidth="10" strokeLinejoin="round"/>
    <path d="M50 35L65 50L50 65L35 50L50 35Z" fill="currentColor" stroke="hsl(var(--background))" strokeWidth="4" />
  </svg>
);


export function Header() {
  return (
    <div
      className={cn(
        "sticky top-0 z-50 bg-card/95 backdrop-blur-sm shadow-md border-b",
        "py-2 px-4" 
      )}
    >
      <header 
        className="container mx-auto flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5 group cursor-default">
          <SolidityForgeIcon />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground m-0 p-0">
            SolidityForge
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>AI-Powered Smart Contracts</span>
          </div>
          <ThemeToggle /> 
        </div>
      </header>
    </div>
  );
}
