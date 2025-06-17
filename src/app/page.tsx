
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

  const [addressQuery, setAddressQuery] = useState<string>('');
  const [addressResults, setAddressResults] = useState<GetKnownLiquidityPoolInfoOutput | null>(null);
  const [isFindingAddresses, setIsFindingAddresses] = useState<boolean>(false);

  const [usageData, setUsageData] = useState<UsageData>({ count: 0, date: new Date().toISOString().split('T')[0] });
  const [hasDeveloperAccess, setHasDeveloperAccess] = useState<boolean>(false);

  const developerAccessFormRef = useRef<HTMLDivElement>(null);
  const outputSectionRef = useRef<HTMLDivElement>(null); // For scrolling to output

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
        title: "Forge Limit Reached",
        description: "You've hit the daily limit. Get Developer Access for unlimited forging and your AirDrop!",
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
        description: "Your Solidity code has been generated.",
      });
      setTimeout(() => {
        outputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        variant: "destructive",
        title: "Code Generation Error!",
        description: (error as Error).message || "An unexpected error occurred while generating the code.",
      });
      setGeneratedCode(''); 
      setActiveTemplateForOutput(undefined);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isForgeDisabledByLimit, toast, hasDeveloperAccess, usageData, resetAnalyses, getTodayDateString]);


  const handleGetAISuggestions = useCallback(async () => {
    if (!generatedCode || !activeTemplateForOutput) {
      toast({ variant: "destructive", title: "No Code", description: "Generate code first to get AI suggestions." });
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
      toast({ title: "AI Insights Received", description: "Suggestions and security score updated." });
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast({ variant: "destructive", title: "Suggestion Error", description: (error as Error).message });
    } finally {
      setIsGettingSuggestions(false);
    }
  }, [generatedCode, activeTemplateForOutput, toast]);

  const handleEstimateGasCosts = useCallback(async () => {
    if (!generatedCode) {
      toast({ variant: "destructive", title: "No Code", description: "Generate code first to estimate gas." });
      return;
    }
    setIsEstimatingGas(true);
    setGasEstimation(null);
    try {
      const result = await estimateGasCost({ code: generatedCode });
      setGasEstimation(result);
      toast({ title: "Gas Estimation Complete", description: "Gas cost analysis is available." });
    } catch (error) {
      console.error("Error estimating gas costs:", error);
      toast({ variant: "destructive", title: "Gas Estimation Error", description: (error as Error).message });
    } finally {
      setIsEstimatingGas(false);
    }
  }, [generatedCode, toast]);

  const handleGenerateTestCases = useCallback(async () => {
    if (!generatedCode || !activeTemplateForOutput) {
      toast({ variant: "destructive", title: "No Code", description: "Generate code first to create test cases." });
      return;
    }
    setIsGeneratingTestCases(true);
    setGeneratedTestCases('');
    try {
      const contractName = activeTemplateForOutput.id !== 'custom' ? activeTemplateForOutput.name : undefined;
      const result = await generateTestCases({ code: generatedCode, contractName: contractName });
      setGeneratedTestCases(result.testCasesCode);
      toast({ title: "Test Cases Generated", description: "Basic test suite is ready." });
    } catch (error) {
      console.error("Error generating test cases:", error);
      toast({ variant: "destructive", title: "Test Generation Error", description: (error as Error).message });
    } finally {
      setIsGeneratingTestCases(false);
    }
  }, [generatedCode, activeTemplateForOutput, toast]);

  const handleRefineCode = useCallback(async (request: string) => {
    if (!generatedCode || !activeTemplateForOutput) {
      toast({ variant: "destructive", title: "No Code", description: "Generate code before refining." });
      return;
    }
    if (!request.trim()) {
      toast({ variant: "destructive", title: "Empty Request", description: "Please provide refinement instructions." });
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
      toast({ title: "Code Refined", description: "The contract code has been updated." });
    } catch (error) {
      console.error("Error refining code:", error);
      toast({ variant: "destructive", title: "Refinement Error", description: (error as Error).message });
    } finally {
      setIsRefiningCode(false);
    }
  }, [generatedCode, activeTemplateForOutput, toast, resetAnalyses]);

  const handleGenerateDocumentation = useCallback(async () => {
    if (!generatedCode) {
      toast({ variant: "destructive", title: "No Code", description: "Generate code first to add documentation." });
      return;
    }
    setIsGeneratingDocumentation(true);
    resetAnalyses(); 
    try {
      const result = await generateDocumentation({ code: generatedCode });
      setGeneratedCode(result.documentedCode); 
      toast({ title: "Documentation Generated", description: "NatSpec comments added to the code." });
    } catch (error) {
      console.error("Error generating documentation:", error);
      toast({ variant: "destructive", title: "Documentation Error", description: (error as Error).message });
    } finally {
      setIsGeneratingDocumentation(false);
    }
  }, [generatedCode, toast, resetAnalyses]);

  const handleFindAddresses = useCallback(async (query: string) => {
    if (!query.trim()) {
      toast({ variant: "destructive", title: "Empty Query", description: "Please enter a search query." });
      return;
    }
    setIsFindingAddresses(true);
    setAddressResults(null);
    try {
      const result = await getKnownLiquidityPoolInfo({ query });
      setAddressResults(result);
      toast({ title: "Address Search Complete", description: result.summary || "Search results are available." });
    } catch (error) {
      console.error("Error finding addresses:", error);
      toast({ variant: "destructive", title: "Address Search Error", description: (error as Error).message });
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
    toast({ title: "Forge Reset", description: "Configuration and output cleared." });
  }, [resetAnalyses, toast]);

  const anySubActionLoading = isGettingSuggestions || isEstimatingGas || isGeneratingTestCases || isRefiningCode || isGeneratingDocumentation;

  return (
    <div className="min-h-screen text-foreground flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 flex flex-col items-stretch gap-6">
        
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

        {!generatedCode && (
           <Card className="border shadow-sm flex items-center justify-center min-h-[300px]">
            <CardContent className="text-center text-muted-foreground p-6">
                <p className="text-lg font-medium">Forge Your First Contract</p>
                <p className="text-sm">Configure the parameters above and click "Review & Forge" to generate your smart contract. The output and analysis tools will appear here.</p>
            </CardContent>
          </Card>
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
    
