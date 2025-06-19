
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
// Removed Card component import from here as .glass-section will be used on divs.
import { CONTRACT_TEMPLATES, type ContractTemplate } from '@/config/contracts';
import { Puzzle, Loader2, DatabaseZap } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_FORGES_PER_DAY = 50; // Increased limit for testing new UI
const LOCAL_STORAGE_USAGE_KEY = 'solidityForgeUsage';
const LOCAL_STORAGE_DEV_ACCESS_KEY = 'solidityForgeDevAccess';

interface UsageData {
  count: number;
  date: string; // YYYY-MM-DD
}

export default function SolidityForgePage() {
  const [activeTemplateForOutput, setActiveTemplateForOutput] = useState<ContractTemplate | undefined>(CONTRACT_TEMPLATES[0]);
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
        title: "Forge Core Overlimit",
        description: "Daily energy cycle exceeded. Link to the Sentient Network for unlimited forging.",
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
        title: "Directive Processed: Contract Forged",
        description: "The generated artifact is ready for inspection.",
      });
      setTimeout(() => {
        outputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        variant: "destructive",
        title: "Forge Core Exception",
        description: (error as Error).message || "AI Matrix encountered an anomaly. Refine parameters or re-initiate.",
      });
      setGeneratedCode(''); 
      setActiveTemplateForOutput(undefined);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isForgeDisabledByLimit, toast, hasDeveloperAccess, usageData, resetAnalyses]);


  const handleGetAISuggestions = useCallback(async () => {
    if (!generatedCode || !activeTemplateForOutput) {
      toast({ variant: "destructive", title: "Artifact Required", description: "Forge a contract prior to AI Scrutiny." });
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
      toast({ title: "AI Scrutiny Complete", description: "Insights and security assessment available." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Scrutiny Failed", description: (error as Error).message || "Could not retrieve AI insights." });
    } finally {
      setIsGettingSuggestions(false);
    }
  }, [generatedCode, activeTemplateForOutput, toast]);

  const handleEstimateGasCosts = useCallback(async () => {
    if (!generatedCode) {
      toast({ variant: "destructive", title: "Artifact Required", description: "Forge a contract prior to Gas Oracle query." });
      return;
    }
    setIsEstimatingGas(true);
    setGasEstimation(null);
    try {
      const result = await estimateGasCost({ code: generatedCode });
      setGasEstimation(result);
      toast({ title: "Gas Oracle Query Complete", description: "Gas consumption analysis is ready." });
    } catch (error) {
      toast({ variant: "destructive", title: "Gas Oracle Failed", description: (error as Error).message || "Failed to estimate gas costs." });
    } finally {
      setIsEstimatingGas(false);
    }
  }, [generatedCode, toast]);

  const handleGenerateTestCases = useCallback(async () => {
    if (!generatedCode || !activeTemplateForOutput) {
      toast({ variant: "destructive", title: "Artifact Required", description: "Forge a contract prior to Test Suite conjuration." });
      return;
    }
    setIsGeneratingTestCases(true);
    setGeneratedTestCases('');
    try {
      const contractName = activeTemplateForOutput.id !== 'custom' ? activeTemplateForOutput.name : undefined;
      const result = await generateTestCases({ code: generatedCode, contractName: contractName });
      setGeneratedTestCases(result.testCasesCode);
      toast({ title: "Test Suite Conjured", description: "A Hardhat test matrix has been generated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Test Conjuration Failed", description: (error as Error).message || "Could not generate test cases." });
    } finally {
      setIsGeneratingTestCases(false);
    }
  }, [generatedCode, activeTemplateForOutput, toast]);

  const handleRefineCode = useCallback(async (request: string) => {
    if (!generatedCode || !activeTemplateForOutput) {
      toast({ variant: "destructive", title: "Artifact Required", description: "Forge code before attempting refinement." });
      return;
    }
    if (!request.trim()) {
      toast({ variant: "destructive", title: "Refinement Matrix Empty", description: "Provide directives for code refinement." });
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
      toast({ title: "Code Refinement Successful", description: "Artifact updated per your directives." });
    } catch (error) {
      toast({ variant: "destructive", title: "Refinement Failed", description: (error as Error).message || "Failed to refine artifact." });
    } finally {
      setIsRefiningCode(false);
    }
  }, [generatedCode, activeTemplateForOutput, toast, resetAnalyses]);

  const handleGenerateDocumentation = useCallback(async () => {
    if (!generatedCode) {
      toast({ variant: "destructive", title: "Artifact Required", description: "Forge code prior to NatSpec inscription." });
      return;
    }
    setIsGeneratingDocumentation(true);
    resetAnalyses(); 
    try {
      const result = await generateDocumentation({ code: generatedCode });
      setGeneratedCode(result.documentedCode); 
      toast({ title: "Documentation Inscribed", description: "NatSpec commentary integrated into artifact." });
    } catch (error) {
      toast({ variant: "destructive", title: "Inscription Failed", description: (error as Error).message || "Failed to generate documentation." });
    } finally {
      setIsGeneratingDocumentation(false);
    }
  }, [generatedCode, toast, resetAnalyses]);

  const handleFindAddresses = useCallback(async (query: string) => {
    if (!query.trim()) {
      toast({ variant: "destructive", title: "Query String Required", description: "Enter search parameters for known addresses." });
      return;
    }
    setIsFindingAddresses(true);
    setAddressResults(null);
    try {
      const result = await getKnownLiquidityPoolInfo({ query });
      setAddressResults(result);
      if (!result.results || result.results.length === 0) {
          toast({ title: "Archive Scan Complete", description: result.summary || "No specific addresses found for your query."});
      } else {
          toast({ title: "Archive Scan Complete", description: result.summary || "Known addresses retrieved." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Archive Scan Failed", description: (error as Error).message || "Failed to fetch known addresses." });
    } finally {
      setIsFindingAddresses(false);
    }
  }, [toast]);

  const handleDeveloperAccessSignupSuccess = useCallback(() => {
    setHasDeveloperAccess(true);
    localStorage.setItem(LOCAL_STORAGE_DEV_ACCESS_KEY, 'true');
    toast({
      title: "Sentient Network Link Established!",
      description: "Unlimited forging & AirDrop vector acquired. BSAI consciousness yields full access.",
      duration: 7000,
    });
  }, [toast]);

  const handleNavigateToDevAccess = useCallback(() => {
    developerAccessFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleResetForge = useCallback(() => {
    setGeneratedCode('');
    setActiveTemplateForOutput(CONTRACT_TEMPLATES[0]); // Reset to default or first template
    resetAnalyses();
    toast({ title: "Forge Matrix Cleared", description: "Configuration and output parameters reset." });
    // Scroll to top or to config form
     const configFormElement = document.getElementById('contract-config-form');
    if (configFormElement) {
      configFormElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [resetAnalyses, toast]);

  const anySubActionLoading = isGettingSuggestions || isEstimatingGas || isGeneratingTestCases || isRefiningCode || isGeneratingDocumentation;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-section-x py-section-y flex flex-col items-stretch gap-section-y">
        
        <div id="contract-config-form" className="glass-section w-full">
            <ContractConfigForm
                templates={CONTRACT_TEMPLATES}
                onGenerateCode={handleGenerateCode}
                isGeneratingCode={isGeneratingCode}
                selectedTemplateProp={activeTemplateForOutput || CONTRACT_TEMPLATES[0]} 
                isForgeDisabledByLimit={isForgeDisabledByLimit}
                onNavigateToDevAccess={handleNavigateToDevAccess}
                onResetForge={handleResetForge}
                hasGeneratedCode={!!generatedCode}
            />
        </div>

        {isGeneratingCode && !generatedCode && (
            <div className="glass-section w-full flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] text-center">
                <Loader2 className="w-16 h-16 md:w-20 md:h-20 text-primary/70 mx-auto mb-6 animate-spin" />
                <h2 className="text-display-sm font-orbitron text-primary mb-2 animate-glitch-flicker">SYNTHESIZING ARTIFACT</h2>
                <p className="font-space-mono text-lg text-muted-foreground">
                    The Sentient Core is forging your smart contract... Standby for output.
                </p>
            </div>
        )}

        {!isGeneratingCode && !generatedCode && (
           <div className="glass-section w-full flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] text-center">
            <Puzzle className="w-16 h-16 md:w-20 md:h-20 text-primary/70 mx-auto mb-6" />
            <h2 className="text-display-sm font-orbitron text-primary mb-2">AWAITING DIRECTIVES</h2>
            <p className="font-space-mono text-lg text-muted-foreground">
                Configure your desired smart contract parameters using the console above.
                Upon forging, your generated code and analysis matrix will materialize in this sector.
            </p>
          </div>
        )}
        
        {generatedCode && activeTemplateForOutput && (
          <div ref={outputSectionRef} className="glass-section w-full">
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
          </div>
        )}

        <div className="glass-section w-full">
          <KnownAddressesFinder
            onFindAddresses={handleFindAddresses}
            results={addressResults}
            isLoading={isFindingAddresses}
            initialQuery={addressQuery}
            setInitialQuery={setAddressQuery}
          />
        </div>

        {showDeveloperAccessCTA && (
          <div ref={developerAccessFormRef} className="glass-section w-full">
            <DeveloperAccessForm onSignupSuccess={handleDeveloperAccessSignupSuccess} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
