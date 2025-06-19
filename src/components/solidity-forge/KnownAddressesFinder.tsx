
"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, Check, Search, Loader2, AlertTriangle, Network, FileJson, CaseSensitive, DatabaseZap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { GetKnownLiquidityPoolInfoOutput, KnownContractAddressInfo } from '@/ai/flows/get-known-liquidity-pool-info';

interface KnownAddressesFinderProps {
  onFindAddresses: (query: string) => Promise<void>;
  results: GetKnownLiquidityPoolInfoOutput | null;
  isLoading: boolean;
  initialQuery?: string;
  setInitialQuery?: (query: string) => void;
}

export function KnownAddressesFinder({ 
    onFindAddresses, 
    results, 
    isLoading, 
    initialQuery = '', 
    setInitialQuery 
}: KnownAddressesFinderProps) {
  const [query, setQuery] = useState(initialQuery);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFindAddresses(query);
  };

  const handleCopyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address).then(() => {
      setCopiedAddress(address);
      toast({ title: "Address Vector Copied!", description: `${address.substring(0,10)}... data stream replicated.` });
      setTimeout(() => setCopiedAddress(null), 2000);
    }).catch(err => {
      console.error("Failed to copy address: ", err);
      toast({ variant: "destructive", title: "Copy Sequence Failed" });
    });
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-display-sm font-orbitron text-foreground flex items-center justify-center gap-2.5">
          <DatabaseZap className="w-7 h-7 text-primary"/> Known <span className="gradient-text-cyan-magenta">Artifact</span> Archives
        </h2>
        <p className="text-body-lg text-muted-foreground max-w-lg mx-auto mt-1 font-uncut-sans">
          Query the archives for common DeFi contract addresses (e.g., DEX routers, factories, WETH) on major EVM chains.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (setInitialQuery) setInitialQuery(e.target.value);
          }}
          placeholder="e.g., 'PancakeSwap Router BNB'..."
          className="flex-grow bg-input border-border focus:border-primary text-base h-11 font-share-tech-mono"
          aria-label="Contract address query"
        />
        <Button type="submit" disabled={isLoading} className="btn-terminal-cta h-11">
          {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Search className="mr-2 h-5 w-5" />}
          Query Archives
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-3 mt-4">
          {[1, 2].map(i => (
            <div key={i} className="p-3 rounded-md bg-[rgba(var(--input-background-rgb),0.5)] animate-pulse border border-glass-section-border/20">
              <div className="h-5 w-3/4 bg-muted/30 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-muted/30 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {results && !isLoading && (
        <div className="mt-5 space-y-3">
          <h3 className="text-base font-space-mono text-center text-muted-foreground">{results.summary}</h3>
          {results.results && results.results.length > 0 && (
            <ScrollArea className="h-[300px] p-0.5 rounded-lg border border-glass-section-border/20 bg-[rgba(var(--background-rgb),0.3)]">
              <div className="space-y-2.5 p-2.5">
                {results.results.map((item, index) => (
                  <div key={index} className="bg-[rgba(var(--input-background-rgb),0.5)] shadow-md border border-glass-section-border/20 rounded-lg p-3">
                    <div className="pb-1.5 mb-1.5 border-b border-glass-section-border/10">
                      <h4 className="text-base flex items-center gap-2 font-space-mono font-semibold text-primary">
                        <FileJson className="w-4 h-4" />
                        {item.contractName}
                      </h4>
                      <div className="text-xs flex flex-wrap gap-x-1.5 gap-y-1 pt-1">
                         <Badge variant="secondary" className="px-2 py-0.5 text-xs font-share-tech-mono bg-secondary/70 text-secondary-foreground/80">{item.systemName}</Badge> 
                         <Badge variant="outline" className="px-2 py-0.5 text-xs font-share-tech-mono border-primary/30 text-primary/90 bg-primary/10">{item.mainnetName}</Badge>
                         <Badge variant="default" className="px-2 py-0.5 text-xs font-share-tech-mono bg-primary/80 text-primary-foreground">{item.type}</Badge>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-cli break-all bg-[rgba(var(--background-rgb),0.5)] p-1.5 rounded-md border border-glass-section-border/10">
                        <CaseSensitive className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="flex-grow text-muted-foreground text-xs">{item.address}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-primary" onClick={() => handleCopyToClipboard(item.address)} aria-label="Copy address">
                          {copiedAddress === item.address ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                      {item.notes && <p className="text-xs text-muted-foreground/70 italic pt-0.5 font-uncut-sans">Note: {item.notes}</p>}
                    </div>
                    {item.explorerUrlPrefix && (
                      <div className="pt-2 mt-1.5 border-t border-glass-section-border/10">
                        <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs text-primary hover:text-accent font-share-tech-mono">
                          <a href={`${item.explorerUrlPrefix}${item.address}`} target="_blank" rel="noopener noreferrer">
                            Verify on Explorer Matrix <ExternalLink className="ml-1 w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          {results.results && results.results.length === 0 && !results.summary.toLowerCase().includes("found") && (
             <div className="p-4 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[100px] font-uncut-sans">
                <AlertTriangle className="w-10 h-10 mb-3 text-muted-foreground/50" />
                <p className="text-sm">No matching artifact vectors found in the archives for this query directive.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
}
