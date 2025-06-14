
"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, Check, Search, Loader2, AlertTriangle, Network, FileJson, CaseSensitive } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { GetKnownLiquidityPoolInfoOutput, KnownContractAddressInfo } from '@/ai/flows/get-known-liquidity-pool-info';
import { cn } from '@/lib/utils';

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
      toast({ title: "Address Copied!", description: `${address.substring(0,10)}... copied to clipboard.` });
      setTimeout(() => setCopiedAddress(null), 2000);
    }).catch(err => {
      console.error("Failed to copy address: ", err);
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy address." });
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CardTitle className="text-2xl font-headline mb-2 flex items-center justify-center gap-2 text-glow-primary">
          <Network className="w-6 h-6"/> Seek Known Contract Glyphs
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground max-w-lg mx-auto">
          Utter your query (in human tongue) to unearth known contract addresses from my limited archives.
        </CardDescription>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (setInitialQuery) setInitialQuery(e.target.value);
          }}
          placeholder="e.g., 'PancakeSwap Router BNB', 'WETH on Polygon'..."
          className="flex-grow bg-background/70 focus:bg-background glow-border-purple"
          aria-label="Contract address query"
        />
        <Button type="submit" disabled={isLoading} className="glow-border-primary bg-primary text-primary-foreground hover:bg-primary/90">
          {isLoading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <Search className="mr-2" />
          )}
          Seek Addresses
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-4 mt-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-muted/30 animate-pulse border border-border/20">
              <CardHeader className="p-3">
                <div className="h-5 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded mt-1.5"></div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-8 w-full bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {results && !isLoading && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-center text-primary mb-4">{results.summary}</h3>
          {results.results && results.results.length > 0 && (
            <ScrollArea className="h-[300px] p-0.5 rounded-md border border-border/30 bg-muted/20">
              <div className="space-y-3 p-3">
                {results.results.map((item, index) => (
                  <Card key={index} className="bg-card/70 backdrop-blur-sm shadow-md border border-border/20">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-md flex items-center gap-2 font-semibold text-primary-foreground">
                        <FileJson className="w-4 h-4 text-primary" />
                        {item.contractName}
                      </CardTitle>
                      <CardDescription className="text-xs flex flex-wrap gap-x-1.5 gap-y-1 pt-1">
                         <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">{item.systemName}</Badge> 
                         <Badge variant="outline" className="px-1.5 py-0.5 text-xs">{item.mainnetName}</Badge>
                         <Badge variant="default" className="px-1.5 py-0.5 text-xs">{item.type}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1.5 p-3 pt-1 pb-2">
                      <div className="flex items-center gap-2 text-xs font-mono break-all bg-muted p-1.5 rounded-sm border border-border/20">
                        <CaseSensitive className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="flex-grow text-muted-foreground">{item.address}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-primary"
                          onClick={() => handleCopyToClipboard(item.address)}
                          aria-label="Copy address"
                        >
                          {copiedAddress === item.address ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                      {item.notes && <p className="text-xs text-muted-foreground/80 italic pt-1">Note: {item.notes}</p>}
                    </CardContent>
                    {item.explorerUrlPrefix && (
                      <CardFooter className="p-3 pt-0">
                        <Button 
                          variant="link" 
                          size="sm" 
                          asChild 
                          className="p-0 h-auto text-xs text-primary hover:text-accent"
                        >
                          <a href={`${item.explorerUrlPrefix}${item.address}`} target="_blank" rel="noopener noreferrer">
                            View on Explorer <ExternalLink className="ml-1 w-3 h-3" />
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
             <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[150px]">
                <AlertTriangle className="w-10 h-10 mb-3 text-muted-foreground/50" />
                <p className="text-sm">My scrolls show nothing for that incantation. Try a different query.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
}

    