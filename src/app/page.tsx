"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/solidity-forge/Header';
import { Footer } from '@/components/solidity-forge/Footer';
import { ContractConfigForm, type FormData } from '@/components/solidity-forge/ContractConfigForm';
import { CodeDisplay, type AISuggestion } from '@/components/solidity-forge/CodeDisplay';
import { useToast } from "@/hooks/use-toast";
import { generateSmartContractCode } from '@/ai/flows/generate-smart-contract-code';
import { suggestErrorPrevention } from '@/ai/flows/suggest-error-prevention';
import { Card, CardContent } from '@/components/ui/card';
import { CONTRACT_TEMPLATES, type ContractTemplate } from '@/config/contracts';

export default function SolidityForgePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | undefined>(
    CONTRACT_TEMPLATES[0] // Default to the first template
  );
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [securityScore, setSecurityScore] = useState<number | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState<boolean>(false);
  const [mainContentVisible, setMainContentVisible] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    // For page load animation
    const timer = setTimeout(() => setMainContentVisible(true), 100); // Short delay before fade-in
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateCode = async (template: ContractTemplate, formData: FormData) => {
    setSelectedTemplate(template);
    setIsGeneratingCode(true);
    setGeneratedCode('');
    setAiSuggestions([]);
    setSecurityScore(null);

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
        title: "Code Generated Successfully!",
        description: "Your Solidity code is ready for review.",
      });
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        variant: "destructive",
        title: "Error Generating Code",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
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
        title: "Cannot Get Suggestions",
        description: "Please generate code first.",
      });
      return;
    }
    setIsGettingSuggestions(true);
    setAiSuggestions([]);
    setSecurityScore(null);

    // Use relevant parameters for AI suggestion
    const paramsForAI = template.id === 'custom' ? { customDescription: formData.customDescription } : formData;

    try {
      const result = await suggestErrorPrevention({
        contractType: template.name,
        parameters: paramsForAI,
        code: generatedCode,
      });
      // Ensure suggestions is an array, even if the AI returns a single string by mistake
      const suggestionsArray = Array.isArray(result.suggestions) ? result.suggestions : (result.suggestions ? [String(result.suggestions)] : []);
      setAiSuggestions(suggestionsArray.map((s, index) => ({ id: `suggestion-${index}-${Date.now()}`, text: s })));
      setSecurityScore(result.securityScore);
      toast({
        title: "AI Analysis Complete",
        description: "Error prevention and optimization suggestions are now available.",
      });
    } catch (error)
     {
      console.error("Error getting AI suggestions:", error);
      toast({
        variant: "destructive",
        title: "Error Getting AI Suggestions",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsGettingSuggestions(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main 
        className={`flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start transition-opacity duration-700 ease-out ${mainContentVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <Card 
          className="shadow-xl hover:shadow-primary/20 transition-all duration-300 bg-card/80 backdrop-blur-sm animate-fadeInUp"
          style={{ animationDelay: '0.3s' }}
        >
          <CardContent className="p-6">
            <ContractConfigForm
              templates={CONTRACT_TEMPLATES}
              onGenerateCode={handleGenerateCode}
              onGetAISuggestions={handleGetAISuggestions}
              isGeneratingCode={isGeneratingCode}
              isGettingSuggestions={isGettingSuggestions}
              generatedCode={generatedCode}
              selectedTemplateProp={selectedTemplate}
            />
          </CardContent>
        </Card>
        <Card 
          className="shadow-xl hover:shadow-primary/20 transition-all duration-300 bg-card/80 backdrop-blur-sm lg:sticky top-24 animate-fadeInUp"  // Adjusted sticky position
          style={{ animationDelay: '0.5s' }}
        >
          {/* CardContent padding is handled by CodeDisplay for better ScrollArea control */}
          <CodeDisplay
            code={generatedCode}
            suggestions={aiSuggestions}
            securityScore={securityScore}
            isLoadingCode={isGeneratingCode}
            isLoadingSuggestions={isGettingSuggestions}
          />
        </Card>
      </main>
      <Footer />
    </div>
  );
}
