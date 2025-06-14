
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// SolidityForge Icon - a simple geometric representation
const SolidityForgeIcon = () => (
  <svg
    width="32" // Slightly smaller to fit better
    height="32"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary group-hover:text-accent transition-colors duration-300"
    aria-label="SolidityForge Logo"
  >
    <path d="M50 5L75 20L95 50L75 80L50 95L25 80L5 50L25 20L50 5Z" stroke="currentColor" strokeWidth="10" strokeLinejoin="round"/>
    <path d="M50 35L65 50L50 65L35 50L50 35Z" fill="currentColor" stroke="hsl(var(--background))" strokeWidth="4" />
  </svg>
);


export function Header() {
  return (
    <div
      className="sticky top-0 z-50 p-2"
      style={{ transform: 'translateZ(0)' }} 
    >
      <header
        className={cn(
          "py-3 px-4 md:px-6 bg-card/90 backdrop-blur-md border rounded-lg animate-fadeInUp glow-border-accent"
        )}
        style={{ animationDelay: '0.1s' }} 
      >
        <div className="container mx-auto flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <SolidityForgeIcon />
            <h1 className="text-2xl font-headline font-bold text-glow-primary">
              SolidityForge
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>AI-Powered Smart Contracts</span>
          </div>
        </div>
      </header>
    </div>
  );
}

    