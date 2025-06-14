
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { ContractTemplate, ContractParameter } from '@/config/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Loader2, Wand2, Brain, Fuel, Beaker } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type FormData = Record<string, any>;

interface ContractConfigFormProps {
  templates: ContractTemplate[];
  onGenerateCode: (template: ContractTemplate, formData: FormData) => Promise<void>;
  onGetAISuggestions: (template: ContractTemplate, formData: FormData) => Promise<void>;
  onEstimateGasCosts: () => Promise<void>;
  onGenerateTestCases: () => Promise<void>;
  isGeneratingCode: boolean;
  isGettingSuggestions: boolean;
  isEstimatingGas: boolean;
  isGeneratingTestCases: boolean;
  isRefiningCode: boolean;
  generatedCode: string;
  selectedTemplateProp?: ContractTemplate;
}

interface ParameterGroup {
  title: string;
  parameters: ContractParameter[];
  defaultActive?: boolean;
}

const getParameterGroups = (template: ContractTemplate, isAdvancedMode: boolean): ParameterGroup[] => {
  const visibleParams = template.parameters.filter(p => isAdvancedMode || !p.advancedOnly);
  
  if (template.id === 'erc20') {
    return [
      { 
        title: 'Core Details', 
        parameters: visibleParams.filter(p => ['tokenName', 'tokenSymbol', 'initialSupply', 'decimals'].includes(p.name)),
        defaultActive: true,
      },
      { 
        title: 'Features', 
        parameters: visibleParams.filter(p => ['mintable', 'burnable', 'pausable'].includes(p.name)) 
      },
      { 
        title: 'Economics', 
        parameters: visibleParams.filter(p => ['transactionFeePercent', 'feeRecipientAddress', 'maxTransactionAmount'].includes(p.name)) 
      },
      { 
        title: 'Control & Upgrades', 
        parameters: visibleParams.filter(p => ['accessControl', 'upgradable'].includes(p.name)) 
      },
    ].filter(group => group.parameters.length > 0);
  }
  if (template.id === 'liquidityPool') {
     return [
      { 
        title: 'Pool Setup', 
        parameters: visibleParams.filter(p => ['poolName', 'poolSymbol', 'tokenA_Address', 'tokenB_Address'].includes(p.name)),
        defaultActive: true,
      },
      { 
        title: 'Configuration', 
        parameters: visibleParams.filter(p => ['feeBps', 'accessControl', 'upgradable'].includes(p.name)) 
      },
    ].filter(group => group.parameters.length > 0);
  }
  if (template.id === 'swapProtocol') {
    return [
      {
        title: 'Router Setup',
        parameters: visibleParams.filter(p => ['routerName', 'factoryAddress', 'wethAddress'].includes(p.name)),
        defaultActive: true,
      },
      {
        title: 'Control & Upgrades',
        parameters: visibleParams.filter(p => ['accessControl', 'upgradable'].includes(p.name)),
      }
    ].filter(group => group.parameters.length > 0);
  }
  if (template.id === 'dao') {
    return [
       {
        title: 'DAO Basics',
        parameters: visibleParams.filter(p => ['daoName', 'proposalTokenAddress'].includes(p.name)),
        defaultActive: true,
      },
      {
        title: 'Governance Rules',
        parameters: visibleParams.filter(p => ['votingDelay', 'votingPeriod', 'proposalThreshold', 'quorumNumerator'].includes(p.name)),
      },
       {
        title: 'Advanced',
        parameters: visibleParams.filter(p => ['upgradable'].includes(p.name)),
      }
    ].filter(group => group.parameters.length > 0);
  }

  return [{ title: 'Parameters', parameters: visibleParams, defaultActive: true }].filter(group => group.parameters.length > 0);
};


