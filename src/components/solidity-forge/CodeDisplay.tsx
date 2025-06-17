
"use client";

import React, { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Lightbulb, Copy, Check, ShieldAlert, Zap, Wrench, Info, Fuel, Coins, Beaker, Sparkles, Loader2, Code2, Brain, FileText as FileTextIconLucide } from 'lucide-react';
import { CardTitle, CardDescription, CardHeader, CardContent as ShadCNCardContent } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import type { EstimateGasCostOutput } from '@/ai/flows/estimate-gas-cost';
import { cn } from '@/lib/utils';
import type { ContractTemplate } from '@/config/contracts';

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
  isLoadingCode: boolean; // Indicates primary code generation/refinement/docgen is happening
  isLoadingSuggestions: boolean;
  isLoadingGasEstimation: boolean;
  isLoadingTestCases: boolean;
  isRefiningCode: boolean; // Specific loading for refinement action
  isGeneratingDocumentation: boolean; // Specific loading for docgen action
  onRefineCode: (request: string) => Promise<void>;
  selectedTemplate?: ContractTemplate; 
  anySubActionLoading: boolean; // True if any analysis action is loading
  onGetAISuggestions: () => Promise<void>;
  onEstimateGasCosts: () => Promise<void>;
  onGenerateTestCases: () => Promise<void>;
  onGenerateDocumentation: () => Promise<void>;
}

