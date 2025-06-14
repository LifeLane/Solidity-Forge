
"use client";

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Lightbulb, Copy, Check, ShieldAlert, Zap, Wrench, Info, Fuel, Coins, Beaker, Sparkles, Loader2, Code2 } from 'lucide-react'; // Added Code2
import { CardTitle, CardDescription, CardHeader, CardContent as ShadCNCardContent } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import type { EstimateGasCostOutput } from '@/ai/flows/estimate-gas-cost';
import { cn } from '@/lib/utils';


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
  testCasesCode: string;
  isLoadingCode: boolean;
  isLoadingSuggestions: boolean;
  isLoadingGasEstimation: boolean;
  isLoadingTestCases: boolean;
  isRefiningCode: boolean;
  onRefineCode: (request: string) => Promise<void>;
  selectedTemplateName?: string;
  anySubActionLoading: boolean;
}

export function CodeDisplay({
  code,
  suggestions,
  securityScore,
  gasEstimation,
  testCasesCode,
  isLoadingCode,
  isLoadingSuggestions,
  isLoadingGasEstimation,
  isLoadingTestCases,
  isRefiningCode,
  onRefineCode,
  selectedTemplateName,
  anySubActionLoading,
}: CodeDisplayProps) {
  const [activeTab, setActiveTab] = useState("code");
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [refinementInput, setRefinementInput] = useState<string>('');
  const { toast } = useToast();

  const overallLoading = isLoadingCode || isRefiningCode;

  const handleCopyToClipboard = (textToCopy: string, type: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      toast({ title: `${type} Copied!`, description: `My digital minions have placed the ${type.toLowerCase()} onto your clipboard. Don't lose it.` });
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [type]: false })), 2000);
    }).catch(err => {
      console.error(`Failed to copy ${type}: `, err);
      toast({ variant: "destructive", title: "Copy Catastrophe!", description: `Could not copy ${type}. Your clipboard must be full of... other things.` });
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
            title: "Remix Link Hiccup",
            description: "Sent to Remix, but some exotic characters might be on vacation. Standard encoding used as a backup.",
        });
    }
  };

  const handleRefineCodeSubmit = async () => {
    if (!refinementInput.trim()) {
      toast({ variant: "destructive", title: "Empty Request", description: "You want me to refine... nothing? Give me something to work with!" });
      return;
    }
    await onRefineCode(refinementInput);
    setRefinementInput('');
  };

  const getSecurityScoreBadge = (score: number | null) => {
    if (score === null) return null;
    let variant: BadgeProps["variant"] = "default"; // Corresponds to primary
    let text = `Audit Readiness: ${score}`;
     if (score >= 90) {
      variant = "default"; 
      text = `Fort Knox Level: ${score}`;
    } else if (score >= 70) {
      variant = "secondary"; 
      text = `Solidly Secure: ${score}`;
    } else if (score >= 50) {
      variant = "outline"; 
      text = `Needs Work: ${score}`;
    } else {
      variant = "destructive"; 
      text = `Warning Bells: ${score}`;
    }
    return <Badge variant={variant} className="text-xs px-2 py-1">{text}</Badge>;
  };

  const getSeverityBadgeVariant = (severity: AISuggestionSeverity): BadgeProps["variant"] => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default'; // using primary for medium as it's often an important actionable item
      case 'low':
        return 'secondary'; 
      case 'info':
      default:
        return 'outline';
    }
  };
  
  const getTypeIcon = (type: AISuggestionType) => {
    switch (type) {
      case 'security':
        return <ShieldAlert className="h-4 w-4 text-destructive shrink-0 mt-0.5" />;
      case 'optimization':
        return <Zap className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />; // Brighter blue
      case 'gas_saving':
        return <Coins className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />; // Brighter yellow
      case 'best_practice':
        return <Wrench className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />; // Brighter green
      case 'informational':
        return <Info className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />;
      default:
        return <Lightbulb className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />; // Purple for default
    }
  };

  const customSyntaxHighlighterStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      backgroundColor: 'transparent', // Show parent's bg
      margin: 0, 
      padding: '1rem', 
      fontSize: '0.875rem', 
      fontFamily: 'var(--font-code)', 
      lineHeight: '1.6',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
       fontFamily: 'var(--font-code)', 
    }
  };


  return (
    <div className="flex flex-col h-full p-4 md:p-6 lg:p-8"> {/* Added lg:p-8 */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 text-center sm:text-left">
        <div>
            <CardTitle className="text-2xl font-headline text-glow-primary mb-1">The Alchemist's Output</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Witness the digital alchemy! Your instructions, my execution. Mostly.</CardDescription>
        </div>
        {activeTab === "code" && code && !overallLoading && (
          <div className="flex gap-2 mt-2 sm:mt-0 self-center sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(code, "Code")} aria-label="Copy code" disabled={overallLoading} className="glow-border-purple">
              {copiedStates['Code'] ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {copiedStates['Code'] ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeployToRemix} aria-label="Deploy to Remix" disabled={overallLoading} className="glow-border-purple">
              Remix <ExternalLink className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        )}
         {activeTab === "tests" && testCasesCode && !overallLoading && (
          <div className="flex gap-2 mt-2 sm:mt-0 self-center sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(testCasesCode, "Test Cases")} aria-label="Copy test cases" disabled={overallLoading} className="glow-border-purple">
              {copiedStates['Test Cases'] ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {copiedStates['Test Cases'] ? "Copied" : "Copy Tests"}
            </Button>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-md glow-border-accent bg-card/50">
          <TabsTrigger 
            value="code" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted/30 data-[state=inactive]:text-muted-foreground hover:bg-primary/80"
            disabled={overallLoading && activeTab !== "code"}
          >
            <Code2 className="mr-1.5 h-4 w-4" /> Code
          </TabsTrigger>
          <TabsTrigger 
            value="suggestions" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted/30 data-[state=inactive]:text-muted-foreground hover:bg-primary/80"
            disabled={(!code && !isLoadingSuggestions) || overallLoading}
          >
            <Lightbulb className="mr-1.5 h-4 w-4" /> AI Insights
          </TabsTrigger>
          <TabsTrigger 
            value="gas" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted/30 data-[state=inactive]:text-muted-foreground hover:bg-primary/80"
            disabled={(!code && !isLoadingGasEstimation) || overallLoading}
          >
            <Fuel className="mr-1.5 h-4 w-4" /> Gas Oracle
          </TabsTrigger>
          <TabsTrigger 
            value="tests" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted/30 data-[state=inactive]:text-muted-foreground hover:bg-primary/80"
            disabled={(!code && !isLoadingTestCases) || overallLoading}
          >
             <Beaker className="mr-1.5 h-4 w-4" /> Test Cases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="flex-grow flex flex-col overflow-hidden rounded-md border bg-muted/20 glow-border-yellow">
          <ScrollArea className="flex-grow">
            {isLoadingCode ? (
              <div className="p-4 space-y-2">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-full' : 'w-5/6'} bg-muted/50`} />)}
              </div>
            ) : code ? (
              <SyntaxHighlighter
                language="solidity"
                style={customSyntaxHighlighterStyle}
                showLineNumbers
                lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}
                wrapLines
                wrapLongLines
              >
                {code}
              </SyntaxHighlighter>
            ) : (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]">
                <Code2 className="w-12 h-12 mb-4 text-muted-foreground/50" />
                <p className="text-sm">The codex awaits your command. Generate something, and it shall appear.</p>
              </div>
            )}
          </ScrollArea>
          {code && !isLoadingCode && (
            <div className="p-4 border-t border-border/30 bg-card/50 mt-auto">
              <Label 
                htmlFor="refinementRequest" 
                className="text-sm font-medium flex items-center justify-center gap-1.5 mb-2 text-glow-primary"
              >
                <Sparkles className="h-4 w-4" />
                Decree Your Refinements:
              </Label>
              <Textarea
                id="refinementRequest"
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                placeholder="e.g., 'Add NatSpec comments to all public functions and state variables.'"
                rows={3}
                className="mb-2 bg-background/70 focus:bg-background glow-border-purple"
                disabled={overallLoading || anySubActionLoading}
              />
              <Button 
                onClick={handleRefineCodeSubmit} 
                disabled={overallLoading || anySubActionLoading || !refinementInput.trim()}
                className="w-full glow-border-primary bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isRefiningCode ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Execute Refinement
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="flex-grow overflow-hidden rounded-md border bg-muted/20 glow-border-yellow">
          <ScrollArea className="h-full max-h-[calc(100vh-22rem)] p-1"> {/* Adjusted max-h */}
            {isLoadingSuggestions ? (
               <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className={`h-12 ${i % 2 === 0 ? 'w-3/4' : 'w-full'} bg-muted/50`} />)}
              </div>
            ) : suggestions.length > 0 || securityScore !== null ? (
              <div className="p-4 md:p-6 space-y-4">
                {securityScore !== null && (
                  <div className="flex items-center justify-between p-3 bg-card/50 rounded-md shadow mb-4 border border-border/30">
                    <h3 className="text-base font-semibold text-glow-primary">Overall Audit Readiness</h3>
                    {getSecurityScoreBadge(securityScore)}
                  </div>
                )}
                {suggestions.length > 0 && <Separator className="my-4 bg-border/30"/>}
                {suggestions.length > 0 && <h3 className="text-base font-semibold mb-3 text-center text-glow-primary">My Auguries & Admonishments:</h3>}
                <ul className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.id} className="p-3 bg-card/50 rounded-md text-sm space-y-1.5 border border-border/30">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {getTypeIcon(suggestion.type)}
                        <Badge variant={getSeverityBadgeVariant(suggestion.severity)} className="capitalize px-2 py-0.5 text-xs">{suggestion.severity}</Badge>
                        <Badge variant="outline" className="capitalize px-2 py-0.5 text-xs">{suggestion.type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{suggestion.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : code && !isLoadingCode && !overallLoading ? (
                 <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]">
                    <Lightbulb className="w-12 h-12 mb-4 text-muted-foreground/50" />
                    <p className="text-sm">My analysis chamber is idle. Your code might be perfect (ha!), or you simply haven't requested my critique.</p>
                 </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]">
                <Lightbulb className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" /> {/* Changed Icon */}
                <p className="text-sm">Summon code first. My wisdom isn't wasted on the void.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="gas" className="flex-grow overflow-hidden rounded-md border bg-muted/20 glow-border-yellow">
          <ScrollArea className="h-full max-h-[calc(100vh-22rem)] p-1">
            {isLoadingGasEstimation ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className={`h-16 ${i % 2 === 0 ? 'w-3/4' : 'w-full'} bg-muted/50`} />)}
              </div>
            ) : gasEstimation ? (
              <div className="p-4 md:p-6 space-y-4">
                <div className="bg-card/50 rounded-md shadow border border-border/30">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xl flex items-center gap-2 text-glow-primary"><Fuel className="w-5 h-5"/>Gas Consumption Prophecies</CardTitle>
                  </CardHeader>
                  <ShadCNCardContent className="space-y-3 p-4 pt-2">
                    <div>
                      <h4 className="font-semibold text-base text-primary mb-1">Probable Gas Appetite:</h4>
                      <p className="text-sm whitespace-pre-line ml-2 text-muted-foreground">{gasEstimation.estimatedGasRange}</p>
                    </div>
                    <Separator className="my-3 bg-border/30" />
                    <div>
                      <h4 className="font-semibold text-base text-primary mb-1">Oracle's Rationale:</h4>
                      <p className="text-sm whitespace-pre-line ml-2 text-muted-foreground">{gasEstimation.explanation}</p>
                    </div>
                  </ShadCNCardContent>
                </div>
              </div>
            ) : code && !isLoadingCode && !overallLoading ? (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]">
                <Fuel className="w-12 h-12 mb-4 text-muted-foreground/50" />
                <p className="text-sm">Pondering the price of computation? Dare to 'Query Gas Oracle'.</p>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]">
                <Fuel className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" /> {/* Changed Icon */}
                <p className="text-sm">To estimate costs, one needs code. A novel concept, I know.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tests" className="flex-grow overflow-hidden rounded-md border bg-muted/20 glow-border-yellow">
          <ScrollArea className="h-full max-h-[calc(100vh-22rem)]">
            {isLoadingTestCases ? (
              <div className="p-4 space-y-2">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-full' : 'w-5/6'} bg-muted/50`} />)}
              </div>
            ) : testCasesCode ? (
              <SyntaxHighlighter
                language="javascript"
                style={customSyntaxHighlighterStyle}
                showLineNumbers
                lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}
                wrapLines
                wrapLongLines
              >
                {testCasesCode}
              </SyntaxHighlighter>
            ) : code && !isLoadingCode && !overallLoading ? (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]">
                <Beaker className="w-12 h-12 mb-4 text-muted-foreground/50" />
                <p className="text-sm">Yearning for test structures? 'Conjure Test Suite' and witness... basic tests.</p>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]">
                <Beaker className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" /> {/* Changed Icon */}
                <p className="text-sm">Testing the ether? Materialize some code first, then we'll talk tests.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    