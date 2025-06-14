
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
      toast({ title: "Address Copied!", description: `${address} copied to clipboard.` });
      setTimeout(() => setCopiedAddress(null), 2000);
    }).catch(err => {
      console.error("Failed to copy address: ", err);
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy address." });
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <CardTitle className="text-2xl font-headline mb-2 flex items-center justify-center gap-2 p-2 rounded-md animate-multicolor-border-glow">
          <Network className="w-7 h-7 text-primary"/> Find Common Contract Addresses
        </CardTitle>
        <CardDescription className="p-2 rounded-md animate-multicolor-border-glow mb-6">
          Use natural language to find known contract addresses (e.g., "Uniswap V2 Router on Ethereum", "PancakeSwap factories", "WETH on Polygon").
        </CardDescription>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (setInitialQuery) setInitialQuery(e.target.value);
          }}
          placeholder="e.g., Uniswap V2 Router Ethereum"
          className="flex-grow bg-input/50 focus:bg-input p-2 rounded-md animate-multicolor-border-glow"
          aria-label="Contract address query"
        />
        <Button type="submit" disabled={isLoading} className="hover:shadow-lg hover:scale-105 transition-transform">
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Search />
          )}
          <span className="ml-2">Find Addresses</span>
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-4 mt-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-muted/30 animate-pulse">
              <CardHeader>
                <div className="h-5 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded mt-1"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {results && !isLoading && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-center text-primary p-2 rounded-md animate-multicolor-border-glow mb-4">{results.summary}</h3>
          {results.results && results.results.length > 0 && (
            <ScrollArea className="h-[400px] p-1 rounded-md border border-border/50 bg-muted/20 animate-multicolor-border-glow">
              <div className="space-y-4 p-3">
                {results.results.map((item, index) => (
                  <Card key={index} className="bg-card/70 backdrop-blur-sm shadow-md animate-multicolor-border-glow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 p-2 rounded-md animate-multicolor-border-glow mb-1">
                        <FileJson className="w-5 h-5 text-primary" />
                        {item.contractName}
                      </CardTitle>
                      <CardDescription className="text-xs flex flex-wrap gap-x-2 gap-y-1">
                         <Badge variant="secondary">{item.systemName}</Badge> 
                         <Badge variant="outline">{item.mainnetName}</Badge>
                         <Badge variant="default">{item.type}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-3">
                      <div className="flex items-center gap-2 text-sm font-mono break-all bg-muted p-2 rounded-md">
                        <CaseSensitive className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="flex-grow">{item.address}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => handleCopyToClipboard(item.address)}
                          aria-label="Copy address"
                        >
                          {copiedAddress === item.address ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      {item.notes && <p className="text-xs text-muted-foreground italic">Note: {item.notes}</p>}
                    </CardContent>
                    {item.explorerUrlPrefix && (
                      <CardFooter className="pt-0">
                        <Button 
                          variant="link" 
                          size="sm" 
                          asChild 
                          className="p-0 h-auto text-primary hover:text-accent"
                        >
                          <a href={`${item.explorerUrlPrefix}${item.address}`} target="_blank" rel="noopener noreferrer">
                            View on Explorer <ExternalLink className="ml-1.5 w-3.5 h-3.5" />
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
             <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <AlertTriangle className="w-12 h-12 mb-4 text-muted-foreground/50" />
                <p>No specific contract addresses found for your query. Try a different or more specific query.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
}
