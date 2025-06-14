import { Sparkles } from 'lucide-react';

// SolidityForge Icon - a simple geometric representation
const SolidityForgeIcon = () => (
  <svg 
    width="40" 
    height="40" 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="text-primary group-hover:text-accent transition-colors duration-300"
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
    <header className="py-4 px-4 md:px-8 border-b border-border/50 shadow-lg bg-background/70 backdrop-blur-md sticky top-0 z-50 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-default">
          <SolidityForgeIcon />
          <h1 className="text-3xl font-headline font-bold text-primary group-hover:text-accent transition-colors duration-300">
            SolidityForge
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-5 h-5 text-accent" />
            <span>Craft Smart Contracts with AI Precision</span>
        </div>
      </div>
    </header>
  );
}
