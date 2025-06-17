
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { ContractTemplate, ContractParameter } from '@/config/contracts';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle, Loader2, Wand2, Eraser, CheckCircle2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ParameterInputDisplay from './ParameterInputDisplay';

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
        title: 'Project & Social Links',
        parameters: visibleParams.filter(p => ['projectDescription', 'logoUrl', 'websiteUrl', 'twitterHandle', 'telegramLink'].includes(p.name)),
      },
      {
        title: 'Features',
        parameters: visibleParams.filter(p => ['accessControl', 'mintable', 'burnable', 'pausable'].includes(p.name))
      },
      {
        title: 'Economics',
        parameters: visibleParams.filter(p => ['transactionFeePercent', 'feeRecipientAddress', 'maxTransactionAmount'].includes(p.name))
      },
      {
        title: 'Control & Upgrades',
        parameters: visibleParams.filter(p => ['upgradable'].includes(p.name))
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
  isGeneratingCode: boolean;
  selectedTemplateProp?: ContractTemplate;
  isForgeDisabledByLimit: boolean;
  onNavigateToDevAccess: () => void;
  onResetForge: () => void;
  hasGeneratedCode: boolean;
}

const ContractConfigForm = React.memo(({
  templates,
  onGenerateCode,
  isGeneratingCode,
  selectedTemplateProp,
  isForgeDisabledByLimit,
  onNavigateToDevAccess,
  onResetForge,
  hasGeneratedCode,
}: ContractConfigFormProps) => {
  const [currentFormTemplate, setCurrentFormTemplate] = useState<ContractTemplate>(selectedTemplateProp || templates[0]);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [activeTabValue, setActiveTabValue] = useState<string | undefined>(undefined);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [formDataForConfirmation, setFormDataForConfirmation] = useState<FormData | null>(null);

  const methods = useForm<FormData>({
    defaultValues: useMemo(() => {
        const initialTemplate = selectedTemplateProp || templates[0];
        return initialTemplate.parameters.reduce((acc, param) => {
        acc[param.name] = param.defaultValue ?? '';
        return acc;
        }, {} as FormData);
    }, [selectedTemplateProp, templates])
  });

  const { handleSubmit, reset, getValues } = methods;

  const parameterGroups = useMemo(() => getParameterGroups(currentFormTemplate, isAdvancedMode), [currentFormTemplate, isAdvancedMode]);

  useEffect(() => {
    const defaultValues = currentFormTemplate.parameters.reduce((acc, param) => {
      acc[param.name] = param.defaultValue ?? '';
      return acc;
    }, {} as FormData);
    if (currentFormTemplate.id === 'custom' && !defaultValues.customDescription) {
      defaultValues.customDescription = '';
    }
    reset(defaultValues);

    const currentGroups = getParameterGroups(currentFormTemplate, isAdvancedMode);
    const defaultActiveGroup = currentGroups.find(g => g.defaultActive) || (currentGroups.length > 0 ? currentGroups[0] : undefined);
    
    if (defaultActiveGroup) {
        setActiveTabValue(defaultActiveGroup.title.toLowerCase().replace(/\s+/g, '-'));
    } else if (currentGroups.length > 0) { 
        setActiveTabValue(currentGroups[0].title.toLowerCase().replace(/\s+/g, '-'));
    } else { 
        setActiveTabValue(undefined);
    }
  }, [currentFormTemplate, reset, isAdvancedMode]);

  const handleTemplateSelectChange = useCallback((templateId: string) => {
    const newTemplate = templates.find(t => t.id === templateId);
    if (newTemplate) {
      setCurrentFormTemplate(newTemplate);
    }
  },[templates]);

  const onSubmitInternal = useCallback((data: FormData) => {
    const formDataToSubmit = currentFormTemplate.id === 'custom' ? { ...data, customDescription: getValues("customDescription") } : data;
    setFormDataForConfirmation(formDataToSubmit);
    setIsConfirmationModalOpen(true);
  }, [currentFormTemplate, getValues]);

  const handleConfirmForge = useCallback(async () => {
    if (formDataForConfirmation && currentFormTemplate) {
      await onGenerateCode(currentFormTemplate, formDataForConfirmation);
    }
    setIsConfirmationModalOpen(false);
    setFormDataForConfirmation(null);
  }, [onGenerateCode, currentFormTemplate, formDataForConfirmation]);

  const parameterConfigurationSection = (
    currentFormTemplate.id === 'custom' || parameterGroups.length === 0 ? (
      <div className="space-y-3 pt-1 flex-grow min-h-0">
        {currentFormTemplate.parameters
          .filter(param => isAdvancedMode || !param.advancedOnly)
          .map(param => (
            <ParameterInputDisplay
              key={param.name}
              param={param}
              anyPrimaryActionLoading={isGeneratingCode}
              contractTypeName={currentFormTemplate.name}
            />
          ))}
      </div>
    ) : (
      <div className="pt-1 border-t border-border/30 flex-grow min-h-0 flex flex-col">
        <Tabs
          orientation="vertical"
          value={activeTabValue}
          onValueChange={setActiveTabValue}
          className="flex flex-col md:flex-row gap-x-0 md:gap-x-3 h-full min-h-0 flex-grow" 
        >
          <TabsList className="flex flex-row md:flex-col md:space-y-1 md:w-40 lg:w-44 shrink-0 overflow-x-auto md:overflow-y-auto md:overflow-x-visible pb-1 md:pb-0 bg-transparent p-0 border-b md:border-b-0 md:border-r border-border/30 pr-0 md:pr-2">
            {parameterGroups.map((group) => {
              const tabValue = group.title.toLowerCase().replace(/\s+/g, '-');
              return (
                <TabsTrigger
                  key={tabValue}
                  value={tabValue}
                  disabled={isGeneratingCode && activeTabValue !== tabValue}
                  className="param-tab-trigger w-full text-xs md:text-sm"
                >
                   {group.title}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          <div className="flex-grow min-w-0 rounded-md mt-1 md:mt-0 flex flex-col min-h-0">
            <ScrollArea className="h-full max-h-[calc(100vh-28rem)] md:max-h-[calc(100vh-23rem)] lg:max-h-[calc(100vh-20rem)] pr-0.5 flex-grow">
                {parameterGroups.map(group => {
                const tabValue = group.title.toLowerCase().replace(/\s+/g, '-');
                return (
                    <TabsContent key={tabValue} value={tabValue} className="mt-0 space-y-3 p-1.5 md:p-2 rounded-md focus-visible:outline-none focus-visible:ring-0">
                    {group.parameters.length > 0 ? group.parameters.map(param => (
                        <ParameterInputDisplay
                            key={param.name}
                            param={param}
                            anyPrimaryActionLoading={isGeneratingCode}
                            contractTypeName={currentFormTemplate.name}
                        />
                    )) : <p className="text-xs text-muted-foreground p-2 text-center">No parameters in this section.</p>}
                    </TabsContent>
                );
                })}
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    )
  );

  const renderConfirmationDetails = () => {
    if (!formDataForConfirmation || !currentFormTemplate) return null;
    const details = Object.entries(formDataForConfirmation)
      .map(([key, value]) => {
        const paramConfig = currentFormTemplate.parameters.find(p => p.name === key);
        if (!paramConfig || value === '' || value === undefined || value === null || (paramConfig.advancedOnly && !isAdvancedMode && paramConfig.name !== 'customDescription')) return null; 
        
        let displayValue = String(value);
        if (paramConfig.type === 'boolean') {
          displayValue = value ? 'Enabled' : 'Disabled';
        } else if (paramConfig.type === 'select' && paramConfig.options) {
          const selectedOption = paramConfig.options.find(opt => opt.value === value);
          displayValue = selectedOption ? selectedOption.label : String(value);
        }
        return { label: paramConfig.label, value: displayValue };
      })
      .filter(Boolean);

    return (
      <div className="space-y-1 text-xs max-h-52 overflow-y-auto p-1">
        <div className="flex justify-between font-semibold">
          <span className="text-primary">Template:</span>
          <span className="text-right text-foreground">{currentFormTemplate.name}</span>
        </div>
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between">
            <span className="font-medium text-muted-foreground">{detail!.label}:</span>
            <span className="text-right text-foreground truncate ml-2" title={detail!.value}>{detail!.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3 p-3 md:p-4 h-full flex flex-col">
      <CardHeader className="p-0 text-center mb-1">
        <CardTitle className="text-lg md:text-xl font-semibold text-foreground">
            Blueprint Your Brilliance
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Select a template and define its parameters.
        </CardDescription>
      </CardHeader>

      <div className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="contractType" className="text-xs font-medium">
            Contract Type
          </Label>
          <Select onValueChange={handleTemplateSelectChange} defaultValue={currentFormTemplate.id} disabled={isGeneratingCode}>
            <SelectTrigger id="contractType" className="bg-background/70 focus:bg-background text-xs h-9">
              <SelectValue placeholder="Choose contract template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id} className="text-xs py-1.5">
                  <div className="flex items-center gap-1.5">
                    <template.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {template.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentFormTemplate &&
            <p className="text-xs text-muted-foreground/80 mt-0.5 text-center italic px-1">{currentFormTemplate.description}</p>
          }
        </div>

        {currentFormTemplate.id !== 'custom' && currentFormTemplate.parameters.length > 0 && (
          <div className="py-1 flex items-center justify-center space-x-2.5">
            <Label htmlFor="mode-switch" className="text-sm font-medium text-muted-foreground">Basic</Label>
            <Switch
              id="mode-switch"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
              aria-label={isAdvancedMode ? "Switch to Basic Mode" : "Switch to Advanced Mode"}
              disabled={isGeneratingCode}
            />
            <Label htmlFor="mode-switch" className="text-sm font-medium text-muted-foreground">Advanced</Label>
          </div>
        )}
      </div>

    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitInternal)} className="space-y-2 flex-grow flex flex-col min-h-0">
        <div className="flex-grow min-h-0 flex flex-col">
          {parameterConfigurationSection}
        </div>

        <div className="pt-2 border-t border-border/30">
          <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                disabled={isGeneratingCode || isForgeDisabledByLimit}
                className="w-full sm:flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-sm py-2 h-auto"
              >
                {isGeneratingCode ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-1.5 h-4 w-4" />
                )}
                Review & Forge
              </Button>
              {hasGeneratedCode && (
                  <Button
                      type="button"
                      variant="outline"
                      onClick={onResetForge}
                      disabled={isGeneratingCode}
                      className="w-full sm:w-auto text-sm py-2 h-auto"
                  >
                      <Eraser className="mr-1.5 h-4 w-4" />
                      Clear & Reset
                  </Button>
              )}
          </div>
          {isForgeDisabledByLimit && (
            <div className="mt-1.5 p-1.5 bg-destructive/10 border border-destructive/30 rounded-md text-center">
              <p className="text-xs text-destructive-foreground flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3 text-destructive" />
                Daily Forge Limit Reached!
              </p>
              <Button
                variant="link"
                className="text-xs text-accent hover:text-accent/80 mt-0 h-auto p-0"
                onClick={(e) => { e.preventDefault(); onNavigateToDevAccess(); }}
              >
                Get Developer Access
              </Button>
            </div>
          )}
        </div>
      </form>
    </FormProvider>

    {formDataForConfirmation && (
        <AlertDialog open={isConfirmationModalOpen} onOpenChange={setIsConfirmationModalOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="text-base flex items-center gap-1.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary"/>Confirm Your Blueprint
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                    Review your choices for the <strong>{currentFormTemplate.name}</strong> contract before forging.
                </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="my-1 p-2 border border-border/30 rounded-md bg-muted/30 shadow-inner">
                <h4 className="font-semibold text-sm mb-0.5 text-primary">Summary:</h4>
                {renderConfirmationDetails()}
            </div>

            <AlertDialogFooter>
                <AlertDialogCancel 
                    onClick={() => { setIsConfirmationModalOpen(false); setFormDataForConfirmation(null); }}
                    disabled={isGeneratingCode}
                    className="h-8 px-3 text-xs"
                >
                    Edit
                </AlertDialogCancel>
                <AlertDialogAction 
                    onClick={handleConfirmForge} 
                    disabled={isGeneratingCode}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-3 text-xs"
                >
                {isGeneratingCode ? ( <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> ) : ( <Wand2 className="mr-1.5 h-3.5 w-3.5" /> )}
                Confirm & Forge
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )}
    </div>
  );
});

ContractConfigForm.displayName = "ContractConfigForm";
export { ContractConfigForm };
