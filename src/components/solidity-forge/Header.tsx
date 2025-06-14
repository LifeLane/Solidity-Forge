
import { Sparkles } from 'lucide-react';

// SolidityForge Icon - a simple geometric representation
const SolidityForgeIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary group-hover:text-accent transition-colors duration-300 animate-pulse"
    aria-label="SolidityForge Logo"
  >
    <path d="M50 5L75 20L95 50L75 80L50 95L25 80L5 50L25 20L50 5Z" stroke="currentColor" strokeWidth="8" strokeLinejoin="round"/>
    <path d="M50 5L25 20L5 50M50 5L75 20L95 50" stroke="currentColor" strokeWidth="8" strokeLinejoin="round"/>
    <path d="M50 95L25 80L5 50M50 95L75 80L95 50" stroke="currentColor" strokeWidth="8" strokeLinejoin="round"/>
    <path d="M50 35L65 50L50 65L35 50L50 35Z" fill="currentColor" stroke="hsl(var(--background))" strokeWidth="3" />
  </svg>
);


export function Header() {
  return (
    // Outer sticky positioning element. Provides "breathing room" for the glow.
    // p-2 gives 0.5rem (8px) of space, which should be enough for the glow (max 9px blur).
    <div
      className="sticky top-0 z-50 p-2"
      style={{ transform: 'translateZ(0)' }} // Rendering hint for sticky + effects
    >
      <header
        className="py-4 px-4 md:px-8 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg animate-fadeInUp animate-multicolor-border-glow"
        style={{ animationDelay: '0.1s' }} // Animation applies to the visible header block
      >
        <div className="container mx-auto flex flex-col items-center gap-3 md:flex-row md:justify-between">
          <div className="flex items-center gap-3 group cursor-default text-center md:text-left p-2 rounded-md animate-multicolor-border-glow">
            <SolidityForgeIcon />
            <h1 className="text-3xl font-headline font-bold text-primary group-hover:text-accent transition-colors duration-300">
              SolidityForge
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground text-center md:text-right">
              <Sparkles className="w-5 h-5 text-accent" />
              <span>AI-Powered Smart Contracts</span>
          </div>
        </div>
      </header>
    </div>
  );
}