export function ContractConfigForm({
  templates,
  onGenerateCode,
  onGetAISuggestions,
  onEstimateGasCosts,
  onGenerateTestCases,
  isGeneratingCode,
  isGettingSuggestions,
  isEstimatingGas,
  isGeneratingTestCases,
  isRefiningCode,
  generatedCode,
  selectedTemplateProp,
}: ContractConfigFormProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<ContractTemplate | undefined>(selectedTemplateProp || templates[0]);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [activeTabValue, setActiveTabValue] = useState<string | undefined>(undefined);


  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: selectedTemplate?.parameters.reduce((acc, param) => {
      acc[param.name] = param.defaultValue ?? '';
      return acc;
    }, {} as FormData) || {}
  });

  useEffect(() => {
    if (selectedTemplateProp) {
      setSelectedTemplate(selectedTemplateProp);
    }
  }, [selectedTemplateProp]);
  
  useEffect(() => {
    if (selectedTemplate) {
      const defaultValues = selectedTemplate.parameters.reduce((acc, param) => {
        acc[param.name] = param.defaultValue ?? '';
        return acc;
      }, {} as FormData);
      if (selectedTemplate.id === 'custom' && !defaultValues.customDescription) {
        defaultValues.customDescription = ''; 
      }
      reset(defaultValues);
      
      const groups = getParameterGroups(selectedTemplate, isAdvancedMode);
      const defaultActiveGroup = groups.find(g => g.defaultActive) || groups[0];
      if (defaultActiveGroup) {
        setActiveTabValue(defaultActiveGroup.title.toLowerCase().replace(/\s+/g, '-'));
      } else if (groups.length > 0) {
        setActiveTabValue(groups[0].title.toLowerCase().replace(/\s+/g, '-'));
      }
       else {
        setActiveTabValue(undefined);
      }
    }
  }, [selectedTemplate, reset, isAdvancedMode]);

  const currentFormData = watch();

  const handleTemplateChange = (templateId: string) => {
    const newTemplate = templates.find(t => t.id === templateId);
    setSelectedTemplate(newTemplate);
  };

  const onSubmit = async (data: FormData) => {
    if (selectedTemplate) {
      await onGenerateCode(selectedTemplate, data);
    }
  };

  const handleAISuggestionsClick = async () => {
    if (selectedTemplate) {
      await onGetAISuggestions(selectedTemplate, currentFormData);
    }
  };

  const handleEstimateGasClick = async () => {
    await onEstimateGasCosts();
  };

  const handleGenerateTestCasesClick = async () => {
    await onGenerateTestCases();
  };

  const renderParameterInput = (param: ContractParameter) => {
    if (param.dependsOn && (!isAdvancedMode && param.advancedOnly)) {
      const dependentValue = currentFormData[param.dependsOn];
      let shouldShow = false;
      if (typeof param.dependsOnValue === 'function') {
        shouldShow = param.dependsOnValue(dependentValue);
      } else {
        shouldShow = dependentValue === param.dependsOnValue;
      }
      if (!shouldShow) return null;
    }

    const commonProps = {
      name: param.name,
      control: control,
      rules: { required: `${param.label} is required.` },
    };

    return (
      <div key={param.name} className="space-y-2">
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Label htmlFor={param.name} className="flex items-center justify-center gap-1.5">
                {param.label}
                {param.description && <AlertCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />}
              </Label>
            </TooltipTrigger>
            {param.description && <TooltipContent side="right"><p className="max-w-xs">{param.description}</p></TooltipContent>}
          </Tooltip>
        </TooltipProvider>
        
        {param.type === 'select' && param.options ? (
          <Controller
            {...commonProps}
            defaultValue={param.defaultValue || param.options[0]?.value}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value as string} defaultValue={field.value as string || undefined} disabled={anyPrimaryActionLoading}>
                <SelectTrigger id={param.name} className="bg-input/50 focus:bg-input">
                  <SelectValue placeholder={param.placeholder || `Select ${param.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {param.options?.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        ) : param.type === 'textarea' ? (
           <Controller
            {...commonProps}
            defaultValue={param.defaultValue || ''}
            render={({ field }) => (
              <Textarea
                id={param.name}
                placeholder={param.placeholder}
                rows={param.rows || 3}
                {...field}
                className="bg-input/50 focus:bg-input"
                disabled={anyPrimaryActionLoading}
              />
            )}
          />
        ) : (
          <Controller
            {...commonProps}
            defaultValue={param.defaultValue || ''}
            render={({ field }) => (
              <Input
                id={param.name}
                type={param.type === 'number' ? 'number' : 'text'}
                placeholder={param.placeholder}
                {...field}
                className="bg-input/50 focus:bg-input"
                disabled={anyPrimaryActionLoading}
              />
            )}
          />
        )}
        {errors[param.name] && <p className="text-sm text-destructive text-center">{(errors[param.name] as any).message}</p>}
      </div>
    );
  };

  const anyPrimaryActionLoading = isGeneratingCode || isRefiningCode;
  const anySubActionLoading = isGettingSuggestions || isEstimatingGas || isGeneratingTestCases || isRefiningCode;

  const parameterGroups = selectedTemplate ? getParameterGroups(selectedTemplate, isAdvancedMode) : [];

  return (
    <div className="space-y-6 p-6"> 
      <div className="text-center">
        <CardTitle className="text-2xl font-headline mb-1">Configure Your Contract</CardTitle>
        <CardDescription>Define contract parameters. Or don't. See if I care.</CardDescription>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contractType" className="text-center block">Contract Type</Label>
        <Select onValueChange={handleTemplateChange} defaultValue={selectedTemplate?.id} disabled={anyPrimaryActionLoading}>
          <SelectTrigger id="contractType" className="bg-input/50 focus:bg-input">
            <SelectValue placeholder="Select contract type" />
          </SelectTrigger>
          <SelectContent>
            {templates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center gap-2">
                  <template.icon className="h-4 w-4 text-muted-foreground" />
                  {template.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTemplate && <p className="text-sm text-muted-foreground mt-1 text-center">{selectedTemplate.description}</p>}
      </div>

      {selectedTemplate && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-center space-x-2 my-4">
            <Label htmlFor="mode-switch" className="cursor-pointer">Mode:</Label>
            <span className="text-sm text-muted-foreground">Basic</span>
            <Switch
              id="mode-switch"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
              aria-label={isAdvancedMode ? "Switch to Basic Mode" : "Switch to Advanced Mode"}
              disabled={anyPrimaryActionLoading}
            />
            <span className="text-sm text-muted-foreground">Advanced</span>
          </div>

          {selectedTemplate.id === 'custom' || parameterGroups.length <= 1 ? ( 
            <div className="space-y-4">
              {selectedTemplate.parameters
                .filter(param => isAdvancedMode || !param.advancedOnly) 
                .map(renderParameterInput)}
            </div>
          ) : (
            <Tabs 
              value={activeTabValue} 
              onValueChange={setActiveTabValue} 
              className="flex flex-col md:flex-row gap-4 md:gap-6"
            >
              <TabsList 
                className="
                  flex flex-row overflow-x-auto pb-2 
                  md:pb-0 md:overflow-x-visible md:flex-col md:space-y-1 md:w-48 lg:w-56 shrink-0 
                  bg-transparent md:bg-background/30 md:p-3 rounded-lg"
              >
                {parameterGroups.map(group => {
                  const tabValue = group.title.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <TabsTrigger 
                      key={tabValue} 
                      value={tabValue}
                      disabled={anyPrimaryActionLoading && activeTabValue !== tabValue}
                      className="
                        whitespace-nowrap px-3 py-2 text-base font-medium rounded-md transition-all
                        hover:bg-muted/60 hover:text-accent-foreground 
                        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                        data-[state=active]:bg-muted data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-inner
                        md:w-full animate-multicolor-border-glow"
                    >
                      {group.title}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <div className="flex-grow">
                {parameterGroups.map(group => {
                  const tabValue = group.title.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <TabsContent key={tabValue} value={tabValue} className="mt-0 space-y-4">
                      {group.parameters.length > 0 ? group.parameters.map(renderParameterInput) : <p className="text-sm text-muted-foreground p-4 text-center">No parameters in this section for the current mode.</p>}
                    </TabsContent>
                  );
                })}
              </div>
            </Tabs>
          )}


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={anyPrimaryActionLoading} 
              className="w-full hover:shadow-lg hover:scale-105 transition-transform"
            >
              {isGeneratingCode ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Code
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAISuggestionsClick}
              disabled={!generatedCode || anySubActionLoading}
              className="w-full hover:shadow-lg hover:scale-105 transition-transform"
            >
              {isGettingSuggestions ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                 <Brain className="mr-2 h-4 w-4" />
              )}
              AI Suggestions
            </Button>
             <Button
              type="button"
              variant="outline"
              onClick={handleEstimateGasClick}
              disabled={!generatedCode || anySubActionLoading}
              className="w-full hover:shadow-lg hover:scale-105 transition-transform"
            >
              {isEstimatingGas ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                 <Fuel className="mr-2 h-4 w-4" />
              )}
              Estimate Gas Costs
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateTestCasesClick}
              disabled={!generatedCode || anySubActionLoading}
              className="w-full hover:shadow-lg hover:scale-105 transition-transform"
            >
              {isGeneratingTestCases ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                 <Beaker className="mr-2 h-4 w-4" />
              )}
              Generate Test Cases
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
