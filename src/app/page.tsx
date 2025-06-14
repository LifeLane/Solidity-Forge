
"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/solidity-forge/Header';
import { Footer } from '@/components/solidity-forge/Footer';
import { ContractConfigForm, type FormData } from '@/components/solidity-forge/ContractConfigForm';
import { CodeDisplay, type AISuggestion } from '@/components/solidity-forge/CodeDisplay';
import type { EstimateGasCostOutput } from '@/ai/flows/estimate-gas-cost';
import { KnownAddressesFinder } from '@/components/solidity-forge/KnownAddressesFinder';
import { useToast } from "@/hooks/use-toast";
import { generateSmartContractCode } from '@/ai/flows/generate-smart-contract-code';
import { suggestErrorPrevention } from '@/ai/flows/suggest-error-prevention';
import { estimateGasCost } from '@/ai/flows/estimate-gas-cost';
import { getKnownLiquidityPoolInfo, type GetKnownLiquidityPoolInfoOutput } from '@/ai/flows/get-known-liquidity-pool-info';
import { generateTestCases } from '@/ai/flows/generate-test-cases';
import { refineSmartContractCode } from '@/ai/flows/refine-smart-contract-code';
import { Card, CardContent } from '@/components/ui/card';
import { CONTRACT_TEMPLATES, type ContractTemplate } from '@/config/contracts';

