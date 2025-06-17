
"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Already has Card
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, Check, Search, Loader2, AlertTriangle, Network, FileJson, CaseSensitive } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { GetKnownLiquidityPoolInfoOutput, KnownContractAddressInfo } from '@/ai/flows/get-known-liquidity-pool-info';
// Removed cn as it's not used

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
      toast({ title: "Address Copied!", description: `${address.substring(0,10)}... copied.` });
      setTimeout(() => setCopiedAddress(null), 2000);
    }).catch(err => {
      console.error("Failed to copy address: ", err);
      toast({ variant: "destructive", title: "Copy Failed" });
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <CardTitle className="text-lg font-semibold flex items-center justify-center gap-2 text-foreground">
          <Network className="w-5 h-5 text-primary"/> Known Contract Addresses
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
          Search for common DeFi contract addresses (e.g., DEX routers, factories, WETH) on major EVM chains.
        </CardDescription>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (setInitialQuery) setInitialQuery(e.target.value);
          }}
          placeholder="e.g., 'PancakeSwap Router BNB'..."
          className="flex-grow bg-background/70 focus:bg-background text-sm h-9"
          aria-label="Contract address query"
        />
        <Button type="submit" disabled={isLoading} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9">
          {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />}
          Search
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-3 mt-3">
          {[1, 2].map(i => (
            <Card key={i} className="bg-muted/30 animate-pulse border border-border/20 p-2.5">
              <div className="h-4 w-3/4 bg-muted rounded mb-1.5"></div>
              <div className="h-3 w-1/2 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      )}

      {results && !isLoading && (
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-medium text-center text-muted-foreground">{results.summary}</h3>
          {results.results && results.results.length > 0 && (
            <ScrollArea className="h-[250px] p-0.5 rounded-md border border-border/30 bg-muted/20">
              <div className="space-y-2 p-2">
                {results.results.map((item, index) => (
                  <Card key={index} className="bg-card/80 shadow-sm border border-border/20">
                    <CardHeader className="p-2 pb-1">
                      <CardTitle className="text-sm flex items-center gap-1.5 font-medium text-foreground">
                        <FileJson className="w-3.5 h-3.5 text-primary" />
                        {item.contractName}
                      </CardTitle>
                      <CardDescription className="text-xs flex flex-wrap gap-x-1 gap-y-0.5 pt-0.5">
                         <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">{item.systemName}</Badge> 
                         <Badge variant="outline" className="px-1.5 py-0.5 text-xs">{item.mainnetName}</Badge>
                         <Badge variant="default" className="px-1.5 py-0.5 text-xs bg-primary/80">{item.type}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1 p-2 pt-0.5 pb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-mono break-all bg-muted p-1 rounded-sm border border-border/20">
                        <CaseSensitive className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="flex-grow text-muted-foreground text-[0.7rem]">{item.address}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 text-muted-foreground hover:text-primary" onClick={() => handleCopyToClipboard(item.address)} aria-label="Copy address">
                          {copiedAddress === item.address ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      {item.notes && <p className="text-[0.7rem] text-muted-foreground/80 italic pt-0.5">Note: {item.notes}</p>}
                    </CardContent>
                    {item.explorerUrlPrefix && (
                      <CardFooter className="p-2 pt-0">
                        <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs text-primary hover:text-accent">
                          <a href={`${item.explorerUrlPrefix}${item.address}`} target="_blank" rel="noopener noreferrer">
                            View on Explorer <ExternalLink className="ml-1 w-2.5 h-2.5" />
                          </a>
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
          {results.results && results.results.length === 0 && !results.summary.toLowerCase().includes("found") && (
             <div className="p-4 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[100px]">
                <AlertTriangle className="w-8 h-8 mb-2 text-muted-foreground/50" />
                <p className="text-xs">No matching addresses found in the archives for this query.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
}
