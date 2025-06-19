
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import GalaxyBackground from '@/components/solidity-forge/GalaxyBackground';
import { ThemeProvider } from '@/components/solidity-forge/ThemeProvider';

export const metadata: Metadata = {
  title: 'SolidityForge // Sentient UI',
  description: 'Craft Smart Contracts with AI Precision - Futuristic Sentient UI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&family=Space+Mono:wght@400;700&family=Uncut+Sans:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          defaultTheme="dark" // Force dark theme as per new spec
          storageKey="solidity-forge-theme"
        >
          <GalaxyBackground />
          <div className="relative z-10 min-h-screen flex flex-col">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
