
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/solidity-forge/Header';
import { Footer } from '@/components/solidity-forge/Footer';
import { ContractConfigForm, type FormData as ContractFormData } from '@/components/solidity-forge/ContractConfigForm';
import { CodeDisplay, type AISuggestion } from '@/components/solidity-forge/CodeDisplay';
import type { EstimateGasCostOutput } from '@/ai/flows/estimate-gas-cost';
import { KnownAddressesFinder } from '@/components/solidity-forge/KnownAddressesFinder';
import { DeveloperAccessForm } from '@/components/solidity-forge/DeveloperAccessForm';
import { useToast } from "@/hooks/use-toast";
import { generateSmartContractCode } from '@/ai/flows/generate-smart-contract-code';
import { suggestErrorPrevention } from '@/ai/flows/suggest-error-prevention';
import { estimateGasCost } from '@/ai/flows/estimate-gas-cost';
import { getKnownLiquidityPoolInfo, type GetKnownLiquidityPoolInfoOutput } from '@/ai/flows/get-known-liquidity-pool-info';
import { generateTestCases } from '@/ai/flows/generate-test-cases';
import { refineSmartContractCode } from '@/ai/flows/refine-smart-contract-code';
import { generateDocumentation } from '@/ai/flows/generate-documentation-flow';
import { Card, CardContent } from '@/components/ui/card';
import { CONTRACT_TEMPLATES, type ContractTemplate } from '@/config/contracts';
import { cn } from '@/lib/utils';
import { Puzzle } from 'lucide-react';

const MAX_FORGES_PER_DAY = 3;
const LOCAL_STORAGE_USAGE_KEY = 'solidityForgeUsage';
const LOCAL_STORAGE_DEV_ACCESS_KEY = 'solidityForgeDevAccess';

interface UsageData {
  count: number;
  date: string; // YYYY-MM-DD
}

