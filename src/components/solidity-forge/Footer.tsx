export function Footer() {
  return (
    <footer className="py-6 px-4 md:px-8 border-t border-border/50 text-center animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} SolidityForge. Powered by AI. All rights reserved.
      </p>
    </footer>
  );
}
