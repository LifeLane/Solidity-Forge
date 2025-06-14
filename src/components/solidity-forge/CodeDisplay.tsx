
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, ExternalLink, Lightbulb, Copy, Check, ShieldAlert, Zap, Wrench, Info, Fuel, Coins } from 'lucide-react';
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import type { EstimateGasCostOutput } from '@/ai/flows/estimate-gas-cost';


export type AISuggestionType = 'security' | 'optimization' | 'gas_saving' | 'best_practice' | 'informational';
export type AISuggestionSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface AISuggestion {
  id: string;
  type: AISuggestionType;
  severity: AISuggestionSeverity;
  description: string;
}

interface CodeDisplayProps {
  code: string;
  suggestions: AISuggestion[];
  securityScore: number | null;
  gasEstimation: EstimateGasCostOutput | null;
  isLoadingCode: boolean;
  isLoadingSuggestions: boolean;
  isLoadingGasEstimation: boolean;
}

export function CodeDisplay({
  code,
  suggestions,
  securityScore,
  gasEstimation,
  isLoadingCode,
  isLoadingSuggestions,
  isLoadingGasEstimation,
}: CodeDisplayProps) {
  const [activeTab, setActiveTab] = useState("code");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast({ title: "Code Copied!", description: "Solidity code copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy code: ", err);
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy code to clipboard." });
    });
  };

  const handleDeployToRemix = () => {
    if (!code) return;
    try {
      const base64Code = btoa(unescape(encodeURIComponent(code)));
      const remixURL = `https://remix.ethereum.org/?#code=${base64Code}&lang=sol`;
      window.open(remixURL, '_blank');
    } catch (error) {
        console.error("Error preparing Remix URL:", error);
        const base64Code = btoa(code); 
        const remixURL = `https://remix.ethereum.org/?#code=${base64Code}&lang=sol`;
        window.open(remixURL, '_blank');
        toast({
            variant: "destructive",
            title: "Remix Link Issue",
            description: "Opened Remix with standard encoding. Some special characters might not display correctly.",
        });
    }
  };

  const getSecurityScoreBadge = (score: number | null) => {
    if (score === null) return null;
    let variant: BadgeProps["variant"] = "default";
    let text = `Security Score: ${score}`;
    if (score >= 80) {
      variant = "default"; 
      text = `Excellent: ${score}`;
    } else if (score >= 60) {
      variant = "secondary"; 
      text = `Good: ${score}`;
    } else if (score >= 40) {
      variant = "outline"; 
      text = `Fair: ${score}`;
    } else {
      variant = "destructive"; 
      text = `Needs Improvement: ${score}`;
    }
    return <Badge variant={variant} className="text-xs">{text}</Badge>;
  };

  const getSeverityBadgeVariant = (severity: AISuggestionSeverity): BadgeProps["variant"] => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'outline'; 
      case 'low':
        return 'default'; 
      case 'info':
      default:
        return 'secondary';
    }
  };
  
  const getTypeIcon = (type: AISuggestionType) => {
    switch (type) {
      case 'security':
        return <ShieldAlert className="h-4 w-4 text-destructive shrink-0 mt-1" />;
      case 'optimization':
        return <Zap className="h-4 w-4 text-blue-500 shrink-0 mt-1" />;
      case 'gas_saving':
        return <Coins className="h-4 w-4 text-yellow-500 shrink-0 mt-1" />;
      case 'best_practice':
        return <Wrench className="h-4 w-4 text-green-500 shrink-0 mt-1" />;
      case 'informational':
        return <Info className="h-4 w-4 text-gray-500 shrink-0 mt-1" />;
      default:
        return <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-1" />;
    }
  };


  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2 text-center sm:text-left">
        <div>
            <CardTitle className="text-2xl font-headline">Generated Code</CardTitle>
            <CardDescription>Review your code and AI insights.</CardDescription>
        </div>
        {activeTab === "code" && code && !isLoadingCode && (
          <div className="flex gap-2 mt-2 sm:mt-0 self-center sm:self-auto">
            <Button variant="outline" size="sm" onClick={handleCopyToClipboard} aria-label="Copy code">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeployToRemix} aria-label="Deploy to Remix">
              Deploy to Remix <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="mb-4 grid w-full grid-cols-3 animate-multicolor-border-glow">
          <TabsTrigger 
            value="code" 
            className="hover:bg-accent/10 data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground animate-multicolor-border-glow rounded-sm"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Code
          </TabsTrigger>
          <TabsTrigger 
            value="suggestions" 
            className="hover:bg-accent/10 data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground animate-multicolor-border-glow rounded-sm" 
            disabled={!code && !isLoadingSuggestions}
          >
             <Lightbulb className="mr-2 h-4 w-4" /> AI Suggestions
          </TabsTrigger>
          <TabsTrigger 
            value="gas" 
            className="hover:bg-accent/10 data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground animate-multicolor-border-glow rounded-sm" 
            disabled={!code && !isLoadingGasEstimation}
          >
             <Fuel className="mr-2 h-4 w-4" /> Gas Estimation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="flex-grow overflow-hidden rounded-md border border-border/50 bg-muted/20 animate-multicolor-border-glow">
          <ScrollArea className="h-[calc(100vh-18rem)] lg:h-[calc(100vh-24rem)] max-h-[600px] p-1">
            {isLoadingCode ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : code ? (
              <pre className="p-4 text-sm font-code whitespace-pre-wrap break-all">{code}</pre>
            ) : (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <CheckCircle2 className="w-12 h-12 mb-4 text-muted-foreground/50" />
                <p>Your generated Solidity code will appear here.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="suggestions" className="flex-grow overflow-hidden rounded-md border border-border/50 bg-muted/20 animate-multicolor-border-glow">
          <ScrollArea className="h-[calc(100vh-18rem)] lg:h-[calc(100vh-24rem)] max-h-[600px] p-1">
            {isLoadingSuggestions ? (
               <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
              </div>
            ) : suggestions.length > 0 || securityScore !== null ? (
              <div className="p-4 space-y-4">
                {securityScore !== null && (
                  <div className="flex items-center justify-between p-3 bg-card rounded-md shadow mb-3">
                    <h3 className="text-base font-semibold">Security Score</h3>
                    {getSecurityScoreBadge(securityScore)}
                  </div>
                )}
                {suggestions.length > 0 && <Separator className="my-3"/>}
                {suggestions.length > 0 && <h3 className="text-base font-semibold mb-2 text-center">AI Suggestions:</h3>}
                <ul className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.id} className="p-3 bg-card/50 rounded-md text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(suggestion.type)}
                        <Badge variant={getSeverityBadgeVariant(suggestion.severity)} className="capitalize">{suggestion.severity}</Badge>
                        <Badge variant="outline" className="capitalize">{suggestion.type.replace('_', ' ')}</Badge>
                      </div>
                      <p>{suggestion.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : code && !isLoadingCode ? (
                 <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                    <Lightbulb className="w-12 h-12 mb-4 text-muted-foreground/50" />
                    <p>No specific suggestions at this time, or click "Get AI Suggestions" after generating code.</p>
                 </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                <p>Generate code first, then click "Get AI Suggestions" to see analysis here.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

         <TabsContent value="gas" className="flex-grow overflow-hidden rounded-md border border-border/50 bg-muted/20 animate-multicolor-border-glow">
          <ScrollArea className="h-[calc(100vh-18rem)] lg:h-[calc(100vh-24rem)] max-h-[600px] p-1">
            {isLoadingGasEstimation ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : gasEstimation ? (
              <div className="p-4 space-y-4">
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><Fuel className="w-5 h-5 text-primary"/>Gas Estimation Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-base text-primary">Estimated Gas Range:</h4>
                      <p className="text-sm whitespace-pre-line">{gasEstimation.estimatedGasRange}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-base text-primary">Explanation & Factors:</h4>
                      <p className="text-sm whitespace-pre-line">{gasEstimation.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : code && !isLoadingCode ? (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <Fuel className="w-12 h-12 mb-4 text-muted-foreground/50" />
                <p>Click "Estimate Gas Costs" to get an AI-powered analysis of potential gas usage.</p>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                <p>Generate code first, then click "Estimate Gas Costs" to see analysis here.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
