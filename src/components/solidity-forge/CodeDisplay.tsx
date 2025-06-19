
"use client";

import React, { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Using a dark theme that fits the new aesthetic. `vscDarkPlus` is okay, or `oneDark`
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Lightbulb, Copy, Check, ShieldAlert, Zap, Wrench, Info, Fuel, Coins, Beaker, Sparkles, Loader2, Code2, Brain, FileText as FileTextIconLucide, AlertCircle, PackageSearch, Frown, Terminal } from 'lucide-react';
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
      toast({ title: `${type} Vector Copied`, description: `${type} data stream replicated to clipboard.` });
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [type]: false })), 2000);
    }).catch(err => {
      console.error(`Failed to copy ${type}: `, err);
      toast({ variant: "destructive", title: "Copy Sequence Failed!", description: `Could not replicate ${type} data.` });
    });
  }, [toast]);

  const handleDeployToRemix = useCallback(() => {
    if (!code) return;
    try {
      const base64Code = btoa(unescape(encodeURIComponent(code)));
      const remixURL = `https://remix.ethereum.org/?#code=${base64Code}&lang=sol`;
      window.open(remixURL, '_blank');
    } catch (error) {
        const base64Code = btoa(code); 
        const remixURL = `https://remix.ethereum.org/?#code=${base64Code}&lang=sol`;
        window.open(remixURL, '_blank');
        toast({
            variant: "destructive",
            title: "Remix Transmit Anomaly",
            description: "Standard Base64 encoding initiated. If Remix interface shows discrepancies, manually transfer the artifact code.",
        });
    }
  }, [code, toast]);

  const handleRefineCodeSubmit = useCallback(async () => {
    if (!refinementInput.trim()) {
      toast({ variant: "destructive", title: "Refinement Matrix Empty", description: "Provide directives to refine the artifact." });
      return;
    }
    await onRefineCode(refinementInput);
    setRefinementInput(''); 
  }, [refinementInput, onRefineCode, toast]);

  const getSecurityScoreBadge = (score: number | null) => {
    if (score === null) return null;
    let variant: BadgeProps["variant"] = "default"; 
    let text = `Audit Readiness: ${score}`;
     if (score >= 90) { variant = "default"; text = `Threat Level Minimal: ${score}`; } 
     else if (score >= 70) { variant = "secondary"; text = `Caution Advised: ${score}`; } 
     else if (score >= 50) { variant = "outline"; text = `High Alert: ${score}`; } 
     else { variant = "destructive"; text = `System Compromised: ${score}`; } 
    return <Badge variant={variant} className="text-xs px-2 py-1 font-share-tech-mono">{text}</Badge>;
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
      case 'security': return <ShieldAlert {...iconProps} className="text-destructive" />;
      case 'optimization': return <Zap {...iconProps} className="text-primary" />; 
      case 'gas_saving': return <Fuel {...iconProps} className="text-green-400" />; // Distinct color for gas
      case 'best_practice': return <Wrench {...iconProps} className="text-blue-400" />; // Distinct color
      case 'informational': return <Info {...iconProps} className="text-muted-foreground" />;
      default: return <Lightbulb {...iconProps} className="text-primary" />; 
    }
  };

  const futuristicSyntaxHighlighterStyle = {
    ...oneDark, // Or another dark theme like vscDarkPlus, materialDark, etc.
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: 'rgba(10, 10, 20, 0.7)', // Dark, slightly transparent
      margin: 0, 
      padding: '1rem 1.5rem', 
      fontSize: '0.9rem', // CLI text size
      fontFamily: 'var(--font-cli)', 
      lineHeight: '1.7',
      borderRadius: 'var(--radius)',
      border: '1px solid hsla(var(--primary-rgb), 0.2)',
      boxShadow: 'inset 0 0 10px hsla(var(--primary-rgb), 0.1)',
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
       fontFamily: 'var(--font-cli)', 
    },
    'lineNumber': {
        color: 'hsla(var(--primary-rgb), 0.3)',
        fontSize: '0.8em',
        paddingRight: '1.5em',
        opacity: 0.7,
    }
  };
  
  const renderEmptyState = (icon: React.ElementType, title: string, message: string) => (
    <div className="p-6 md:p-10 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[250px] font-uncut-sans">
      <icon className="w-12 h-12 md:w-16 md:h-16 mb-4 text-primary/40" />
      <p className="text-lg font-space-mono text-foreground mb-1.5">{title}</p>
      <p className="text-sm">{message}</p>
    </div>
  );

  const renderLoadingState = (message: string) => (
    <div className="p-6 md:p-10 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[250px] font-uncut-sans">
      <Loader2 className="w-10 h-10 md:w-12 md:h-12 mb-4 text-primary animate-spin" />
      <p className="text-base font-space-mono">{message}</p>
    </div>
  );


  return (
    <div className="flex flex-col h-full p-0"> {/* Padding handled by glass-section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3 text-center sm:text-left">
        <div>
            <h2 className="text-display-sm font-orbitron text-foreground">The <span className="gradient-text-cyan-magenta">Alchemist's Output</span></h2>
            <p className="text-body-lg text-muted-foreground mt-0.5 font-uncut-sans">Inspect, refine, and analyze your forged artifact.</p>
        </div>
        {activeTab === "code" && code && !isPrimaryCodeActionLoading && (
          <div className="flex gap-2.5 mt-2 sm:mt-0 self-center sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(code, "Artifact Code")} aria-label="Copy code" disabled={isPrimaryCodeActionLoading} className="btn-minimal-cta text-xs h-auto py-2 px-3">
              {copiedStates['Artifact Code'] ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {copiedStates['Artifact Code'] ? "Copied" : "Copy Code"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeployToRemix} aria-label="Deploy to Remix" disabled={isPrimaryCodeActionLoading} className="btn-minimal-cta text-xs h-auto py-2 px-3">
              Deploy to Remix <ExternalLink className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        )}
         {activeTab === "tests" && testCasesCode && !isPrimaryCodeActionLoading && (
          <div className="flex gap-2.5 mt-2 sm:mt-0 self-center sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(testCasesCode, "Test Matrix")} aria-label="Copy test cases" disabled={isPrimaryCodeActionLoading} className="btn-minimal-cta text-xs h-auto py-2 px-3">
              {copiedStates['Test Matrix'] ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {copiedStates['Test Matrix'] ? "Copied" : "Copy Tests"}
            </Button>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col min-h-0">
        <TabsList className="mb-3 grid w-full grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-lg bg-[rgba(var(--background-rgb),0.5)] border border-glass-section-border/20 h-auto">
          {[
            { value: "code", label: "Artifact Code", icon: Code2 },
            { value: "suggestions", label: "AI Insights", icon: Brain },
            { value: "gas", label: "Gas Oracle", icon: Fuel },
            { value: "tests", label: "Test Matrix", icon: Beaker },
          ].map(tabItem => (
            <TabsTrigger 
              key={tabItem.value}
              value={tabItem.value} 
              className="text-xs sm:text-sm py-2 px-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md h-full flex-1 font-space-mono data-[state=active]:border-primary/30 border border-transparent"
              disabled={isPrimaryCodeActionLoading || (tabItem.value !== "code" && anySubActionLoading)}
            >
                <tabItem.icon className="h-4 w-4 mr-1.5" /> {tabItem.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="code" className="flex-grow flex flex-col overflow-hidden rounded-lg border border-glass-section-border/20 bg-[rgba(var(--background-rgb),0.3)]">
          <ScrollArea className="flex-grow" style={{maxHeight: 'calc(100vh - 35rem)'}}> {/* Adjust max height as needed */}
            {isPrimaryCodeActionLoading ? ( 
              renderLoadingState("Modifying artifact structure...")
            ) : code ? ( 
              <SyntaxHighlighter language="solidity" style={futuristicSyntaxHighlighterStyle} showLineNumbers lineNumberStyle={{ color: 'hsla(var(--primary-rgb), 0.3)', fontSize: '0.75em', userSelect: 'none' }} wrapLines={true} wrapLongLines={true}>
                {code}
              </SyntaxHighlighter>
            ) : (
              renderEmptyState(Code2, "No Artifact Generated", "Initiate forging sequence to materialize code.")
            )}
          </ScrollArea>
          {code && !isPrimaryCodeActionLoading && (
            <div className="p-3 md:p-4 border-t border-glass-section-border/20 bg-[rgba(var(--input-background-rgb),0.5)] mt-auto">
              <Label htmlFor="refinementRequest" className="text-sm font-space-mono flex items-center gap-1.5 mb-1.5 text-primary">
                <Sparkles className="h-4 w-4" />
                Refine Artifact (AI Directive):
              </Label>
              <Textarea
                id="refinementRequest"
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                placeholder="e.g., 'Implement EIP-2612 permit functionality...' or 'Optimize storage access in transfer functions...'"
                rows={2}
                className="mb-2 bg-input border-border focus:border-primary text-sm p-2.5 font-share-tech-mono min-h-[5rem]"
                disabled={isPrimaryCodeActionLoading || anySubActionLoading}
              />
              <Button 
                onClick={handleRefineCodeSubmit} 
                disabled={isPrimaryCodeActionLoading || anySubActionLoading || !refinementInput.trim()}
                className="btn-terminal-cta w-full"
              >
                {isRefiningCode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Terminal className="mr-2 h-4 w-4" />}
                Execute Refinement Directive
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="flex-grow flex flex-col overflow-hidden rounded-lg border border-glass-section-border/20 bg-[rgba(var(--background-rgb),0.3)]">
          <ScrollArea className="h-full flex-grow p-1" style={{maxHeight: 'calc(100vh - 30rem)'}}>
            {isLoadingSuggestions ? (
               renderLoadingState("Accessing AI Oracle for Insights...")
            ) : suggestions.length > 0 || securityScore !== null ? (
              <div className="p-3 md:p-4 space-y-3.5">
                {securityScore !== null && (
                  <div className="flex items-center justify-between p-3 bg-[rgba(var(--input-background-rgb),0.5)] rounded-md shadow-md mb-3 border border-glass-section-border/30">
                    <h3 className="text-base font-space-mono text-primary flex items-center gap-2"><ShieldAlert className="h-5 w-5"/>Overall Threat Assessment</h3>
                    {getSecurityScoreBadge(securityScore)}
                  </div>
                )}
                {suggestions.length > 0 && <Separator className="my-3 bg-glass-section-border/30"/>}
                {suggestions.length > 0 && <h3 className="text-base font-space-mono mb-2.5 text-center text-primary">AI Oracle Pronouncements:</h3>}
                <ul className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.id} className="p-3 bg-[rgba(var(--input-background-rgb),0.4)] rounded-md text-sm space-y-2 border border-glass-section-border/20 shadow-sm font-uncut-sans">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {getTypeIcon(suggestion.type)}
                        <Badge variant={getSeverityBadgeVariant(suggestion.severity)} className="capitalize px-2 py-0.5 text-xs font-share-tech-mono">{suggestion.severity}</Badge>
                        <Badge variant="outline" className="capitalize px-2 py-0.5 text-xs font-share-tech-mono border-primary/30 text-primary/90 bg-primary/10">{suggestion.type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{suggestion.description}</p>
                    </li>
                  ))}
                </ul>
                 {suggestions.length === 0 && securityScore !== null && renderEmptyState(PackageSearch, "No Specific Pronouncements", "The AI Oracle reviewed the artifact but found no specific anomalies to flag at this time.")}
              </div>
            ) : ( renderEmptyState(Brain, "AI Oracle Dormant", "Invoke 'AI Scrutiny' below to analyze the artifact.") )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="gas" className="flex-grow flex flex-col overflow-hidden rounded-lg border border-glass-section-border/20 bg-[rgba(var(--background-rgb),0.3)]">
          <ScrollArea className="h-full flex-grow p-1" style={{maxHeight: 'calc(100vh - 30rem)'}}>
            {isLoadingGasEstimation ? (
              renderLoadingState("Querying Gas Consumption Matrix...")
            ) : gasEstimation ? (
              <div className="p-3 md:p-4 space-y-3.5">
                <div className="bg-[rgba(var(--input-background-rgb),0.5)] rounded-md shadow-md border border-glass-section-border/30">
                  <div className="p-3 pb-2 border-b border-glass-section-border/20"> <h3 className="text-base font-space-mono flex items-center gap-2 text-primary"><Fuel className="w-5 h-5"/>Gas Consumption Analysis</h3> </div>
                  <div className="space-y-3 p-3 font-uncut-sans">
                    <div> <h4 className="font-bold text-sm text-foreground mb-1">Estimated Gas Range:</h4> <p className="text-sm whitespace-pre-line ml-1 text-muted-foreground font-share-tech-mono">{gasEstimation.estimatedGasRange}</p> </div>
                    <Separator className="my-2.5 bg-glass-section-border/30" />
                    <div> <h4 className="font-bold text-sm text-foreground mb-1">Explanation:</h4> <p className="text-sm whitespace-pre-line ml-1 text-muted-foreground">{gasEstimation.explanation}</p> </div>
                  </div>
                </div>
              </div>
            ) : ( renderEmptyState(Fuel, "Gas Oracle Awaiting Query", "Invoke 'Query Gas Oracle' below to estimate consumption.") )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tests" className="flex-grow flex flex-col overflow-hidden rounded-lg border border-glass-section-border/20 bg-[rgba(var(--background-rgb),0.3)]">
          <ScrollArea className="h-full flex-grow" style={{maxHeight: 'calc(100vh - 30rem)'}}>
            {isLoadingTestCases ? (
              renderLoadingState("Conjuring Test Matrix...")
            ) : testCasesCode ? (
              <SyntaxHighlighter language="javascript" style={futuristicSyntaxHighlighterStyle} showLineNumbers lineNumberStyle={{ color: 'hsla(var(--primary-rgb), 0.3)', fontSize: '0.75em', userSelect: 'none' }} wrapLines={true} wrapLongLines={true}>
                {testCasesCode}
              </SyntaxHighlighter>
            ) : ( renderEmptyState(Beaker, "Test Matrix Unmaterialized", "Invoke 'Conjure Test Matrix' below to generate validation sequences.") )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {code && !isPrimaryCodeActionLoading && (
         <div className="pt-4 mt-3 space-y-3 border-t border-glass-section-border/30">
          <h3 className="text-center text-base font-space-mono text-primary mb-2">
            Post-Forge Augmentation Matrix
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { handler: onGetAISuggestions, isLoading: isLoadingSuggestions, icon: Brain, label: "AI Scrutiny", key: "sug" },
              { handler: onEstimateGasCosts, isLoading: isLoadingGasEstimation, icon: Fuel, label: "Query Gas Oracle", key: "gas" },
              { handler: onGenerateTestCases, isLoading: isLoadingTestCases, icon: Beaker, label: "Conjure Test Matrix", key: "test" },
              { handler: onGenerateDocumentation, isLoading: isGeneratingDocumentation, icon: FileTextIconLucide, label: "Scribe Docs (NatSpec)", key: "doc" },
            ].map(action => (
              <Button
                key={action.key}
                type="button"
                variant="outline"
                size="sm"
                onClick={action.handler}
                disabled={anySubActionLoading || isPrimaryCodeActionLoading || (action.key === "sug" && !selectedTemplate)}
                className="btn-minimal-cta w-full text-xs sm:text-sm py-2.5 h-auto"
              >
                {action.isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <action.icon className="mr-2 h-4 w-4" />
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