export default function SolidityForgePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | undefined>(
    CONTRACT_TEMPLATES[0] // Default to the first template
  );
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

  const [mainContentVisible, setMainContentVisible] = useState(false);

  const [addressQuery, setAddressQuery] = useState<string>('');
  const [addressResults, setAddressResults] = useState<GetKnownLiquidityPoolInfoOutput | null>(null);
  const [isFindingAddresses, setIsFindingAddresses] = useState<boolean>(false);


  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setMainContentVisible(true), 100); 
    return () => clearTimeout(timer);
  }, []);

  const resetAnalyses = () => {
    setAiSuggestions([]);
    setSecurityScore(null);
    setGasEstimation(null);
    setGeneratedTestCases('');
  };

  const handleGenerateCode = async (template: ContractTemplate, formData: FormData) => {
    setSelectedTemplate(template);
    setIsGeneratingCode(true);
    setGeneratedCode('');
    resetAnalyses();

    let description = `Generate a Solidity smart contract for ${template.name}.`;
    if (template.id === 'custom' && formData.customDescription) {
        description = formData.customDescription as string;
    } else {
        description += `
Parameters:`;
        for (const key in formData) {
          if (Object.prototype.hasOwnProperty.call(formData, key) && formData[key] !== undefined && formData[key] !== '') {
            const paramConfig = template.parameters.find(p => p.name === key);
            description += `
- ${paramConfig?.label || key}: ${formData[key]}`;
          }
        }
    }
    if(template.aiPromptEnhancement) {
        description += `

Specific guidance: ${template.aiPromptEnhancement}`;
    }

    try {
      const result = await generateSmartContractCode({ description });
      setGeneratedCode(result.code);
      toast({
        title: "Voila! Code Conjured!",
        description: "Your Solidity masterpiece (or so I assume) is ready. Don't break it.",
      });
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        variant: "destructive",
        title: "Code Generation Failed Miserably",
        description: (error as Error).message || "My AI hamsters are on strike. Try again later.",
      });
      setGeneratedCode('');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleGetAISuggestions = async (template: ContractTemplate, formData: FormData) => {
    if (!generatedCode || !template) {
      toast({
        variant: "destructive",
        title: "Hold Your Horses!",
        description: "Need some code to critique first, don't we? Generate some, then we'll talk.",
      });
      return;
    }
    setIsGettingSuggestions(true);
    setAiSuggestions([]);
    setSecurityScore(null);

    const paramsForAI = template.id === 'custom' ? { customDescription: formData.customDescription } : formData;

    try {
      const result = await suggestErrorPrevention({
        contractType: template.name,
        parameters: paramsForAI,
        code: generatedCode,
      });
      setAiSuggestions(result.suggestions || []); 
      setSecurityScore(result.securityScore);
      toast({
        title: "AI Wisdom Dispensed!",
        description: "My (obviously brilliant) suggestions are ready. Try not to ignore them.",
      });
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast({
        variant: "destructive",
        title: "AI Suggestion Engine Sputtered",
        description: (error as Error).message || "Even my genius has limits. Or maybe your code is just *that* special.",
      });
    } finally {
      setIsGettingSuggestions(false);
    }
  };

  const handleEstimateGasCosts = async () => {
    if (!generatedCode) {
      toast({
        variant: "destructive",
        title: "Patience, Young Padawan!",
        description: "Can't estimate gas on... nothing. Generate code first!",
      });
      return;
    }
    setIsEstimatingGas(true);
    setGasEstimation(null);

    try {
      const result = await estimateGasCost({ code: generatedCode });
      setGasEstimation(result);
      toast({
        title: "Gas Oracle Has Spoken!",
        description: "Behold! My (probably accurate) gas cost estimations.",
      });
    } catch (error) {
      console.error("Error estimating gas costs:", error);
      toast({
        variant: "destructive",
        title: "Gas Estimation Botched",
        description: (error as Error).message || "The gas spirits are uncooperative. Or my crystal ball is cloudy.",
      });
    } finally {
      setIsEstimatingGas(false);
    }
  };

  const handleGenerateTestCases = async () => {
    if (!generatedCode) {
      toast({
        variant: "destructive",
        title: "Easy There, Cowboy!",
        description: "Let's get some code first before we try to test its non-existent glory.",
      });
      return;
    }
    setIsGeneratingTestCases(true);
    setGeneratedTestCases('');
    try {
      const result = await generateTestCases({ code: generatedCode, contractName: selectedTemplate?.name });
      setGeneratedTestCases(result.testCasesCode);
      toast({
        title: "Test Case Magic!",
        description: "Behold, some basic tests. Don't expect them to catch *all* your genius, though.",
      });
    } catch (error) {
      console.error("Error generating test cases:", error);
      toast({
        variant: "destructive",
        title: "Test Generation Fiasco",
        description: (error as Error).message || "My test-writing quill broke. Or your code is untestable. One of those.",
      });
    } finally {
      setIsGeneratingTestCases(false);
    }
  };

  const handleRefineCode = async (request: string) => {
    if (!generatedCode || !selectedTemplate) {
      toast({
        variant: "destructive",
        title: "Cannot Refine Code",
        description: "Dude, I need some code to refine first. Generate some, then we'll talk.",
      });
      return;
    }
    if (!request.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Request",
        description: "Whispering sweet nothings into the void? Give me an actual refinement instruction!",
      });
      return;
    }

    setIsRefiningCode(true);
    resetAnalyses(); 

    try {
      const result = await refineSmartContractCode({
        currentCode: generatedCode,
        refinementRequest: request,
        contractContext: `Contract type: ${selectedTemplate.name}`,
      });
      setGeneratedCode(result.refinedCode);
      toast({
        title: "Code 'Refined'!",
        description: "Alright, I've tinkered with your code. You might want to re-run those analyses – who knows what my genius (or your instructions) did to them!",
      });
    } catch (error) {
      console.error("Error refining code:", error);
      toast({
        variant: "destructive",
        title: "Refinement Malfunction!",
        description: (error as Error).message || "My circuits are frazzled trying to understand that. Please try a different refinement.",
      });
    } finally {
      setIsRefiningCode(false);
    }
  };

  const handleFindAddresses = async (query: string) => {
    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Query",
        description: "Trying to find nothing, are we? Enter a search term, please.",
      });
      return;
    }
    setIsFindingAddresses(true);
    setAddressResults(null);
    try {
      const result = await getKnownLiquidityPoolInfo({ query });
      setAddressResults(result);
      toast({
        title: "Address Search Complete!",
        description: result.summary || "Fetched contract addresses. Or tried to.",
      });
    } catch (error) {
      console.error("Error finding addresses:", error);
      toast({
        variant: "destructive",
        title: "Address Finder Flummoxed",
        description: (error as Error).message || "The address book is currently... indecipherable.",
      });
    } finally {
      setIsFindingAddresses(false);
    }
  };

  const anySubActionLoading = isGettingSuggestions || isEstimatingGas || isGeneratingTestCases || isRefiningCode;

  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <Header />
      <main 
        className={`flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start justify-items-center transition-opacity duration-700 ease-out ${mainContentVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <Card 
          className="transition-all duration-300 bg-card/80 backdrop-blur-sm animate-fadeInUp animate-multicolor-border-glow w-full max-w-2xl" 
          style={{ animationDelay: '0.3s' }}
        >
          <CardContent className="p-0"> {/* Changed p-6 to p-0 */}
            <ContractConfigForm
              templates={CONTRACT_TEMPLATES}
              onGenerateCode={handleGenerateCode}
              onGetAISuggestions={handleGetAISuggestions}
              onEstimateGasCosts={handleEstimateGasCosts}
              onGenerateTestCases={handleGenerateTestCases}
              isGeneratingCode={isGeneratingCode}
              isGettingSuggestions={isGettingSuggestions}
              isEstimatingGas={isEstimatingGas}
              isGeneratingTestCases={isGeneratingTestCases}
              isRefiningCode={isRefiningCode}
              generatedCode={generatedCode}
              selectedTemplateProp={selectedTemplate}
            />
          </CardContent>
        </Card>
        <Card 
          className="transition-all duration-300 bg-card/80 backdrop-blur-sm lg:sticky top-24 animate-fadeInUp animate-multicolor-border-glow w-full max-w-2xl"
          style={{ animationDelay: '0.5s' }}
        >
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
            onRefineCode={handleRefineCode}
            selectedTemplateName={selectedTemplate?.name}
            anySubActionLoading={anySubActionLoading}
          />
        </Card>
        
        <Card 
          className="transition-all duration-300 bg-card/80 backdrop-blur-sm animate-fadeInUp animate-multicolor-border-glow w-full max-w-2xl lg:col-span-2 lg:max-w-4xl justify-self-center"
          style={{ animationDelay: '0.7s' }}
        >
          <CardContent className="p-6">
            <KnownAddressesFinder
              onFindAddresses={handleFindAddresses}
              results={addressResults}
              isLoading={isFindingAddresses}
              initialQuery={addressQuery}
              setInitialQuery={setAddressQuery}
            />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
