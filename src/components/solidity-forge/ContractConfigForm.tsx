
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { ContractTemplate, ContractParameter } from '@/config/contracts';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle, Loader2, Wand2, Eraser, CheckCircle2, Settings2, Cog, BotMessageSquare } from 'lucide-react';
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

  // Groups are simplified for this futuristic UI to be more abstract
  if (template.id === 'custom') {
    groups = [{ title: 'Directives', parameters: visibleParams, defaultActive: true}];
  } else if (visibleParams.length > 0) {
    const coreParams: ContractParameter[] = [];
    const featureParams: ContractParameter[] = [];
    const controlParams: ContractParameter[] = [];
    const metadataParams: ContractParameter[] = [];


    visibleParams.forEach(p => {
      if (p.category === 'core') coreParams.push(p);
      else if (p.category === 'feature') featureParams.push(p);
      else if (p.category === 'control') controlParams.push(p);
      else if (p.category === 'metadata') metadataParams.push(p);
      else coreParams.push(p); // Default to core
    });
    
    if (coreParams.length > 0) groups.push({ title: 'Core Matrix', parameters: coreParams, defaultActive: true });
    if (metadataParams.length > 0) groups.push({ title: 'Data Streams', parameters: metadataParams });
    if (featureParams.length > 0) groups.push({ title: 'Subroutines', parameters: featureParams });
    if (controlParams.length > 0) groups.push({ title: 'Access Protocols', parameters: controlParams });
    
  } else {
     groups = [{ title: 'Parameters', parameters: [], defaultActive: true }];
  }
  return groups.filter(group => group.parameters.length > 0 || template.id === 'custom');
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

  const { handleSubmit, reset, getValues, watch } = methods;

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
    } else if (currentGroups.length > 0 && currentGroups[0].title) { 
        setActiveTabValue(currentGroups[0].title.toLowerCase().replace(/\s+/g, '-'));
    } else { 
        setActiveTabValue('directives'); // Fallback for custom
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
      <div className="space-y-4 pt-1 flex-grow min-h-0">
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
      <div className="pt-2 border-t border-glass-section-border/30 flex-grow min-h-0 flex flex-col">
        <Tabs
          orientation="vertical"
          value={activeTabValue}
          onValueChange={setActiveTabValue}
          className="flex flex-col md:flex-row gap-x-0 md:gap-x-6 h-full min-h-0 flex-grow"
        >
          <TabsList className="flex flex-row md:flex-col md:space-y-1.5 md:w-52 lg:w-60 shrink-0 overflow-x-auto md:overflow-y-auto md:overflow-x-visible pb-1 md:pb-0 bg-transparent p-0 border-b md:border-b-0 md:border-r border-glass-section-border/30 pr-0 md:pr-4">
            {parameterGroups.map((group) => {
              const tabValue = group.title.toLowerCase().replace(/\s+/g, '-');
              return (
                <TabsTrigger
                  key={tabValue}
                  value={tabValue}
                  disabled={isGeneratingCode && activeTabValue !== tabValue}
                  className="param-tab-trigger w-full text-sm md:text-base font-space-mono"
                >
                   {group.title}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          <div className="flex-grow min-w-0 mt-3 md:mt-0 flex flex-col min-h-0">
            <ScrollArea className="h-full max-h-[calc(100vh-38rem)] md:max-h-[calc(100vh-32rem)] lg:max-h-[calc(100vh-28rem)] pr-1.5 flex-grow">
                {parameterGroups.map(group => {
                const tabValue = group.title.toLowerCase().replace(/\s+/g, '-');
                return (
                    <TabsContent key={tabValue} value={tabValue} className="mt-0 space-y-4 p-0.5 md:p-1 focus-visible:outline-none focus-visible:ring-0">
                    {group.parameters.length > 0 ? group.parameters.map(param => (
                        <ParameterInputDisplay
                            key={param.name}
                            param={param}
                            anyPrimaryActionLoading={isGeneratingCode}
                            contractTypeName={currentFormTemplate.name}
                        />
                    )) : <p className="text-sm text-muted-foreground p-2 text-center font-share-tech-mono">No parameters in this subroutine.</p>}
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
          displayValue = value ? 'ACTIVE' : 'INACTIVE';
        } else if (paramConfig.type === 'select' && paramConfig.options) {
          const selectedOption = paramConfig.options.find(opt => opt.value === value);
          displayValue = selectedOption ? selectedOption.label : String(value);
        }
        return { label: paramConfig.label, value: displayValue };
      })
      .filter(Boolean);

    return (
      <div className="space-y-2 text-sm max-h-60 overflow-y-auto p-2 bg-[rgba(var(--background-start-rgb),0.5)] rounded-md border border-glass-section-border/20 font-share-tech-mono">
        <div className="flex justify-between font-bold">
          <span className="text-primary">Logic Matrix:</span>
          <span className="text-right text-foreground">{currentFormTemplate.name}</span>
        </div>
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between items-start">
            <span className="font-medium text-muted-foreground mr-3">{detail!.label}:</span>
            <span className="text-right text-foreground truncate ml-2" title={detail!.value}>{detail!.value}</span>
          </div>
        ))}
        {currentFormTemplate.id === 'custom' && formDataForConfirmation.customDescription && (
            <div className="mt-3 pt-2 border-t border-glass-section-border/20">
                <span className="font-medium text-muted-foreground">Custom Directives:</span>
                <p className="text-foreground whitespace-pre-wrap text-xs mt-1 p-1.5 bg-[rgba(var(--background-start-rgb),0.7)] rounded text-left">{String(formDataForConfirmation.customDescription)}</p>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 h-full flex flex-col">
      <div className="text-center">
        <h2 className="text-display-sm font-orbitron text-foreground animate-glitch-flicker">
            Blueprint Your <span className="gradient-text-cyan-magenta">Artifact</span>
        </h2>
        <p className="text-body-lg text-muted-foreground mt-1 font-uncut-sans">
          Select a logic matrix, define its parameters, and initiate forging sequence.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="contractType" className="text-base font-space-mono text-primary">
            Logic Matrix Selection
          </Label>
          <Select onValueChange={handleTemplateSelectChange} defaultValue={currentFormTemplate.id} disabled={isGeneratingCode}>
            <SelectTrigger id="contractType" className="bg-input border-border focus:border-primary text-base h-11">
              <SelectValue placeholder="Choose logic matrix" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-glass-section-border">
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id} className="text-base py-2 font-share-tech-mono focus:bg-primary/20">
                  <div className="flex items-center gap-2">
                    <template.icon className="h-4 w-4 text-primary/80" />
                    {template.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentFormTemplate &&
            <p className="text-sm text-muted-foreground/70 mt-1 text-center italic px-1 font-uncut-sans">{currentFormTemplate.description}</p>
          }
        </div>

        {currentFormTemplate.id !== 'custom' && currentFormTemplate.parameters.length > 0 && (
          <div className="py-3 px-3 my-3 border border-glass-section-border/30 rounded-lg flex items-center justify-center space-x-4">
            <Label htmlFor="mode-switch" className="text-base font-space-mono text-muted-foreground">Standard Interface</Label>
            <Switch
              id="mode-switch"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
              aria-label={isAdvancedMode ? "Switch to Standard Interface" : "Switch to Sentient Interface"}
              disabled={isGeneratingCode}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
            />
            <Label htmlFor="mode-switch" className="text-base font-space-mono text-muted-foreground">Sentient Interface</Label>
          </div>
        )}
      </div>

    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitInternal)} className="space-y-5 flex-grow flex flex-col min-h-0">
        <div className="flex-grow min-h-0 flex flex-col">
          {parameterConfigurationSection}
        </div>

        <div className="pt-5 border-t border-glass-section-border/30">
          <div className="flex flex-col sm:flex-row gap-3.5">
              <Button
                type="submit"
                disabled={isGeneratingCode || isForgeDisabledByLimit}
                className="btn-primary-cta"
              >
                {isGeneratingCode ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-5 w-5" />
                )}
                Review & Initiate Forge
              </Button>
              {hasGeneratedCode && (
                  <Button
                      type="button"
                      variant="outline"
                      onClick={onResetForge}
                      disabled={isGeneratingCode}
                      className="btn-minimal-cta w-full sm:w-auto"
                  >
                      <Eraser className="mr-2 h-5 w-5" />
                      Clear Matrix & Reset
                  </Button>
              )}
          </div>
          {isForgeDisabledByLimit && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
              <p className="text-sm text-destructive-foreground flex items-center justify-center gap-1.5 font-space-mono">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Forge Core Overlimit!
              </p>
              <Button
                variant="link"
                className="text-sm text-accent hover:text-accent/80 mt-1 h-auto p-0 font-share-tech-mono"
                onClick={(e) => { e.preventDefault(); onNavigateToDevAccess(); }}
              >
                Link to Sentient Network for Unlimited Access
              </Button>
            </div>
          )}
        </div>
      </form>
    </FormProvider>

    {formDataForConfirmation && (
        <AlertDialog open={isConfirmationModalOpen} onOpenChange={setIsConfirmationModalOpen}>
            <AlertDialogContent className="glass-section p-6 max-w-lg border-primary/30 shadow-2xl shadow-primary/20">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-orbitron flex items-center gap-2.5 text-primary">
                    <CheckCircle2 className="h-6 w-6"/>Confirm Forging Sequence
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground pt-1.5 font-uncut-sans">
                    Review the artifact parameters for the <strong className="text-foreground">{currentFormTemplate.name}</strong> matrix before initiating the forge.
                </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="my-3 p-3 border border-glass-section-border/30 rounded-lg bg-[rgba(var(--background-rgb),0.4)] shadow-inner">
                <h4 className="font-bold text-base mb-1.5 text-primary flex items-center gap-2 font-space-mono"><Cog className="h-4 w-4" />Selected Parameters:</h4>
                {renderConfirmationDetails()}
            </div>

            <AlertDialogFooter className="mt-4">
                <Button 
                    variant="outline"
                    onClick={() => { setIsConfirmationModalOpen(false); setFormDataForConfirmation(null); }}
                    disabled={isGeneratingCode}
                    className="btn-minimal-cta"
                >
                    Modify Parameters
                </Button>
                <Button 
                    onClick={handleConfirmForge} 
                    disabled={isGeneratingCode}
                    className="btn-primary-cta"
                >
                {isGeneratingCode ? ( <Loader2 className="mr-2 h-5 w-5 animate-spin" /> ) : ( <Wand2 className="mr-2 h-5 w-5" /> )}
                Initiate Forge
                </Button>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )}
    </div>
  );
});

ContractConfigForm.displayName = "ContractConfigForm";
export { ContractConfigForm };