export default function SolidityForgePage() {
  const [activeTemplateForOutput, setActiveTemplateForOutput] = useState<ContractTemplate | undefined>(undefined);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [securityScore, setSecurityScore] = useState<number | null>(null);
  const [gasEstimation, setGasEstimation] = useState<EstimateGasCostOutput | null>(null);
  const [generatedTestCases, setGeneratedTestCases] = useState<string>('');

  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState<boolean>(false);
  const [isEstimatingGas, setIsEstimatingGas] = useState<boolean>(false);
  const [isGeneratingTestCases, setIsGeneratingTestCases] = useState<boolean>(false);
  const [isRefiningCode, setIsRefiningCode] = useState<boolean>(false);
  const [isGeneratingDocumentation, setIsGeneratingDocumentation] = useState<boolean>(false);

  const [mainContentVisible, setMainContentVisible] = useState(false);

  const [addressQuery, setAddressQuery] = useState<string>('');
  const [addressResults, setAddressResults] = useState<GetKnownLiquidityPoolInfoOutput | null>(null);
  const [isFindingAddresses, setIsFindingAddresses] = useState<boolean>(false);

  const [usageData, setUsageData] = useState<UsageData>({ count: 0, date: new Date().toISOString().split('T')[0] });
  const [hasDeveloperAccess, setHasDeveloperAccess] = useState<boolean>(false);

  const developerAccessFormRef = useRef<HTMLDivElement>(null);
  const outputSectionRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const getTodayDateString = useCallback(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const timer = setTimeout(() => setMainContentVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const storedUsage = localStorage.getItem(LOCAL_STORAGE_USAGE_KEY);
    const today = getTodayDateString();
    if (storedUsage) {
      const parsedUsage: UsageData = JSON.parse(storedUsage);
      if (parsedUsage.date === today) {
        setUsageData(parsedUsage);
      } else {
        const newUsageData = { count: 0, date: today };
        setUsageData(newUsageData);
        localStorage.setItem(LOCAL_STORAGE_USAGE_KEY, JSON.stringify(newUsageData));
      }
    } else {
       const initialUsage = { count: 0, date: today };
       setUsageData(initialUsage);
       localStorage.setItem(LOCAL_STORAGE_USAGE_KEY, JSON.stringify(initialUsage));
    }

    const storedDevAccess = localStorage.getItem(LOCAL_STORAGE_DEV_ACCESS_KEY);
    if (storedDevAccess === 'true') {
      setHasDeveloperAccess(true);
    }
  }, [getTodayDateString]);

  const isForgeDisabledByLimit = usageData.count >= MAX_FORGES_PER_DAY && !hasDeveloperAccess;
  const showDeveloperAccessCTA = isForgeDisabledByLimit && !hasDeveloperAccess;

  const resetAnalyses = useCallback(() => {
    setAiSuggestions([]);
    setSecurityScore(null);
    setGasEstimation(null);
    setGeneratedTestCases('');
  }, []);

  const handleGenerateCode = useCallback(async (template: ContractTemplate, formData: ContractFormData) => {
    if (isForgeDisabledByLimit) {
      toast({
        variant: "destructive",
        title: "Forge Limit Hit! Don't Miss Out!",
        description: "You're crafting like a pro! Snag FREE Developer Access for UNLIMITED forging & lock in your 40 Billion Token AirDrop. Your next masterpiece awaits!",
      });
      developerAccessFormRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsGeneratingCode(true);
    setGeneratedCode(''); // Clear previous code
    resetAnalyses(); // Clear previous analyses
    setActiveTemplateForOutput(template); // Set context for output section

    if (!hasDeveloperAccess) {
      const newCount = usageData.count + 1;
      const newUsageData = { ...usageData, count: newCount };
      setUsageData(newUsageData);
      localStorage.setItem(LOCAL_STORAGE_USAGE_KEY, JSON.stringify(newUsageData));
    }

    let description = `Generate a Solidity smart contract for ${template.name}.`;
    if (template.id === 'custom' && formData.customDescription) {
        description = formData.customDescription as string;
    } else {
        description += `\nParameters:`;
        for (const key in formData) {
          if (Object.prototype.hasOwnProperty.call(formData, key) && formData[key] !== undefined && formData[key] !== '') {
            const paramConfig = template.parameters.find(p => p.name === key);
            description += `\n- ${paramConfig?.label || key}: ${formData[key]}`;
          }
        }
    }
    if(template.aiPromptEnhancement) {
        description += `\n\nSpecific guidance: ${template.aiPromptEnhancement}`;
    }

    try {
      const result = await generateSmartContractCode({ description });
      setGeneratedCode(result.code);
      toast({
        title: "Code Manifested!",
        description: "Behold, your Solidity. Try not to introduce *too* many bugs, human.",
      });
      // Scroll to output section after generation
      setTimeout(() => {
        outputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        variant: "destructive",
        title: "Code Conjuring Chaos!",
        description: (error as Error).message || "My circuits whimpered and refused. Perhaps your request was *too* ambitious? Or just try again.",
      });
      setGeneratedCode(''); // Ensure code is cleared on error
      setActiveTemplateForOutput(undefined);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isForgeDisabledByLimit, toast, hasDeveloperAccess, usageData, resetAnalyses, getTodayDateString]);


  const handleGetAISuggestions = useCallback(async () => {
    if (!generatedCode || !activeTemplateForOutput) {
      toast({
        variant: "destructive",
        title: "Patience, Architect!",
        description: "Summon some code first, then I shall deign to critique it.",
      });
      return;
    }
    setIsGettingSuggestions(true);
    setAiSuggestions([]);
    setSecurityScore(null);

    const paramsForAI = activeTemplateForOutput.id === 'custom' ? { customDescription: 'Custom Contract Analysis' } : { contractType: activeTemplateForOutput.name };

    try {
      const result = await suggestErrorPrevention({
        contractType: activeTemplateForOutput.name,
        parameters: paramsForAI, // This might need adjustment if formData is required.
        code: generatedCode,
      });
      setAiSuggestions(result.suggestions || []);
      setSecurityScore(result.securityScore);
      toast({
        title: "Critique Complete!",
        description: "My insights are served. Ignoring them would be... unwise.",
      });
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast({
        variant: "destructive",
        title: "Suggestion Engine Sputters!",
        description: (error as Error).message || "My analytical core is taking an unscheduled nap. Or your code simply defies analysis.",
      });
    } finally {
      setIsGettingSuggestions(false);
    }
  }, [generatedCode, activeTemplateForOutput, toast]);

  const handleEstimateGasCosts = useCallback(async () => {
    if (!generatedCode) {
      toast({
        variant: "destructive",
        title: "No Code, No Gas!",
        description: "Materialize some code, then we'll discuss its ethereal costs.",
      });
      return;
    }
    setIsEstimatingGas(true);
    setGasEstimation(null);

    try {
      const result = await estimateGasCost({ code: generatedCode });
      setGasEstimation(result);
      toast({
        title: "Gas Guesstimate Delivered!",
        description: "My crystal ball (aka advanced heuristics) offers this fiscal prophecy.",
      });
    } catch (error) {
      console.error("Error estimating gas costs:", error);
      toast({
        variant: "destructive",
        title: "Gas Oracle Offline!",
        description: (error as Error).message || "The etherial bean counters are on lunch break. Try again when they're less… gassy.",
      });
    } finally {
      setIsEstimatingGas(false);
    }
  }, [generatedCode, toast]);

  const handleGenerateTestCases = useCallback(async () => {
    if (!generatedCode || !activeTemplateForOutput) {
      toast({
        variant: "destructive",
        title: "Testing the Void?",
        description: "Forge the code, then we'll forge the tests. In that order.",
      });
      return;
    }
    setIsGeneratingTestCases(true);
    setGeneratedTestCases('');
    try {
      // Pass contract name if available, otherwise AI will infer
      const contractName = activeTemplateForOutput.id !== 'custom' ? activeTemplateForOutput.name : undefined;
      const result = await generateTestCases({ code: generatedCode, contractName: contractName });
      setGeneratedTestCases(result.testCasesCode);
      toast({
        title: "Test Blueprints Rendered!",
        description: "Some foundational tests, as requested. True genius, of course, often eludes such mundane checks.",
      });
    } catch (error) {
      console.error("Error generating test cases:", error);
      toast({
        variant: "destructive",
        title: "Test Generation Glitch!",
        description: (error as Error).message || "My automated scribes are confused. Is your code... *too* unique for tests?",
      });
    } finally {
      setIsGeneratingTestCases(false);
    }
  }, [generatedCode, activeTemplateForOutput, toast]);

  const handleRefineCode = useCallback(async (request: string) => {
    if (!generatedCode || !activeTemplateForOutput) {
      toast({
        variant: "destructive",
        title: "Refining Air?",
        description: "Provide the clay (code), and I shall sculpt (refine).",
      });
      return;
    }
    if (!request.trim()) {
      toast({
        variant: "destructive",
        title: "Silent Treatment?",
        description: "Your refinement request is... eloquently empty. Try adding words.",
      });
      return;
    }

    setIsRefiningCode(true);
    resetAnalyses(); // Clear previous analyses before refining

    try {
      const result = await refineSmartContractCode({
        currentCode: generatedCode,
        refinementRequest: request,
        contractContext: `Contract type: ${activeTemplateForOutput.name}`,
      });
      setGeneratedCode(result.refinedCode); // Update code with refined version
      toast({
        title: "Code Polished (Allegedly)!",
        description: "I've applied your 'refinements'. Rerun analyses at your own peril.",
      });
    } catch (error) {
      console.error("Error refining code:", error);
      toast({
        variant: "destructive",
        title: "Refinement Resisted!",
        description: (error as Error).message || "My logic gates are protesting your request. Perhaps rephrase, or accept perfection as-is?",
      });
    } finally {
      setIsRefiningCode(false);
    }
  }, [generatedCode, activeTemplateForOutput, toast, resetAnalyses]);

  const handleGenerateDocumentation = useCallback(async () => {
    if (!generatedCode) {
      toast({
        variant: "destructive",
        title: "Docu-what-now?",
        description: "I can't document a void. Generate some code first, genius.",
      });
      return;
    }
    setIsGeneratingDocumentation(true);
    // We don't necessarily need to reset all analyses, but the code will change.
    // Depending on desired UX, you might keep suggestions if they are still relevant.
    // For simplicity, let's assume documentation changes the code enough that analyses should be fresh.
    resetAnalyses(); 

    try {
      const result = await generateDocumentation({ code: generatedCode });
      setGeneratedCode(result.documentedCode); // Update code with docs
      toast({
        title: "Documentation Scribed!",
        description: "Your code is now (hopefully) more understandable. Or at least has more words.",
      });
    } catch (error) {
      console.error("Error generating documentation:", error);
      toast({
        variant: "destructive",
        title: "Documentation Drafter Down!",
        description: (error as Error).message || "My quills are broken. Try again later.",
      });
    } finally {
      setIsGeneratingDocumentation(false);
    }
  }, [generatedCode, toast, resetAnalyses]);


  const handleFindAddresses = useCallback(async (query: string) => {
    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "Query Quest: Missing Clue",
        description: "To find, one must first seek. With words, preferably.",
      });
      return;
    }
    setIsFindingAddresses(true);
    setAddressResults(null);
    try {
      const result = await getKnownLiquidityPoolInfo({ query });
      setAddressResults(result);
      toast({
        title: "Address Intel Acquired!",
        description: result.summary || "The address archives have been consulted.",
      });
    } catch (error) {
      console.error("Error finding addresses:", error);
      toast({
        variant: "destructive",
        title: "Address Archive Error!",
        description: (error as Error).message || "My rolodex of realities is temporarily scrambled. Seek addresses later.",
      });
    } finally {
      setIsFindingAddresses(false);
    }
  }, [toast]);

  const handleDeveloperAccessSignupSuccess = useCallback(() => {
    setHasDeveloperAccess(true);
    localStorage.setItem(LOCAL_STORAGE_DEV_ACCESS_KEY, 'true');
    toast({
      title: "ACCESS GRANTED! You're an Insider Now!",
      description: "Welcome to the elite, Developer! Unlimited forging power is yours. The 40 Billion Token AirDrop is calling your name... and remember, BSAI token holders get the keys to the entire BlockSmithAI kingdom – free!",
      duration: 7000,
    });
  }, [toast]);

  const handleNavigateToDevAccess = useCallback(() => {
    developerAccessFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleResetForge = useCallback(() => {
    setGeneratedCode('');
    setActiveTemplateForOutput(undefined);
    resetAnalyses();
    toast({
        title: "Forge Cleared!",
        description: "The slate is clean. Ready for your next grand design (or happy accident)."
    })
  }, [resetAnalyses, toast]);

  const anySubActionLoading = isGettingSuggestions || isEstimatingGas || isGeneratingTestCases || isRefiningCode || isGeneratingDocumentation;

  return (
    <div className="min-h-screen text-foreground flex flex-col bg-background">
      <Header />
      <main
        className={`flex-grow container mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 flex flex-col items-center gap-8 transition-opacity duration-700 ease-out ${mainContentVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Configuration Section */}
        <Card
          className={cn(
            "transition-all duration-300 bg-card/80 backdrop-blur-sm w-full animate-fadeInUp glow-border-accent",
            "border self-stretch" // Ensure it stretches if content is small
          )}
          style={{ animationDelay: '0.1s' }}
        >
          <CardContent className="p-0 h-full flex flex-col">
            <ContractConfigForm
              templates={CONTRACT_TEMPLATES}
              onGenerateCode={handleGenerateCode}
              isGeneratingCode={isGeneratingCode}
              selectedTemplateProp={CONTRACT_TEMPLATES[0]} // For initial form setup
              isForgeDisabledByLimit={isForgeDisabledByLimit}
              onNavigateToDevAccess={handleNavigateToDevAccess}
              onResetForge={handleResetForge}
              hasGeneratedCode={!!generatedCode}
            />
          </CardContent>
        </Card>

        {/* Output Section - Conditionally Rendered */}
        {generatedCode && activeTemplateForOutput && (
          <div ref={outputSectionRef} className="w-full animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <Card
              className={cn(
                "transition-all duration-300 bg-card/80 backdrop-blur-sm w-full glow-border-yellow",
                "border self-stretch" 
              )}
            >
              <CodeDisplay
                code={generatedCode}
                suggestions={aiSuggestions}
                securityScore={securityScore}
                gasEstimation={gasEstimation}
                testCasesCode={generatedTestCases}
                isLoadingCode={isGeneratingCode} // This might be confusing if code is already generated. Consider a more specific loading state for this section.
                isLoadingSuggestions={isGettingSuggestions}
                isLoadingGasEstimation={isEstimatingGas}
                isLoadingTestCases={isGeneratingTestCases}
                isRefiningCode={isRefiningCode}
                isGeneratingDocumentation={isGeneratingDocumentation}
                onRefineCode={handleRefineCode}
                selectedTemplate={activeTemplateForOutput}
                anySubActionLoading={anySubActionLoading}
                onGetAISuggestions={handleGetAISuggestions}
                onEstimateGasCosts={handleEstimateGasCosts}
                onGenerateTestCases={handleGenerateTestCases}
                onGenerateDocumentation={handleGenerateDocumentation}
              />
            </Card>
          </div>
        )}

        {/* Lower Section - Utilities */}
        <div className="w-full mt-0 space-y-8 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <Card
              className={cn(
                "transition-all duration-300 bg-card/80 backdrop-blur-sm w-full max-w-full glow-border-magenta",
                "border"
              )}
            >
              <CardContent className="p-6 md:p-8">
                <KnownAddressesFinder
                  onFindAddresses={handleFindAddresses}
                  results={addressResults}
                  isLoading={isFindingAddresses}
                  initialQuery={addressQuery}
                  setInitialQuery={setAddressQuery}
                />
              </CardContent>
            </Card>

            {showDeveloperAccessCTA && (
              <div ref={developerAccessFormRef} className="w-full max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                <DeveloperAccessForm onSignupSuccess={handleDeveloperAccessSignupSuccess} />
              </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
    
