
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/solidity-forge/ThemeToggle';
import { ScrambledText } from '@/components/effects/ScrambledText';

// SolidityForge Icon - a simple geometric representation
const SolidityForgeIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="SolidityForge Logo"
  >
    <path d="M50 5L75 20L95 50L75 80L50 95L25 80L5 50L25 20L50 5Z" stroke="currentColor" strokeWidth="10" strokeLinejoin="round"/>
    <path d="M50 35L65 50L50 65L35 50L50 35Z" fill="currentColor" stroke="hsl(var(--background))" strokeWidth="4" />
  </svg>
);


export function Header() {
  return (
    <div
      className={cn(
        "sticky top-0 z-50 p-2 bg-card/90 backdrop-blur-md rounded-lg shadow-lg tab-running-lines-border",
        "relative" 
      )}
      style={{ transform: 'translateZ(0)' }} 
    >
      <header 
        className="w-full px-4 py-2 flex flex-col items-center gap-2 sm:flex-row sm:justify-between"
      >
        <div className="flex items-center gap-3 group cursor-default">
          <span className="inline-block animate-text-multicolor-glow">
            <SolidityForgeIcon />
          </span>
          <ScrambledText 
            text="SolidityForge" 
            className="text-2xl font-headline font-bold" 
            revealSpeed={1}
            scrambleInterval={40}
            revealDelay={200}
          />
        </div>
        <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-accent" />
              <ScrambledText 
                text="AI-Powered Smart Contracts" 
                className="text-xs sm:text-sm text-muted-foreground"
                revealSpeed={1}
                scrambleInterval={50}
                revealDelay={700}
              />
          </div>
          {/* ThemeToggle is rendered below but positions itself via its own fixed classes */}
        </div>
      </header>
      {/* ThemeToggle is rendered here but positions itself via its own fixed classes */}
      <ThemeToggle /> 
    </div>
  );
}

