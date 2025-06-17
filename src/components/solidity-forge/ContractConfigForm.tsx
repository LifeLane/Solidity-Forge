
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { ContractTemplate, ContractParameter } from '@/config/contracts';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle, ArrowDownCircle, Loader2, Wand2, Eraser, CheckCircle2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ScrambledText } from '@/components/effects/ScrambledText';
import ParameterInputDisplay from './ParameterInputDisplay';
import AnimatedSubtitle from './AnimatedSubtitle';


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
  } else { // For custom and other templates
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

  const subtitleText = "Sculpt your smart contract's soul. Or, you know, just click randomly. My circuits won't judge. Much.";

  const methods = useForm<FormData>({
    defaultValues: useMemo(() => {
        const initialTemplate = selectedTemplateProp || templates[0];
        return initialTemplate.parameters.reduce((acc, param) => {
        acc[param.name] = param.defaultValue ?? '';
        return acc;
        }, {} as FormData);
    }, [selectedTemplateProp, templates])
  });

  const { handleSubmit, reset, getValues, watch } = methods;


  useEffect(() => {
    const defaultValues = currentFormTemplate.parameters.reduce((acc, param) => {
      acc[param.name] = param.defaultValue ?? '';
      return acc;
    }, {} as FormData);
    if (currentFormTemplate.id === 'custom' && !defaultValues.customDescription) {
      defaultValues.customDescription = '';
    }
    reset(defaultValues);

    const groups = getParameterGroups(currentFormTemplate, isAdvancedMode);
    const defaultActiveGroup = groups.find(g => g.defaultActive) || (groups.length > 0 ? groups[0] : undefined);
    
    if (defaultActiveGroup) {
        setActiveTabValue(defaultActiveGroup.title.toLowerCase().replace(/\s+/g, '-'));
    } else if (groups.length > 0) { // Fallback if no defaultActive is found, but groups exist
        setActiveTabValue(groups[0].title.toLowerCase().replace(/\s+/g, '-'));
    } else { // No groups, clear active tab
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

  const parameterGroups = useMemo(() => getParameterGroups(currentFormTemplate, isAdvancedMode), [currentFormTemplate, isAdvancedMode]);

  const parameterConfigurationSection = (
    currentFormTemplate.id === 'custom' || parameterGroups.length === 0 ? (
      <div className="space-y-6 pt-2 border-t border-border/20">
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
      <div className="pt-0 border-t border-border/20 flex-grow min-h-0 flex flex-col">
        <Tabs
          orientation="vertical"
          value={activeTabValue}
          onValueChange={setActiveTabValue}
          className="flex flex-col md:flex-row gap-x-0 md:gap-x-6 h-full min-h-[300px] flex-grow" 
        >
          <TabsList className="flex flex-row md:flex-col md:space-y-1 md:w-48 lg:w-56 shrink-0 overflow-x-auto md:overflow-y-auto md:overflow-x-visible pb-2 md:pb-0 bg-transparent p-0 border-r-0 md:border-r border-border/20 pr-0 md:pr-3 lg:pr-4">
            {parameterGroups.map((group) => {
              const tabValue = group.title.toLowerCase().replace(/\s+/g, '-');
              return (
                <TabsTrigger
                  key={tabValue}
                  value={tabValue}
                  disabled={isGeneratingCode && activeTabValue !== tabValue}
                  className={cn(
                    "tab-running-lines-border param-tab-trigger w-full justify-start text-left text-xs md:text-sm",
                    "px-2.5 py-2 md:px-3 md:py-2.5",
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
          
          <div className="flex-grow min-w-0 rounded-md mt-3 md:mt-0 flex flex-col min-h-0">
            <ScrollArea className="h-full max-h-[calc(100vh-35rem)] md:max-h-[calc(100vh-30rem)] lg:max-h-[calc(100vh-28rem)] pr-1 flex-grow">
                {parameterGroups.map(group => {
                const tabValue = group.title.toLowerCase().replace(/\s+/g, '-');
                return (
                    <TabsContent key={tabValue} value={tabValue} className="mt-0 space-y-5 p-3 md:p-4 rounded-md focus-visible:outline-none focus-visible:ring-0">
                    {group.parameters.length > 0 ? group.parameters.map(param => (
                        <ParameterInputDisplay
                            key={param.name}
                            param={param}
                            anyPrimaryActionLoading={isGeneratingCode}
                            contractTypeName={currentFormTemplate.name}
                        />
                    )) : <p className="text-sm text-muted-foreground p-3 text-center">No parameters in this section for the current mode.</p>}
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
        if (!paramConfig || value === '' || value === undefined || value === null || (paramConfig.advancedOnly && !isAdvancedMode)) return null; 
        
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
      <div className="space-y-1.5 text-sm max-h-60 overflow-y-auto p-1">
        <div className="flex justify-between font-semibold">
          <span className="text-primary">Template:</span>
          <span className="text-right text-foreground">{currentFormTemplate.name}</span>
        </div>
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between">
            <span className="font-medium text-muted-foreground">{detail!.label}:</span>
            <span className="text-right text-foreground">{detail!.value}</span>
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="space-y-4 md:space-y-5 p-4 md:p-6 lg:p-8 h-full flex flex-col">
      <div className="text-center">
        <CardTitle className="text-2xl md:text-3xl font-headline mb-1.5">
            <ScrambledText
                text="Blueprint Your Brilliance"
                className="text-2xl md:text-3xl font-headline animate-text-multicolor-glow"
                revealSpeed={1}
                scrambleInterval={50}
                revealDelay={300}
            />
        </CardTitle>
         <AnimatedSubtitle text={subtitleText} className="text-sm md:text-base" />
      </div>

      <div className="space-y-3 md:space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="contractType"
            className={cn(
              "text-center block font-bold text-base md:text-lg"
            )}
          >
            <span className="animate-text-multicolor-glow">Select Your Destiny</span>
            <br />
            <span className="animate-text-multicolor-glow">(Contract Type)</span>
          </Label>
          <Select onValueChange={handleTemplateSelectChange} defaultValue={currentFormTemplate.id} disabled={isGeneratingCode}>
            <SelectTrigger id="contractType" className="glow-border-purple bg-background/70 focus:bg-background text-sm md:text-base py-2.5 h-auto">
              <SelectValue placeholder="Choose Your Genesis Blueprint" />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id} className="text-sm md:text-base py-1.5">
                  <div className="flex items-center gap-2.5">
                    <template.icon className="h-4 w-4 text-muted-foreground" />
                    {template.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentFormTemplate &&
            <p className="text-xs text-muted-foreground mt-1 text-center max-w-md mx-auto">{currentFormTemplate.description}</p>
          }
        </div>

        {currentFormTemplate.id !== 'custom' && currentFormTemplate.parameters.length > 0 && (
          <div className="mt-3 flex flex-col items-center space-y-1">
            <Label
              htmlFor="mode-switch"
              className={cn(
                "text-xs font-bold text-center"
              )}
            >
              <span className="animate-text-multicolor-glow">Complexity Dial:</span>
            </Label>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-muted-foreground">Basic</span>
              <Switch
                id="mode-switch"
                checked={isAdvancedMode}
                onCheckedChange={setIsAdvancedMode}
                aria-label={isAdvancedMode ? "Switch to Basic Mode" : "Switch to Advanced Mode"}
                disabled={isGeneratingCode}
              />
              <span className="text-xs text-muted-foreground">Advanced</span>
            </div>
          </div>
        )}
      </div>

    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitInternal)} className="space-y-3 md:space-y-4 flex-grow flex flex-col min-h-0">
        <div className="flex-grow min-h-0 flex flex-col">
          {parameterConfigurationSection}
        </div>

        <div className="pt-3 md:pt-4 border-t border-border/20">
          <div className="flex flex-col sm:flex-row gap-2.5">
              <Button
                type="submit"
                disabled={isGeneratingCode || isForgeDisabledByLimit}
                className="w-full sm:flex-1 glow-border-primary bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg py-3 md:py-4"
              >
                {isGeneratingCode ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Review & Forge
              </Button>
              {hasGeneratedCode && (
                  <Button
                      type="button"
                      variant="outline"
                      onClick={onResetForge}
                      disabled={isGeneratingCode}
                      className="w-full sm:w-auto glow-border-purple text-base md:text-lg py-3 md:py-4"
                  >
                      <Eraser className="mr-2 h-4 w-4" />
                      Clear & Reset
                  </Button>
              )}
          </div>
          {isForgeDisabledByLimit && (
            <div className="mt-2.5 p-2.5 bg-destructive/10 border border-destructive/30 rounded-md text-center">
              <p className="text-xs text-destructive-foreground flex items-center justify-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Daily Forge Quota Maxed Out! Don't let your brilliance be capped.
              </p>
              <Button
                variant="link"
                className="text-xs text-accent hover:text-accent/80 mt-0.5 h-auto p-0"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateToDevAccess();
                }}
              >
                Upgrade to Developer Access (Unlimited Forging & AirDrop!)
                <ArrowDownCircle className="ml-1.5 h-3.5 w-3.5"/>
              </Button>
            </div>
          )}
        </div>
      </form>
    </FormProvider>

    {formDataForConfirmation && (
        <AlertDialog open={isConfirmationModalOpen} onOpenChange={setIsConfirmationModalOpen}>
            <AlertDialogContent className="glow-border-cyan">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-xl md:text-2xl text-glow-primary flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6"/>Confirm Your Blueprint
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm md:text-base text-muted-foreground">
                    The Alchemist is ready. Please review your choices for the <strong>{currentFormTemplate.name}</strong> contract before we begin the forging ritual.
                </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="my-3 p-3 border border-border/30 rounded-lg bg-muted/20 shadow-inner">
                <h4 className="font-semibold text-base md:text-lg mb-1.5 text-primary">Summary:</h4>
                {renderConfirmationDetails()}
            </div>

            <AlertDialogFooter>
                <AlertDialogCancel 
                    onClick={() => {
                        setIsConfirmationModalOpen(false);
                        setFormDataForConfirmation(null);
                    }}
                    className="glow-border-purple"
                    disabled={isGeneratingCode}
                >
                    Go Back & Edit
                </AlertDialogCancel>
                <AlertDialogAction 
                    onClick={handleConfirmForge} 
                    disabled={isGeneratingCode}
                    className="glow-border-primary bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                {isGeneratingCode ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                Confirm & Forge Contract
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
