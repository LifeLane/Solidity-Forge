
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { ContractTemplate, ContractParameter } from '@/config/contracts';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, ArrowDownCircle, Loader2, Wand2, Eraser } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | undefined>(selectedTemplateProp || templates[0]);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [activeTabValue, setActiveTabValue] = useState<string | undefined>(undefined);

  const subtitleText = "Sculpt your smart contract's soul. Or, you know, just click randomly. My circuits won't judge. Much.";

  const methods = useForm<FormData>({
    defaultValues: selectedTemplate?.parameters.reduce((acc, param) => {
      acc[param.name] = param.defaultValue ?? '';
      return acc;
    }, {} as FormData) || {}
  });
  const { handleSubmit, reset } = methods;


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


  const handleTemplateChange = useCallback((templateId: string) => {
    const newTemplate = templates.find(t => t.id === templateId);
    setSelectedTemplate(newTemplate);
  },[templates]);

  const onSubmit = useCallback(async (data: FormData) => {
    if (selectedTemplate) {
      await onGenerateCode(selectedTemplate, data);
    }
  }, [selectedTemplate, onGenerateCode]);

  const parameterGroups = useMemo(() => selectedTemplate ? getParameterGroups(selectedTemplate, isAdvancedMode) : [], [selectedTemplate, isAdvancedMode]);

  const parameterConfigurationSection = selectedTemplate && (
    selectedTemplate.id === 'custom' || parameterGroups.length === 0 ? (
      <div className="space-y-6 pt-6 border-t border-border/20 mt-6">
        {selectedTemplate.parameters
          .filter(param => isAdvancedMode || !param.advancedOnly)
          .map(param => (
            <ParameterInputDisplay
              key={param.name}
              param={param}
              anyPrimaryActionLoading={isGeneratingCode}
              contractTypeName={selectedTemplate.name}
            />
          ))}
      </div>
    ) : (
      <div className="pt-6 border-t border-border/20 mt-6">
        <Tabs
          orientation="vertical"
          value={activeTabValue}
          onValueChange={setActiveTabValue}
          className="flex flex-col md:flex-row gap-6 md:gap-8 min-h-[300px] max-h-[calc(100vh-25rem)]" // Adjusted max-h
        >
          <TabsList className="flex flex-row md:flex-col md:space-y-2 md:w-60 shrink-0 overflow-x-auto md:overflow-y-auto md:overflow-x-visible pb-2 md:pb-0 bg-transparent p-0">
            {parameterGroups.map((group) => {
              const tabValue = group.title.toLowerCase().replace(/\s+/g, '-');
              return (
                <TabsTrigger
                  key={tabValue}
                  value={tabValue}
                  disabled={isGeneratingCode && activeTabValue !== tabValue}
                  className={cn(
                    "tab-running-lines-border param-tab-trigger",
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
          <div className="flex-grow min-w-0 p-1 rounded-md border border-border/20 bg-card/30 h-full overflow-y-auto">
            {parameterGroups.map(group => {
              const tabValue = group.title.toLowerCase().replace(/\s+/g, '-');
              return (
                <TabsContent key={tabValue} value={tabValue} className="mt-0 space-y-6 p-4 md:p-6 rounded-md">
                  {group.parameters.length > 0 ? group.parameters.map(param => (
                     <ParameterInputDisplay
                        key={param.name}
                        param={param}
                        anyPrimaryActionLoading={isGeneratingCode}
                        contractTypeName={selectedTemplate.name}
                      />
                  )) : <p className="text-base text-muted-foreground p-4 text-center">No parameters in this section for the current mode.</p>}
                </TabsContent>
              );
            })}
          </div>
        </Tabs>
      </div>
    )
  );


  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8 h-full flex flex-col">
      <div className="text-center">
        <CardTitle className="text-3xl font-headline mb-3">
            <ScrambledText
                text="Blueprint Your Brilliance"
                className="text-3xl font-headline animate-text-multicolor-glow"
                revealSpeed={1}
                scrambleInterval={50}
                revealDelay={300}
            />
        </CardTitle>
         <AnimatedSubtitle text={subtitleText} />
      </div>

      <div className="space-y-6 mb-6">
        <div className="space-y-3">
          <Label
            htmlFor="contractType"
            className={cn(
              "text-center block font-bold text-xl"
            )}
          >
            <span className="animate-text-multicolor-glow">Select Your Destiny</span>
            <br />
            <span className="animate-text-multicolor-glow">(Contract Type)</span>
          </Label>
          <Select onValueChange={handleTemplateChange} defaultValue={selectedTemplate?.id} disabled={isGeneratingCode}>
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

        {selectedTemplate && selectedTemplate.id !== 'custom' && selectedTemplate.parameters.length > 0 && (
          <div className="mt-6 flex flex-col items-center space-y-2">
            <Label
              htmlFor="mode-switch"
              className={cn(
                "text-base font-bold text-center"
              )}
            >
              <span className="animate-text-multicolor-glow">Complexity Dial:</span>
            </Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Basic</span>
              <Switch
                id="mode-switch"
                checked={isAdvancedMode}
                onCheckedChange={setIsAdvancedMode}
                aria-label={isAdvancedMode ? "Switch to Basic Mode" : "Switch to Advanced Mode"}
                disabled={isGeneratingCode}
              />
              <span className="text-sm text-muted-foreground">Advanced</span>
            </div>
          </div>
        )}
      </div>

    <FormProvider {...methods}>
      {selectedTemplate && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-grow flex flex-col">
          <div className="flex-grow">
            {parameterConfigurationSection}
          </div>

          <div className="pt-6 border-t border-border/20 mt-auto">
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={isGeneratingCode || isForgeDisabledByLimit}
                  className="w-full sm:flex-1 glow-border-primary bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6"
                >
                  {isGeneratingCode ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-5 w-5" />
                  )}
                  {isGeneratingCode ? 'Forging...' : 'Forge Contract'}
                </Button>
                {hasGeneratedCode && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onResetForge}
                        disabled={isGeneratingCode}
                        className="w-full sm:w-auto glow-border-purple text-lg py-6"
                    >
                        <Eraser className="mr-2 h-5 w-5" />
                        Clear & Reset
                    </Button>
                )}
            </div>
            {isForgeDisabledByLimit && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-center">
                <p className="text-sm text-destructive-foreground flex items-center justify-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Daily Forge Quota Maxed Out! Don't let your brilliance be capped.
                </p>
                <Button
                  variant="link"
                  className="text-sm text-accent hover:text-accent/80 mt-1"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToDevAccess();
                  }}
                >
                  Upgrade to Developer Access (Unlimited Forging & AirDrop!)
                  <ArrowDownCircle className="ml-2 h-4 w-4"/>
                </Button>
              </div>
            )}
          </div>
        </form>
      )}
    </FormProvider>
    </div>
  );
});

ContractConfigForm.displayName = "ContractConfigForm";
export { ContractConfigForm };
    