export function CodeDisplay({
  code,
  suggestions,
  securityScore,
  gasEstimation,
  testCasesCode,
  isLoadingCode, // This prop is true if initial generation, refinement, or doc gen is happening
  isLoadingSuggestions,
  isLoadingGasEstimation,
  isLoadingTestCases,
  isRefiningCode, // Specific state for refinement button
  isGeneratingDocumentation, // Specific state for documentation button
  onRefineCode,
  selectedTemplate,
  anySubActionLoading,
  onGetAISuggestions,
  onEstimateGasCosts,
  onGenerateTestCases,
  onGenerateDocumentation,
}: CodeDisplayProps) {
  const [activeTab, setActiveTab] = useState("code");
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [refinementInput, setRefinementInput] = useState<string>('');
  const { toast } = useToast();

  // Overall loading state for the primary code display area (generation, refinement, doc generation)
  const isPrimaryCodeActionLoading = isLoadingCode || isRefiningCode || isGeneratingDocumentation;


  const handleCopyToClipboard = useCallback((textToCopy: string, type: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      toast({ title: `${type} Copied!`, description: `My digital minions have placed the ${type.toLowerCase()} onto your clipboard. Don't lose it.` });
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [type]: false })), 2000);
    }).catch(err => {
      console.error(`Failed to copy ${type}: `, err);
      toast({ variant: "destructive", title: "Copy Catastrophe!", description: `Could not copy ${type}. Your clipboard must be full of... other things.` });
    });
  }, [toast]);

  const handleDeployToRemix = useCallback(() => {
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
  }, [code, toast]);

  const handleRefineCodeSubmit = useCallback(async () => {
    if (!refinementInput.trim()) {
      toast({ variant: "destructive", title: "Empty Request", description: "You want me to refine... nothing? Give me something to work with!" });
      return;
    }
    await onRefineCode(refinementInput);
    setRefinementInput(''); 
  }, [refinementInput, onRefineCode, toast]);

  const getSecurityScoreBadge = (score: number | null) => {
    if (score === null) return null;
    let variant: BadgeProps["variant"] = "default"; 
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
    return <Badge variant={variant} className="text-sm px-3 py-1.5">{text}</Badge>;
  };

  const getSeverityBadgeVariant = (severity: AISuggestionSeverity): BadgeProps["variant"] => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default'; 
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
        return <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />;
      case 'optimization':
        return <Zap className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />; 
      case 'gas_saving':
        return <Coins className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />;
      case 'best_practice':
        return <Wrench className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />;
      case 'informational':
        return <Info className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />;
      default:
        return <Lightbulb className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />; 
    }
  };

  const customSyntaxHighlighterStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      backgroundColor: 'transparent', 
      margin: 0, 
      padding: '1rem 1.5rem',
      fontSize: '0.9rem', 
      fontFamily: 'var(--font-code)', 
      lineHeight: '1.7',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
       fontFamily: 'var(--font-code)', 
    }
  };
  
  // If initial code generation is happening, show a specific loader.
  if (isLoadingCode && !code && !isRefiningCode && !isGeneratingDocumentation) {
    return (
      <div className="flex flex-col h-full p-4 md:p-6 lg:p-8 items-center justify-center text-center min-h-[400px]">
        <Loader2 className="w-16 h-16 mb-6 text-primary animate-spin" />
        <p className="text-xl font-semibold text-muted-foreground">The Alchemist is Forging...</p>
        <p className="text-base text-muted-foreground">Your digital masterpiece is moments away.</p>
      </div>
    );
  }
  
  // If no code is generated yet, show placeholder (this case is mostly handled by conditional rendering in page.tsx)
  if (!code && !isLoadingCode) {
     return (
      <div className="flex flex-col h-full p-4 md:p-6 lg:p-8 items-center justify-center text-center min-h-[400px]">
        <Code2 className="w-20 h-20 mb-8 text-muted-foreground/30" />
        <p className="text-xl font-semibold text-muted-foreground">The Codex Awaits Your Command</p>
        <p className="text-base text-muted-foreground">Use the "Forge Contract" button above to generate your smart contract. The Alchemist's output will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 text-center sm:text-left">
        <div>
            <CardTitle className="text-3xl font-headline text-glow-primary mb-2">The Alchemist's Output</CardTitle>
            <CardDescription className="text-base text-muted-foreground">Witness the digital alchemy! Your instructions, my execution. Mostly.</CardDescription>
        </div>
        {activeTab === "code" && code && !isPrimaryCodeActionLoading && (
          <div className="flex gap-3 mt-2 sm:mt-0 self-center sm:self-auto">
            <Button variant="outline" size="lg" onClick={() => handleCopyToClipboard(code, "Code")} aria-label="Copy code" disabled={isPrimaryCodeActionLoading} className="glow-border-purple text-base py-3 px-5">
              {copiedStates['Code'] ? <Check className="h-5 w-5 mr-2" /> : <Copy className="h-5 w-5 mr-2" />}
              {copiedStates['Code'] ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" size="lg" onClick={handleDeployToRemix} aria-label="Deploy to Remix" disabled={isPrimaryCodeActionLoading} className="glow-border-purple text-base py-3 px-5">
              Remix <ExternalLink className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}
         {activeTab === "tests" && testCasesCode && !isPrimaryCodeActionLoading && (
          <div className="flex gap-3 mt-2 sm:mt-0 self-center sm:self-auto">
            <Button variant="outline" size="lg" onClick={() => handleCopyToClipboard(testCasesCode, "Test Cases")} aria-label="Copy test cases" disabled={isPrimaryCodeActionLoading} className="glow-border-purple text-base py-3 px-5">
              {copiedStates['Test Cases'] ? <Check className="h-5 w-5 mr-2" /> : <Copy className="h-5 w-5 mr-2" />}
              {copiedStates['Test Cases'] ? "Copied Tests" : "Copy Tests"}
            </Button>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col min-h-0">
        <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-lg bg-card/30 border border-border/20">
          {[
            { value: "code", label: "Code", icon: Code2 },
            { value: "suggestions", label: "AI Insights", icon: Lightbulb },
            { value: "gas", label: "Gas Oracle", icon: Fuel },
            { value: "tests", label: "Test Cases", icon: Beaker },
          ].map(tabItem => (
            <TabsTrigger 
              key={tabItem.value}
              value={tabItem.value} 
              className={cn(
                "tab-running-lines-border",
                "data-[state=active]:text-primary-foreground",
                "data-[state=inactive]:text-muted-foreground hover:text-foreground"
              )}
              disabled={
                (tabItem.value === "code" && isPrimaryCodeActionLoading) || 
                (tabItem.value === "suggestions" && (isLoadingSuggestions || isPrimaryCodeActionLoading)) ||
                (tabItem.value === "gas" && (isLoadingGasEstimation || isPrimaryCodeActionLoading)) ||
                (tabItem.value === "tests" && (isLoadingTestCases || isPrimaryCodeActionLoading)) ||
                (tabItem.value !== "code" && isPrimaryCodeActionLoading) 
              }
            >
              <span className="tab-running-lines-content flex items-center justify-center gap-2 px-3 py-2.5 text-sm md:text-base">
                <tabItem.icon className="h-5 w-5" /> {tabItem.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="code" className="flex-grow flex flex-col overflow-hidden rounded-lg border bg-muted/20 glow-border-yellow">
          <ScrollArea className="flex-grow">
            {isPrimaryCodeActionLoading ? ( 
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-center h-48">
                   <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
                {[...Array(8)].map((_, i) => <Skeleton key={i} className={`h-5 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-full' : 'w-5/6'} bg-muted/50`} />)}
              </div>
            ) : ( 
              <SyntaxHighlighter
                language="solidity"
                style={customSyntaxHighlighterStyle}
                showLineNumbers
                lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem' }}
                wrapLines
                wrapLongLines
              >
                {code}
              </SyntaxHighlighter>
            )}
          </ScrollArea>
          {/* Refinement Section within Code Tab */}
          <div className="p-4 md:p-6 border-t border-border/30 bg-card/50 mt-auto">
            <Label 
              htmlFor="refinementRequest" 
              className="text-base font-bold flex items-center justify-center gap-2 mb-3 text-glow-primary"
            >
              <Sparkles className="h-5 w-5" />
              Decree Your Refinements:
            </Label>
            <Textarea
              id="refinementRequest"
              value={refinementInput}
              onChange={(e) => setRefinementInput(e.target.value)}
              placeholder="e.g., 'Add NatSpec comments to all public functions and state variables.'"
              rows={3}
              className="mb-3 bg-background/70 focus:bg-background glow-border-purple text-base p-3"
              disabled={isPrimaryCodeActionLoading || anySubActionLoading}
            />
            <Button 
              onClick={handleRefineCodeSubmit} 
              disabled={isPrimaryCodeActionLoading || anySubActionLoading || !refinementInput.trim()}
              className="w-full glow-border-primary bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-3"
            >
              {isRefiningCode ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Execute Refinement
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="flex-grow flex flex-col overflow-hidden rounded-lg border bg-muted/20 glow-border-yellow">
          <ScrollArea className="h-full flex-grow p-1">
            {isLoadingSuggestions ? (
               <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className={`h-16 ${i % 2 === 0 ? 'w-3/4' : 'w-full'} bg-muted/50`} />)}
              </div>
            ) : suggestions.length > 0 || securityScore !== null ? (
              <div className="p-4 md:p-6 space-y-5">
                {securityScore !== null && (
                  <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg shadow-md mb-6 border border-border/30">
                    <h3 className="text-lg font-semibold text-glow-primary">Overall Audit Readiness</h3>
                    {getSecurityScoreBadge(securityScore)}
                  </div>
                )}
                {suggestions.length > 0 && <Separator className="my-5 bg-border/30"/>}
                {suggestions.length > 0 && <h3 className="text-lg font-semibold mb-4 text-center text-glow-primary">My Auguries & Admonishments:</h3>}
                <ul className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.id} className="p-4 bg-card/50 rounded-lg text-base space-y-2 border border-border/30 shadow-md">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        {getTypeIcon(suggestion.type)}
                        <Badge variant={getSeverityBadgeVariant(suggestion.severity)} className="capitalize px-2.5 py-1 text-xs">{suggestion.severity}</Badge>
                        <Badge variant="outline" className="capitalize px-2.5 py-1 text-xs">{suggestion.type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{suggestion.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
                 <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[250px]">
                    <Lightbulb className="w-16 h-16 mb-6 text-muted-foreground/50" />
                    <p className="text-base">My analysis chamber is idle. Your code might be perfect (ha!), or you simply haven't requested my critique using the "AI Scrutiny" button below.</p>
                 </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="gas" className="flex-grow flex flex-col overflow-hidden rounded-lg border bg-muted/20 glow-border-yellow">
          <ScrollArea className="h-full flex-grow p-1">
            {isLoadingGasEstimation ? (
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className={`h-20 ${i % 2 === 0 ? 'w-3/4' : 'w-full'} bg-muted/50`} />)}
              </div>
            ) : gasEstimation ? (
              <div className="p-4 md:p-6 space-y-5">
                <div className="bg-card/50 rounded-lg shadow-md border border-border/30">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-2xl flex items-center gap-2.5 text-glow-primary"><Fuel className="w-6 h-6"/>Gas Consumption Prophecies</CardTitle>
                  </CardHeader>
                  <ShadCNCardContent className="space-y-4 p-4 pt-2">
                    <div>
                      <h4 className="font-semibold text-lg text-primary mb-1.5">Probable Gas Appetite:</h4>
                      <p className="text-base whitespace-pre-line ml-2 text-muted-foreground">{gasEstimation.estimatedGasRange}</p>
                    </div>
                    <Separator className="my-4 bg-border/30" />
                    <div>
                      <h4 className="font-semibold text-lg text-primary mb-1.5">Oracle's Rationale:</h4>
                      <p className="text-base whitespace-pre-line ml-2 text-muted-foreground">{gasEstimation.explanation}</p>
                    </div>
                  </ShadCNCardContent>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[250px]">
                <Fuel className="w-16 h-16 mb-6 text-muted-foreground/50" />
                <p className="text-base">Pondering the price of computation? Dare to 'Query Gas Oracle' using the button below.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tests" className="flex-grow flex flex-col overflow-hidden rounded-lg border bg-muted/20 glow-border-yellow">
          <ScrollArea className="h-full flex-grow">
            {isLoadingTestCases ? (
              <div className="p-6 space-y-3">
                 <div className="flex items-center justify-center h-48">
                   <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
                {[...Array(8)].map((_, i) => <Skeleton key={i} className={`h-5 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-full' : 'w-5/6'} bg-muted/50`} />)}
              </div>
            ) : testCasesCode ? (
              <SyntaxHighlighter
                language="javascript"
                style={customSyntaxHighlighterStyle}
                showLineNumbers
                lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem' }}
                wrapLines
                wrapLongLines
              >
                {testCasesCode}
              </SyntaxHighlighter>
            ) : (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[250px]">
                <Beaker className="w-16 h-16 mb-6 text-muted-foreground/50" />
                <p className="text-base">Yearning for test structures? 'Conjure Test Suite' using the button below and witness... basic tests.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Analysis Action Buttons */}
      {code && !isPrimaryCodeActionLoading && (
         <div className="pt-6 mt-4 space-y-4 border-t border-border/30">
          <h3 className="text-center text-lg font-semibold mb-2">
            <span className="animate-text-multicolor-glow">Post-Forge Analysis & Augmentation</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 px-1 pb-1">
            <Button
              type="button"
              variant="outline"
              onClick={onGetAISuggestions}
              disabled={anySubActionLoading || isPrimaryCodeActionLoading || !selectedTemplate}
              className="w-full glow-border-purple hover:bg-accent/10 hover:text-accent-foreground text-base py-4"
            >
              {isLoadingSuggestions ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                  <Brain className="mr-2 h-5 w-5" />
              )}
              AI Scrutiny
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onEstimateGasCosts}
              disabled={anySubActionLoading || isPrimaryCodeActionLoading}
              className="w-full glow-border-purple hover:bg-accent/10 hover:text-accent-foreground text-base py-4"
            >
              {isLoadingGasEstimation ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                  <Fuel className="mr-2 h-5 w-5" />
              )}
              Query Gas Oracle
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onGenerateTestCases}
              disabled={anySubActionLoading || isPrimaryCodeActionLoading}
              className="w-full glow-border-purple hover:bg-accent/10 hover:text-accent-foreground text-base py-4"
            >
              {isLoadingTestCases ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                  <Beaker className="mr-2 h-5 w-5" />
                )}
              Conjure Test Suite
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onGenerateDocumentation}
              disabled={anySubActionLoading || isPrimaryCodeActionLoading || isGeneratingDocumentation} // Added specific disabled state for doc gen
              className="w-full glow-border-purple hover:bg-accent/10 hover:text-accent-foreground text-base py-4"
            >
              {isGeneratingDocumentation ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                  <FileTextIconLucide className="mr-2 h-5 w-5" />
              )}
              Scribe Docs
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
    
