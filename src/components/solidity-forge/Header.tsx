
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/solidity-forge/ThemeToggle';

const SolidityForgeIcon = () => (
  <svg
    width="36" 
    height="36"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="SolidityForge Logo"
    className="text-primary" 
  >
    <path d="M50 5L75 20L95 50L75 80L50 95L25 80L5 50L25 20L50 5Z" stroke="currentColor" strokeWidth="8" strokeLinejoin="round"/>
    <path d="M50 35L65 50L50 65L35 50L50 35Z" fill="currentColor" stroke="rgb(var(--background-start-rgb))" strokeWidth="3" />
  </svg>
);


export function Header() {
  return (
    <div
      className={cn(
        "sticky top-0 z-50 backdrop-blur-sm shadow-md border-b border-glass-section-border",
        "py-3 px-section-x bg-[hsla(var(--background-start-rgb),0.8)]" 
      )}
    >
      <header 
        className="container mx-auto flex items-center justify-between h-14"
      >
        <div className="flex items-center gap-3 group cursor-default">
          <SolidityForgeIcon />
          <h1 className="text-2xl sm:text-3xl font-orbitron font-bold text-foreground m-0 p-0 animate-glitch-flicker" style={{animationDuration: '3s'}}>
            SolidityForge
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground font-share-tech-mono">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI-Powered Smart Contracts</span>
          </div>
          <ThemeToggle /> 
        </div>
      </header>
    </div>
  );
}
