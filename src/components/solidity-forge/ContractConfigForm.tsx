
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
import { cn } from '@/lib/utils';

export type FormData = Record<string, any>;

interface ParameterGroup {
  title: string;
  parameters: ContractParameter[];
  defaultActive?: boolean;
}

const getParameterGroups = (template: ContractTemplate, isAdvancedMode: boolean): ParameterGroup[] => {
  const visibleParams = template.parameters.filter(p => isAdvancedMode || !p.advancedOnly);
  let groups: ParameterGroup[] = [];
  
  if (template.id === 'erc20') {
    groups = [
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
    ];
  } else if (template.id === 'liquidityPool') {
     groups = [
      { 
        title: 'Pool Setup', 
        parameters: visibleParams.filter(p => ['poolName', 'poolSymbol', 'tokenA_Address', 'tokenB_Address'].includes(p.name)),
        defaultActive: true,
      },
      { 
        title: 'Configuration', 
        parameters: visibleParams.filter(p => ['feeBps', 'accessControl', 'upgradable'].includes(p.name)) 
      },
    ];
  } else if (template.id === 'swapProtocol') {
    groups = [
      {
        title: 'Router Setup',
        parameters: visibleParams.filter(p => ['routerName', 'factoryAddress', 'wethAddress'].includes(p.name)),
        defaultActive: true,
      },
      {
        title: 'Control & Upgrades',
        parameters: visibleParams.filter(p => ['accessControl', 'upgradable'].includes(p.name)),
      }
    ];
  } else if (template.id === 'dao') {
    groups = [
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
    ];
  } else {
     groups = [{ title: 'Parameters', parameters: visibleParams, defaultActive: true }];
  }

  return groups.filter(group => group.parameters.length > 0);
};

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
      rules: { required: param.type !== 'boolean' ? `${param.label} is required.` : false }, 
    };

    return (
      <div key={param.name} className="space-y-2 mb-6"> 
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Label 
                htmlFor={param.name} 
                className={cn(
                  "flex items-center text-base font-bold animate-text-multicolor-glow"
                )} 
              >
                {param.label}
                {param.description && <AlertCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help ml-1.5" />}
              </Label>
            </TooltipTrigger>
            {param.description && <TooltipContent side="top" align="start"><p className="max-w-xs">{param.description}</p></TooltipContent>}
          </Tooltip>
        </TooltipProvider>
        
        {param.type === 'select' && param.options ? (
          <Controller
            {...commonProps}
            defaultValue={param.defaultValue || param.options[0]?.value}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value as string} defaultValue={field.value as string || undefined} disabled={anyPrimaryActionLoading}>
                <SelectTrigger id={param.name} className="glow-border-purple bg-background/70 focus:bg-background">
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
                className="glow-border-purple bg-background/70 focus:bg-background"
                disabled={anyPrimaryActionLoading}
              />
            )}
          />
        ) : param.type === 'boolean' ? (
          <Controller
            {...commonProps}
            defaultValue={param.defaultValue || false}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Switch
                  id={param.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={anyPrimaryActionLoading}
                />
                <Label htmlFor={param.name} className="text-sm text-muted-foreground">
                  {field.value ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
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
                className="glow-border-purple bg-background/70 focus:bg-background"
                disabled={anyPrimaryActionLoading}
              />
            )}
          />
        )}
        {errors[param.name] && <p className="text-xs text-destructive mt-1">{(errors[param.name] as any).message}</p>}
      </div>
    );
  };

  const anyPrimaryActionLoading = isGeneratingCode || isRefiningCode;
  const anySubActionLoading = isGettingSuggestions || isEstimatingGas || isGeneratingTestCases || isRefiningCode;

  const parameterGroups = selectedTemplate ? getParameterGroups(selectedTemplate, isAdvancedMode) : [];

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8"> 
      <div className="text-center mb-8"> 
        <CardTitle className="text-3xl font-headline mb-3 text-glow-primary">Blueprint Your Brilliance</CardTitle>
        <CardDescription className="max-w-md mx-auto text-base text-muted-foreground">
          Sculpt your smart contract's soul. Or, you know, just click randomly. My circuits won't judge. Much.
        </CardDescription>
      </div>

      <div className="space-y-4 mb-8"> 
        <Label 
          htmlFor="contractType" 
          className={cn(
            "text-center block font-bold text-xl animate-text-multicolor-glow"
          )}
        >
          Select Your Destiny (Contract Type)
        </Label>
        <Select onValueChange={handleTemplateChange} defaultValue={selectedTemplate?.id} disabled={anyPrimaryActionLoading}>
          <SelectTrigger id="contractType" className="glow-border-purple bg-background/70 focus:bg-background text-base py-6">
            <SelectValue placeholder="Choose Your Genesis Blueprint" />
          </SelectTrigger>
          <SelectContent>
            {templates.map(template => (
              <SelectItem key={template.id} value={template.id} className="text-base py-3">
                <div className="flex items-center gap-3">
                  <template.icon className="h-5 w-5 text-muted-foreground" />
                  {template.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTemplate && 
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-lg mx-auto">{selectedTemplate.description}</p>
        }
      </div>
      
      {selectedTemplate && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
         <div className="my-8 flex flex-col items-center space-y-3">
            <Label 
              htmlFor="mode-switch" 
              className={cn(
                "text-base font-bold animate-text-multicolor-glow text-center"
              )}
            >
              Complexity Dial:
            </Label>
            <div className="flex items-center space-x-2">
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
          </div>

          {selectedTemplate.id === 'custom' || parameterGroups.length <= 1 ? ( 
            <div className="space-y-6">
              {selectedTemplate.parameters
                .filter(param => isAdvancedMode || !param.advancedOnly) 
                .map(renderParameterInput)}
            </div>
          ) : (
            <Tabs 
              orientation="vertical"
              value={activeTabValue} 
              onValueChange={setActiveTabValue} 
              className="flex flex-col md:flex-row gap-6 md:gap-8 min-h-[300px]" 
            >
              <TabsList className="flex flex-row md:flex-col md:space-y-2 md:w-60 shrink-0 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 bg-transparent p-0">
                {parameterGroups.map((group, groupIndex) => {
                  const tabValue = group.title.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <TabsTrigger 
                      key={tabValue} 
                      value={tabValue}
                      disabled={anyPrimaryActionLoading && activeTabValue !== tabValue}
                      className={cn(
                        "tab-running-lines-border param-tab-trigger w-full justify-start whitespace-nowrap",
                        "data-[state=active]:text-primary-foreground", 
                        "data-[state=inactive]:text-muted-foreground hover:text-foreground"
                      )}
                    >
                       <span className="tab-running-lines-content">
                         {group.title}
                       </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <div className="flex-grow min-w-0 p-1 rounded-md border border-border/20 bg-card/30"> 
                {parameterGroups.map(group => {
                  const tabValue = group.title.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <TabsContent key={tabValue} value={tabValue} className="mt-0 space-y-6 p-4 md:p-6 rounded-md">
                      {group.parameters.length > 0 ? group.parameters.map(renderParameterInput) : <p className="text-base text-muted-foreground p-4 text-center">No parameters in this section for the current mode.</p>}
                    </TabsContent>
                  );
                })}
              </div>
            </Tabs>
          )}


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
            <Button 
              type="submit" 
              disabled={anyPrimaryActionLoading} 
              className="w-full glow-border-primary bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6"
            >
              {isGeneratingCode ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-5 w-5" />
              )}
              Forge Contract
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAISuggestionsClick}
              disabled={!generatedCode || anySubActionLoading}
              className="w-full glow-border-purple hover:bg-accent/10 hover:text-accent-foreground text-lg py-6"
            >
              {isGettingSuggestions ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                 <Brain className="mr-2 h-5 w-5" />
              )}
              AI Scrutiny
            </Button>
             <Button
              type="button"
              variant="outline"
              onClick={handleEstimateGasClick}
              disabled={!generatedCode || anySubActionLoading}
              className="w-full glow-border-purple hover:bg-accent/10 hover:text-accent-foreground text-lg py-6"
            >
              {isEstimatingGas ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                 <Fuel className="mr-2 h-5 w-5" />
              )}
              Query Gas Oracle
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateTestCasesClick}
              disabled={!generatedCode || anySubActionLoading}
              className="w-full glow-border-purple hover:bg-accent/10 hover:text-accent-foreground text-lg py-6"
            >
              {isGeneratingTestCases ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                 <Beaker className="mr-2 h-5 w-5" />
              )}
              Conjure Test Suite
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

