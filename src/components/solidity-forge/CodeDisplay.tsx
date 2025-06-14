"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, ExternalLink, Lightbulb, Copy, Check } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";

export interface AISuggestion {
  id: string;
  text: string;
}

interface CodeDisplayProps {
  code: string;
  suggestions: AISuggestion[];
  securityScore: number | null;
  isLoadingCode: boolean;
  isLoadingSuggestions: boolean;
}

export function CodeDisplay({
  code,
  suggestions,
  securityScore,
  isLoadingCode,
  isLoadingSuggestions,
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
      // For UTF-8 compatibility with btoa
      const base64Code = btoa(unescape(encodeURIComponent(code)));
      const remixURL = `https://remix.ethereum.org/?#code=${base64Code}&lang=sol`;
      window.open(remixURL, '_blank');
    } catch (error) {
        console.error("Error preparing Remix URL:", error);
        // Fallback for potential btoa issues with complex characters, though rare for code
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
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let text = `Security Score: ${score}`;
    if (score >= 80) {
      variant = "default"; // Greenish in dark theme primary
      text = `Excellent: ${score}`;
    } else if (score >= 60) {
      variant = "secondary"; // Bluish/Yellowish
      text = `Good: ${score}`;
    } else if (score >= 40) {
      variant = "outline"; // Orangish
      text = `Fair: ${score}`;
    } else {
      variant = "destructive"; // Reddish
      text = `Needs Improvement: ${score}`;
    }
    return <Badge variant={variant} className="text-xs">{text}</Badge>;
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
        <div>
            <CardTitle className="text-2xl font-headline">Generated Code</CardTitle>
            <CardDescription>Review your code and AI insights.</CardDescription>
        </div>
        {activeTab === "code" && code && !isLoadingCode && (
          <div className="flex gap-2 mt-2 sm:mt-0">
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
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="code" className="hover:bg-accent/10 data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground tab-trigger-glow">
            <CheckCircle2 className="mr-2 h-4 w-4" /> Generated Code
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="hover:bg-accent/10 data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground tab-trigger-glow" disabled={!code && !isLoadingSuggestions}>
             <Lightbulb className="mr-2 h-4 w-4" /> AI Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="flex-grow overflow-hidden rounded-md border border-border/50 bg-muted/20">
          <ScrollArea className="h-[calc(100vh-18rem)] lg:h-[calc(100vh-24rem)] max-h-[600px] p-1"> {/* Adjusted height */}
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
              <div className="p-6 text-center text-muted-foreground">
                <p>Your generated Solidity code will appear here.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="suggestions" className="flex-grow overflow-hidden rounded-md border border-border/50 bg-muted/20">
          <ScrollArea className="h-[calc(100vh-18rem)] lg:h-[calc(100vh-24rem)] max-h-[600px] p-1"> {/* Adjusted height */}
            {isLoadingSuggestions ? (
               <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
              </div>
            ) : suggestions.length > 0 || securityScore !== null ? (
              <div className="p-4 space-y-4">
                {securityScore !== null && (
                  <div className="flex items-center justify-between p-3 bg-card rounded-md shadow">
                    <h3 className="text-base font-semibold">Security Score</h3>
                    {getSecurityScoreBadge(securityScore)}
                  </div>
                )}
                <Separator className="my-3"/>
                <h3 className="text-base font-semibold mb-2">AI Suggestions:</h3>
                <ul className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.id} className="flex items-start gap-2 p-3 bg-card/50 rounded-md text-sm">
                      <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-1" />
                      <span>{suggestion.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : code && !isLoadingCode ? (
                 <div className="p-6 text-center text-muted-foreground">
                    <p>No specific suggestions at this time, or click "Get AI Suggestions" after generating code.</p>
                 </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                <p>Generate code first, then click "Get AI Suggestions" to see analysis here.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
