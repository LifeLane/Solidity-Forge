
"use client";

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, ExternalLink, Lightbulb, Copy, Check, ShieldAlert, Zap, Wrench, Info, Fuel, Coins, Beaker, Sparkles, Loader2 } from 'lucide-react';
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
    let variant: BadgeProps["variant"] = "default";
    let text = `Security Score: ${score}`;
    if (score >= 80) {
      variant = "default"; 
      text = `Vault-Like: ${score}`;
    } else if (score >= 60) {
      variant = "secondary"; 
      text = `Respectably Robust: ${score}`;
    } else if (score >= 40) {
      variant = "outline"; 
      text = `Needs Patching: ${score}`;
    } else {
      variant = "destructive"; 
      text = `Dangerously Drafty: ${score}`;
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

  const customSyntaxHighlighterStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      backgroundColor: 'transparent', 
      margin: 0, 
      padding: '1rem', 
      fontSize: '0.875rem', 
      fontFamily: 'var(--font-code)', 
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
       fontFamily: 'var(--font-code)', 
    }
  };


  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-10 gap-4 text-center sm:text-left">
        <div>
            <CardTitle className="text-2xl font-headline p-2 rounded-md animate-multicolor-border-glow mb-2">The Alchemist's Output</CardTitle>
            <CardDescription className="p-2 rounded-md animate-multicolor-border-glow">Witness the digital alchemy! Your instructions, my execution. Mostly.</CardDescription>
        </div>
        {activeTab === "code" && code && !overallLoading && (
          <div className="flex gap-2 mt-2 sm:mt-0 self-center sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(code, "Code")} aria-label="Copy code" disabled={overallLoading}>
              {copiedStates['Code'] ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copiedStates['Code'] ? "Copied!" : "Snag Code"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeployToRemix} aria-label="Deploy to Remix" disabled={overallLoading}>
              Deploy to Remix <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
         {activeTab === "tests" && testCasesCode && !overallLoading && (
          <div className="flex gap-2 mt-2 sm:mt-0 self-center sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(testCasesCode, "Test Cases")} aria-label="Copy test cases" disabled={overallLoading}>
              {copiedStates['Test Cases'] ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copiedStates['Test Cases'] ? "Copied!" : "Grab Tests"}
            </Button>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="mb-8 grid w-full grid-cols-2 sm:grid-cols-4 animate-multicolor-border-glow gap-1 p-1">
          <TabsTrigger 
            value="code" 
            className={cn(
              "data-[state=active]:text-accent-foreground tab-running-lines-border rounded-sm",
              {"data-[state=active]:bg-accent/20": false} 
            )}
            disabled={overallLoading && activeTab !== "code"}
          >
            <span className="tab-running-lines-content flex items-center justify-center px-3 py-1.5">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Code
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="suggestions" 
            className={cn(
              "data-[state=active]:text-accent-foreground tab-running-lines-border rounded-sm",
              {"data-[state=active]:bg-accent/20": false} 
            )} 
            disabled={(!code && !isLoadingSuggestions) || overallLoading}
          >
            <span className="tab-running-lines-content flex items-center justify-center px-3 py-1.5">
              <Lightbulb className="mr-2 h-4 w-4" /> AI Suggestions
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="gas" 
            className={cn(
              "data-[state=active]:text-accent-foreground tab-running-lines-border rounded-sm",
              {"data-[state=active]:bg-accent/20": false} 
            )}
            disabled={(!code && !isLoadingGasEstimation) || overallLoading}
          >
            <span className="tab-running-lines-content flex items-center justify-center px-3 py-1.5">
              <Fuel className="mr-2 h-4 w-4" /> Gas
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="tests" 
            className={cn(
              "data-[state=active]:text-accent-foreground tab-running-lines-border rounded-sm",
              {"data-[state=active]:bg-accent/20": false} 
            )}
            disabled={(!code && !isLoadingTestCases) || overallLoading}
          >
            <span className="tab-running-lines-content flex items-center justify-center px-3 py-1.5">
             <Beaker className="mr-2 h-4 w-4" /> Tests
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="flex-grow flex flex-col overflow-hidden rounded-md border border-border/50 bg-muted/20 animate-multicolor-border-glow">
          <ScrollArea className="h-[calc(100vh-24rem)] lg:h-[calc(100vh-30rem)] max-h-[500px]">
            {isLoadingCode ? (
              <div className="p-4 space-y-3">
                {[...Array(7)].map((_, i) => <Skeleton key={i} className={`h-5 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-full' : 'w-5/6'}`} />)}
              </div>
            ) : code ? (
              <SyntaxHighlighter
                language="solidity"
                style={customSyntaxHighlighterStyle}
                showLineNumbers
                wrapLines
                wrapLongLines
              >
                {code}
              </SyntaxHighlighter>
            ) : (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <CheckCircle2 className="w-12 h-12 mb-4 text-muted-foreground/50" />
                <p>The codex awaits your command. Generate something, and it shall appear.</p>
              </div>
            )}
          </ScrollArea>
          {code && !isLoadingCode && (
            <div className="p-4 border-t border-border/50 bg-muted/30 mt-auto">
              <Label 
                htmlFor="refinementRequest" 
                className={cn(
                  "text-sm font-medium flex items-center justify-center gap-1.5 mb-2",
                  "p-2 rounded-md word-glow-active font-bold"
                  )}
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Decree Your Refinements:
              </Label>
              <Textarea
                id="refinementRequest"
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                placeholder="e.g., 'Infuse with NatSpec' or 'Make this transfer function less greedy on gas...'"
                rows={3}
                className="mb-2 bg-background/70 focus:bg-background placeholder:text-center p-2 rounded-md animate-multicolor-border-glow"
                disabled={overallLoading || anySubActionLoading}
              />
              <Button 
                onClick={handleRefineCodeSubmit} 
                disabled={overallLoading || anySubActionLoading || !refinementInput.trim()}
                className="w-full hover:shadow-lg hover:scale-105 transition-transform"
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

        <TabsContent value="suggestions" className="flex-grow overflow-hidden rounded-md border border-border/50 bg-muted/20 animate-multicolor-border-glow">
          <ScrollArea className="h-[calc(100vh-18rem)] lg:h-[calc(100vh-24rem)] max-h-[600px] p-1">
            {isLoadingSuggestions ? (
               <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className={`h-5 ${i % 2 === 0 ? 'w-3/4' : 'w-full'}`} />)}
              </div>
            ) : suggestions.length > 0 || securityScore !== null ? (
              <div className="p-6 space-y-6">
                {securityScore !== null && (
                  <div className="flex items-center justify-between p-3 bg-card rounded-md shadow mb-4 animate-multicolor-border-glow">
                    <h3 className="text-base font-semibold p-2 rounded-md animate-multicolor-border-glow">Overall Audit Readiness</h3>
                    {getSecurityScoreBadge(securityScore)}
                  </div>
                )}
                {suggestions.length > 0 && <Separator className="my-4"/>}
                {suggestions.length > 0 && <h3 className="text-base font-semibold mb-3 text-center p-2 rounded-md animate-multicolor-border-glow">My Auguries & Admonishments:</h3>}
                <ul className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.id} className="p-4 bg-card/50 rounded-md text-sm space-y-2 animate-multicolor-border-glow">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(suggestion.type)}
                        <Badge variant={getSeverityBadgeVariant(suggestion.severity)} className="capitalize">{suggestion.severity}</Badge>
                        <Badge variant="outline" className="capitalize">{suggestion.type.replace('_', ' ')}</Badge>
                      </div>
                      <p>{suggestion.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : code && !isLoadingCode && !overallLoading ? (
                 <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                    <Lightbulb className="w-12 h-12 mb-4 text-muted-foreground/50" />
                    <p>My analysis chamber is idle. Your code might be perfect (ha!), or you simply haven't requested my critique.</p>
                 </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                <p>Summon code first. My wisdom isn't wasted on the void.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="gas" className="flex-grow overflow-hidden rounded-md border border-border/50 bg-muted/20 animate-multicolor-border-glow">
          <ScrollArea className="h-[calc(100vh-18rem)] lg:h-[calc(100vh-24rem)] max-h-[600px] p-1">
            {isLoadingGasEstimation ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className={`h-5 ${i % 2 === 0 ? 'w-3/4' : 'w-full'}`} />)}
              </div>
            ) : gasEstimation ? (
              <div className="p-6 space-y-6">
                <div className="bg-card/50 rounded-md shadow-md animate-multicolor-border-glow">
                  <CardHeader className="p-4">
                    <CardTitle className="text-xl flex items-center gap-2 p-2 rounded-md animate-multicolor-border-glow mb-2"><Fuel className="w-5 h-5 text-primary"/>Gas Consumption Prophecies</CardTitle>
                  </CardHeader>
                  <ShadCNCardContent className="space-y-3 p-4 pt-0">
                    <div>
                      <h4 className="font-semibold text-base text-primary p-2 rounded-md animate-multicolor-border-glow mb-1">Probable Gas Appetite:</h4>
                      <p className="text-sm whitespace-pre-line ml-2">{gasEstimation.estimatedGasRange}</p>
                    </div>
                    <Separator className="my-3" />
                    <div>
                      <h4 className="font-semibold text-base text-primary p-2 rounded-md animate-multicolor-border-glow mb-1">Oracle's Rationale:</h4>
                      <p className="text-sm whitespace-pre-line ml-2">{gasEstimation.explanation}</p>
                    </div>
                  </ShadCNCardContent>
                </div>
              </div>
            ) : code && !isLoadingCode && !overallLoading ? (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <Fuel className="w-12 h-12 mb-4 text-muted-foreground/50" />
                <p>Pondering the price of computation? Dare to 'Query Gas Oracle'.</p>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                <p>To estimate costs, one needs code. A novel concept, I know.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tests" className="flex-grow overflow-hidden rounded-md border border-border/50 bg-muted/20 animate-multicolor-border-glow">
          <ScrollArea className="h-[calc(100vh-18rem)] lg:h-[calc(100vh-24rem)] max-h-[600px]">
            {isLoadingTestCases ? (
              <div className="p-4 space-y-3">
                {[...Array(7)].map((_, i) => <Skeleton key={i} className={`h-5 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-full' : 'w-5/6'}`} />)}
              </div>
            ) : testCasesCode ? (
              <SyntaxHighlighter
                language="javascript"
                style={customSyntaxHighlighterStyle}
                showLineNumbers
                wrapLines
                wrapLongLines
              >
                {testCasesCode}
              </SyntaxHighlighter>
            ) : code && !isLoadingCode && !overallLoading ? (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <Beaker className="w-12 h-12 mb-4 text-muted-foreground/50" />
                <p>Yearning for test structures? 'Conjure Test Suite' and witness... basic tests.</p>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                <p>Testing the ether? Materialize some code first, then we'll talk tests.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
