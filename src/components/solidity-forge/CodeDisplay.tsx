
"use client";

import React, { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Lightbulb, Copy, Check, ShieldAlert, Zap, Wrench, Info, Fuel, Coins, Beaker, Sparkles, Loader2, Code2, Brain, FileText as FileTextIconLucide, AlertCircle } from 'lucide-react';
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
  isLoadingCode: boolean;
  isLoadingSuggestions: boolean;
  isLoadingGasEstimation: boolean;
  isLoadingTestCases: boolean;
  isRefiningCode: boolean;
  isGeneratingDocumentation: boolean;
  onRefineCode: (request: string) => Promise<void>;
  selectedTemplate?: ContractTemplate; 
  anySubActionLoading: boolean;
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
  isLoadingCode,
  isLoadingSuggestions,
  isLoadingGasEstimation,
  isLoadingTestCases,
  isRefiningCode,
  isGeneratingDocumentation,
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

  const isPrimaryCodeActionLoading = isLoadingCode || isRefiningCode || isGeneratingDocumentation;

  const handleCopyToClipboard = useCallback((textToCopy: string, type: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      toast({ title: `${type} Copied!`, description: `${type} copied to clipboard.` });
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [type]: false })), 2000);
    }).catch(err => {
      console.error(`Failed to copy ${type}: `, err);
      toast({ variant: "destructive", title: "Copy Failed!", description: `Could not copy ${type}.` });
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
            title: "Remix Link Error",
            description: "Standard encoding used as backup.",
        });
    }
  }, [code, toast]);

  const handleRefineCodeSubmit = useCallback(async () => {
    if (!refinementInput.trim()) {
      toast({ variant: "destructive", title: "Empty Request", description: "Provide instructions to refine the code." });
      return;
    }
    await onRefineCode(refinementInput);
    setRefinementInput(''); 
  }, [refinementInput, onRefineCode, toast]);

  const getSecurityScoreBadge = (score: number | null) => {
    if (score === null) return null;
    let variant: BadgeProps["variant"] = "default"; 
    let text = `Audit Readiness: ${score}`;
     if (score >= 90) { variant = "default"; text = `Excellent: ${score}`; } // Green (using default as primary)
     else if (score >= 70) { variant = "secondary"; text = `Good: ${score}`; } // Yellow (using secondary)
     else if (score >= 50) { variant = "outline"; text = `Fair: ${score}`; } // Orange (using outline)
     else { variant = "destructive"; text = `Needs Review: ${score}`; } // Red
    return <Badge variant={variant} className="text-xs px-2 py-1">{text}</Badge>;
  };

  const getSeverityBadgeVariant = (severity: AISuggestionSeverity): BadgeProps["variant"] => {
    switch (severity) {
      case 'critical': case 'high': return 'destructive';
      case 'medium': return 'default'; 
      case 'low': return 'secondary'; 
      case 'info': default: return 'outline';
    }
  };
  
  const getTypeIcon = (type: AISuggestionType) => {
    const iconProps = { className: "h-4 w-4 shrink-0 mt-0.5" };
    switch (type) {
      case 'security': return <ShieldAlert {...iconProps} color="hsl(var(--destructive))" />;
      case 'optimization': return <Zap {...iconProps} color="hsl(var(--chart-1))" />; 
      case 'gas_saving': return <Coins {...iconProps} color="hsl(var(--chart-4))" />;
      case 'best_practice': return <Wrench {...iconProps} color="hsl(var(--chart-2))" />;
      case 'informational': return <Info {...iconProps} color="hsl(var(--muted-foreground))" />;
      default: return <Lightbulb {...iconProps} color="hsl(var(--primary))" />; 
    }
  };

  const customSyntaxHighlighterStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      backgroundColor: 'hsl(var(--muted)/0.3)', 
      margin: 0, 
      padding: '0.75rem 1rem', 
      fontSize: '0.85rem', 
      fontFamily: 'var(--font-code)', 
      lineHeight: '1.6',
      borderRadius: 'var(--radius)',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
       fontFamily: 'var(--font-code)', 
    }
  };
  
  if (isLoadingCode && !code && !isRefiningCode && !isGeneratingDocumentation) { // Initial loading for the entire component
    return (
      <div className="flex flex-col h-full p-4 md:p-6 items-center justify-center text-center min-h-[300px]">
        <Loader2 className="w-12 h-12 mb-4 text-primary animate-spin" />
        <p className="text-lg font-medium text-muted-foreground">Forging Your Contract...</p>
        <p className="text-sm text-muted-foreground">The Alchemist is hard at work.</p>
      </div>
    );
  }
  
  if (!code && !isLoadingCode) { // Placeholder if no code is generated yet
    return (
         <div className="flex flex-col h-full p-6 md:p-8 items-center justify-center text-center min-h-[300px]">
            <Code2 className="w-16 h-16 mb-6 text-muted-foreground/30" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">The Alchemist's Output</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
            Your generated smart contract code, along with AI-powered analysis and tools, will appear here once you configure and forge your contract.
            </p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-3 md:p-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2 text-center sm:text-left">
        <div>
            <CardTitle className="text-base md:text-lg font-semibold text-foreground">The Alchemist's Output</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">Review, refine, and analyze your smart contract.</CardDescription>
        </div>
        {activeTab === "code" && code && !isPrimaryCodeActionLoading && (
          <div className="flex gap-2 mt-2 sm:mt-0 self-center sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(code, "Code")} aria-label="Copy code" disabled={isPrimaryCodeActionLoading} className="h-8 text-xs px-2.5">
              {copiedStates['Code'] ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copiedStates['Code'] ? "Copied" : "Copy Code"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeployToRemix} aria-label="Deploy to Remix" disabled={isPrimaryCodeActionLoading} className="h-8 text-xs px-2.5">
              Deploy to Remix <ExternalLink className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        )}
         {activeTab === "tests" && testCasesCode && !isPrimaryCodeActionLoading && (
          <div className="flex gap-2 mt-2 sm:mt-0 self-center sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(testCasesCode, "Test Cases")} aria-label="Copy test cases" disabled={isPrimaryCodeActionLoading} className="h-8 text-xs px-2.5">
              {copiedStates['Test Cases'] ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copiedStates['Test Cases'] ? "Copied" : "Copy Tests"}
            </Button>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col min-h-0">
        <TabsList className="mb-2.5 grid w-full grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-md bg-muted h-auto">
          {[
            { value: "code", label: "Contract Code", icon: Code2 },
            { value: "suggestions", label: "AI Insights", icon: Brain },
            { value: "gas", label: "Gas Oracle", icon: Fuel },
            { value: "tests", label: "Test Cases", icon: Beaker },
          ].map(tabItem => (
            <TabsTrigger 
              key={tabItem.value}
              value={tabItem.value} 
              className="text-xs sm:text-sm py-1.5 px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm h-full flex-1"
              disabled={isPrimaryCodeActionLoading || (tabItem.value !== "code" && anySubActionLoading)}
            >
                <tabItem.icon className="h-3.5 w-3.5 mr-1 sm:mr-1.5" /> {tabItem.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="code" className="flex-grow flex flex-col overflow-hidden rounded-md border bg-muted/20">
          <ScrollArea className="flex-grow" style={{maxHeight: 'calc(100vh - 32rem)'}}>
            {isPrimaryCodeActionLoading ? ( 
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-center h-32">
                   <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                {[...Array(6)].map((_, i) => <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-full' : 'w-5/6'} bg-muted/50`} />)}
              </div>
            ) : ( 
              <SyntaxHighlighter language="solidity" style={customSyntaxHighlighterStyle} showLineNumbers lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }} wrapLines wrapLongLines>
                {code}
              </SyntaxHighlighter>
            )}
          </ScrollArea>
          <div className="p-3 border-t border-border/30 bg-card/50 mt-auto">
            <Label htmlFor="refinementRequest" className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Refine Code (AI Assist):
            </Label>
            <Textarea
              id="refinementRequest"
              value={refinementInput}
              onChange={(e) => setRefinementInput(e.target.value)}
              placeholder="e.g., 'Add NatSpec comments for all functions...' or 'Optimize the transfer function for gas efficiency...'"
              rows={2}
              className="mb-2 bg-background/70 focus:bg-background text-xs p-2"
              disabled={isPrimaryCodeActionLoading || anySubActionLoading}
            />
            <Button 
              onClick={handleRefineCodeSubmit} 
              disabled={isPrimaryCodeActionLoading || anySubActionLoading || !refinementInput.trim()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs py-2"
              size="sm"
            >
              {isRefiningCode ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
              Execute Refinement
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="flex-grow flex flex-col overflow-hidden rounded-md border bg-muted/20">
          <ScrollArea className="h-full flex-grow p-1" style={{maxHeight: 'calc(100vh - 28rem)'}}>
            {isLoadingSuggestions ? (
               <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className={`h-12 ${i % 2 === 0 ? 'w-3/4' : 'w-full'} bg-muted/50`} />)}
              </div>
            ) : suggestions.length > 0 || securityScore !== null ? (
              <div className="p-3 md:p-4 space-y-3">
                {securityScore !== null && (
                  <div className="flex items-center justify-between p-2.5 bg-card/50 rounded-md shadow-sm mb-3 border border-border/30">
                    <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5"><ShieldAlert className="h-4 w-4"/>Overall Audit Readiness</h3>
                    {getSecurityScoreBadge(securityScore)}
                  </div>
                )}
                {suggestions.length > 0 && <Separator className="my-3 bg-border/30"/>}
                {suggestions.length > 0 && <h3 className="text-sm font-semibold mb-2 text-center text-primary">AI Suggestions:</h3>}
                <ul className="space-y-2.5">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.id} className="p-2.5 bg-card/50 rounded-md text-sm space-y-1.5 border border-border/30 shadow-sm">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {getTypeIcon(suggestion.type)}
                        <Badge variant={getSeverityBadgeVariant(suggestion.severity)} className="capitalize px-2 py-0.5 text-xs">{suggestion.severity}</Badge>
                        <Badge variant="outline" className="capitalize px-2 py-0.5 text-xs">{suggestion.type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-muted-foreground text-xs leading-normal">{suggestion.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : ( <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]"> <Brain className="w-12 h-12 mb-4 text-muted-foreground/30" /> <p className="text-sm">No AI insights yet. Click "AI Scrutiny" below to analyze the code.</p> </div> )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="gas" className="flex-grow flex flex-col overflow-hidden rounded-md border bg-muted/20">
          <ScrollArea className="h-full flex-grow p-1" style={{maxHeight: 'calc(100vh - 28rem)'}}>
            {isLoadingGasEstimation ? (
              <div className="p-4 space-y-3"> {[...Array(2)].map((_, i) => <Skeleton key={i} className={`h-16 ${i % 2 === 0 ? 'w-3/4' : 'w-full'} bg-muted/50`} />)} </div>
            ) : gasEstimation ? (
              <div className="p-3 md:p-4 space-y-3">
                <div className="bg-card/50 rounded-md shadow-sm border border-border/30">
                  <CardHeader className="p-3 pb-1.5"> <CardTitle className="text-base flex items-center gap-2 text-primary"><Fuel className="w-4 h-4"/>Gas Estimation</CardTitle> </CardHeader>
                  <ShadCNCardContent className="space-y-2.5 p-3 pt-1">
                    <div> <h4 className="font-medium text-sm text-foreground mb-1">Estimated Gas Range:</h4> <p className="text-xs whitespace-pre-line ml-1 text-muted-foreground">{gasEstimation.estimatedGasRange}</p> </div>
                    <Separator className="my-2.5 bg-border/30" />
                    <div> <h4 className="font-medium text-sm text-foreground mb-1">Explanation:</h4> <p className="text-xs whitespace-pre-line ml-1 text-muted-foreground">{gasEstimation.explanation}</p> </div>
                  </ShadCNCardContent>
                </div>
              </div>
            ) : ( <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]"> <Fuel className="w-12 h-12 mb-4 text-muted-foreground/30" /> <p className="text-sm">No gas estimation available. Click "Query Gas Oracle" below.</p> </div> )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tests" className="flex-grow flex flex-col overflow-hidden rounded-md border bg-muted/20">
          <ScrollArea className="h-full flex-grow" style={{maxHeight: 'calc(100vh - 28rem)'}}>
            {isLoadingTestCases ? (
              <div className="p-4 space-y-2"> <div className="flex items-center justify-center h-32"> <Loader2 className="w-10 h-10 text-primary animate-spin" /> </div> {[...Array(6)].map((_, i) => <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? 'w-3/4' : 'w-full'} bg-muted/50`} />)} </div>
            ) : testCasesCode ? (
              <SyntaxHighlighter language="javascript" style={customSyntaxHighlighterStyle} showLineNumbers lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }} wrapLines wrapLongLines>
                {testCasesCode}
              </SyntaxHighlighter>
            ) : ( <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]"> <Beaker className="w-12 h-12 mb-4 text-muted-foreground/30" /> <p className="text-sm">No test cases generated. Click "Conjure Test Suite" below.</p> </div> )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {code && !isPrimaryCodeActionLoading && (
         <div className="pt-3 mt-2.5 space-y-2.5 border-t border-border/30">
          <h3 className="text-center text-sm font-medium text-foreground mb-1.5">
            Post-Forge Analysis & Augmentation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { handler: onGetAISuggestions, isLoading: isLoadingSuggestions, icon: Brain, label: "AI Scrutiny", key: "sug" },
              { handler: onEstimateGasCosts, isLoading: isLoadingGasEstimation, icon: Fuel, label: "Query Gas Oracle", key: "gas" },
              { handler: onGenerateTestCases, isLoading: isLoadingTestCases, icon: Beaker, label: "Conjure Test Suite", key: "test" },
              { handler: onGenerateDocumentation, isLoading: isGeneratingDocumentation, icon: FileTextIconLucide, label: "Scribe Docs (NatSpec)", key: "doc" },
            ].map(action => (
              <Button
                key={action.key}
                type="button"
                variant="outline"
                size="sm"
                onClick={action.handler}
                disabled={anySubActionLoading || isPrimaryCodeActionLoading || (action.key === "sug" && !selectedTemplate)}
                className="w-full text-xs sm:text-sm py-2 h-auto"
              >
                {action.isLoading ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <action.icon className="mr-2 h-3.5 w-3.5" />
                )}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
