
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
import { Puzzle, Loader2 } from 'lucide-react';

const MAX_FORGES_PER_DAY = 5; 
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
        title: "Daily Forge Limit Reached",
        description: "Upgrade to Developer Access for unlimited forging and your AirDrop!",
      });
      developerAccessFormRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsGeneratingCode(true);
    setGeneratedCode(''); 
    resetAnalyses(); 
    setActiveTemplateForOutput(template); 

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
        title: "Contract Forged!",
        description: "Your Solidity masterpiece is ready.",
      });
      setTimeout(() => {
        outputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        variant: "destructive",
        title: "Code Generation Failed",
        description: (error as Error).message || "The AI encountered an issue. Please try refining your request or try again later.",
      });
      setGeneratedCode(''); 
      setActiveTemplateForOutput(undefined);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isForgeDisabledByLimit, toast, hasDeveloperAccess, usageData, resetAnalyses]);


  const handleGetAISuggestions = useCallback(async () => {
    if (!generatedCode || !activeTemplateForOutput) {
      toast({ variant: "destructive", title: "Code Required", description: "Please generate a contract first to get AI suggestions." });
      return;
    }
    setIsGettingSuggestions(true);
    setAiSuggestions([]);
    setSecurityScore(null);
    const paramsForAI = activeTemplateForOutput.id === 'custom' ? { customDescription: 'Custom Contract Analysis' } : { contractType: activeTemplateForOutput.name };
    try {
      const result = await suggestErrorPrevention({
        contractType: activeTemplateForOutput.name,
        parameters: paramsForAI,
        code: generatedCode,
      });
      setAiSuggestions(result.suggestions || []);
      setSecurityScore(result.securityScore);
      toast({ title: "AI Insights Revealed", description: "Suggestions and security score are now available." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Suggestion Failed", description: (error as Error).message || "Could not retrieve AI suggestions." });
    } finally {
      setIsGettingSuggestions(false);
    }
  }, [generatedCode, activeTemplateForOutput, toast]);

  const handleEstimateGasCosts = useCallback(async () => {
    if (!generatedCode) {
      toast({ variant: "destructive", title: "Code Required", description: "Please generate a contract first to estimate gas costs." });
      return;
    }
    setIsEstimatingGas(true);
    setGasEstimation(null);
    try {
      const result = await estimateGasCost({ code: generatedCode });
      setGasEstimation(result);
      toast({ title: "Gas Estimation Complete", description: "Analysis of gas consumption is ready." });
    } catch (error) {
      toast({ variant: "destructive", title: "Gas Estimation Failed", description: (error as Error).message || "Failed to estimate gas costs." });
    } finally {
      setIsEstimatingGas(false);
    }
  }, [generatedCode, toast]);

  const handleGenerateTestCases = useCallback(async () => {
    if (!generatedCode || !activeTemplateForOutput) {
      toast({ variant: "destructive", title: "Code Required", description: "Please generate a contract first to create test cases." });
      return;
    }
    setIsGeneratingTestCases(true);
    setGeneratedTestCases('');
    try {
      const contractName = activeTemplateForOutput.id !== 'custom' ? activeTemplateForOutput.name : undefined;
      const result = await generateTestCases({ code: generatedCode, contractName: contractName });
      setGeneratedTestCases(result.testCasesCode);
      toast({ title: "Test Cases Generated", description: "A basic Hardhat test suite has been created." });
    } catch (error) {
      toast({ variant: "destructive", title: "Test Generation Failed", description: (error as Error).message || "Could not generate test cases." });
    } finally {
      setIsGeneratingTestCases(false);
    }
  }, [generatedCode, activeTemplateForOutput, toast]);

  const handleRefineCode = useCallback(async (request: string) => {
    if (!generatedCode || !activeTemplateForOutput) {
      toast({ variant: "destructive", title: "Code Required", description: "Generate code before attempting refinement." });
      return;
    }
    if (!request.trim()) {
      toast({ variant: "destructive", title: "Instructions Needed", description: "Please provide instructions for refining the code." });
      return;
    }
    setIsRefiningCode(true);
    resetAnalyses(); 
    try {
      const result = await refineSmartContractCode({
        currentCode: generatedCode,
        refinementRequest: request,
        contractContext: `Contract type: ${activeTemplateForOutput.name}`,
      });
      setGeneratedCode(result.refinedCode); 
      toast({ title: "Code Refined Successfully", description: "Your contract code has been updated as per your instructions." });
    } catch (error) {
      toast({ variant: "destructive", title: "Refinement Failed", description: (error as Error).message || "Failed to refine the code." });
    } finally {
      setIsRefiningCode(false);
    }
  }, [generatedCode, activeTemplateForOutput, toast, resetAnalyses]);

  const handleGenerateDocumentation = useCallback(async () => {
    if (!generatedCode) {
      toast({ variant: "destructive", title: "Code Required", description: "Generate code first to add NatSpec documentation." });
      return;
    }
    setIsGeneratingDocumentation(true);
    resetAnalyses(); 
    try {
      const result = await generateDocumentation({ code: generatedCode });
      setGeneratedCode(result.documentedCode); 
      toast({ title: "Documentation Generated", description: "NatSpec comments have been added to your code." });
    } catch (error) {
      toast({ variant: "destructive", title: "Documentation Failed", description: (error as Error).message || "Failed to generate documentation." });
    } finally {
      setIsGeneratingDocumentation(false);
    }
  }, [generatedCode, toast, resetAnalyses]);

  const handleFindAddresses = useCallback(async (query: string) => {
    if (!query.trim()) {
      toast({ variant: "destructive", title: "Query Needed", description: "Please enter a search term for known addresses." });
      return;
    }
    setIsFindingAddresses(true);
    setAddressResults(null);
    try {
      const result = await getKnownLiquidityPoolInfo({ query });
      setAddressResults(result);
      if (!result.results || result.results.length === 0) {
          toast({ title: "Address Search", description: result.summary || "No specific addresses found for your query."});
      } else {
          toast({ title: "Address Search Complete", description: result.summary || "Known addresses fetched." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Address Search Failed", description: (error as Error).message || "Failed to fetch known addresses." });
    } finally {
      setIsFindingAddresses(false);
    }
  }, [toast]);

  const handleDeveloperAccessSignupSuccess = useCallback(() => {
    setHasDeveloperAccess(true);
    localStorage.setItem(LOCAL_STORAGE_DEV_ACCESS_KEY, 'true');
    toast({
      title: "Developer Access Granted!",
      description: "Unlimited forging and your AirDrop spot are secured. BSAI token holders get full access free!",
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
    toast({ title: "Forge Cleared", description: "Contract configuration and output have been reset." });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetAnalyses, toast]);

  const anySubActionLoading = isGettingSuggestions || isEstimatingGas || isGeneratingTestCases || isRefiningCode || isGeneratingDocumentation;

  return (
    <div className="min-h-screen text-foreground flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 flex flex-col items-stretch gap-6 md:gap-8">
        
        <Card className="border shadow-sm">
            <ContractConfigForm
                templates={CONTRACT_TEMPLATES}
                onGenerateCode={handleGenerateCode}
                isGeneratingCode={isGeneratingCode}
                selectedTemplateProp={CONTRACT_TEMPLATES[0]} 
                isForgeDisabledByLimit={isForgeDisabledByLimit}
                onNavigateToDevAccess={handleNavigateToDevAccess}
                onResetForge={handleResetForge}
                hasGeneratedCode={!!generatedCode}
            />
        </Card>

        {isGeneratingCode && !generatedCode && (
            <Card className="border-dashed border-border/60 dark:border-primary/40 shadow-none flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] text-center bg-muted/20">
                <CardContent className="text-muted-foreground p-6 md:p-8">
                    <Loader2 className="w-16 h-16 md:w-20 md:h-20 text-primary/40 mx-auto mb-4 animate-spin" />
                    <p className="text-lg md:text-xl font-medium text-foreground mb-1">The Alchemist is Working...</p>
                    <p className="text-sm md:text-base">
                        Your smart contract is being forged by the AI. Please wait a moment.
                    </p>
                </CardContent>
            </Card>
        )}

        {!isGeneratingCode && !generatedCode && (
           <Card className="border-dashed border-border/60 dark:border-primary/40 shadow-none flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] text-center bg-muted/20">
            <CardContent className="text-muted-foreground p-6 md:p-8">
                <Puzzle className="w-16 h-16 md:w-20 md:h-20 text-primary/40 mx-auto mb-4" />
                <p className="text-lg md:text-xl font-medium text-foreground mb-1">Ready to Forge?</p>
                <p className="text-sm md:text-base">
                    Configure your desired smart contract parameters using the form above.
                    Once you click "Review & Forge," your generated code and analysis tools will appear in this section.
                </p>
            </CardContent>
          </Card>
        )}
        
        {generatedCode && activeTemplateForOutput && (
          <div ref={outputSectionRef} className="w-full">
            <Card className="border shadow-sm">
              <CodeDisplay
                code={generatedCode}
                suggestions={aiSuggestions}
                securityScore={securityScore}
                gasEstimation={gasEstimation}
                testCasesCode={generatedTestCases}
                isLoadingCode={isGeneratingCode} 
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

        <Card className="border shadow-sm">
          <CardContent className="p-4 md:p-6">
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
          <div ref={developerAccessFormRef} className="w-full">
            <DeveloperAccessForm onSignupSuccess={handleDeveloperAccessSignupSuccess} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
    
