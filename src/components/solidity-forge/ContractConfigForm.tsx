
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
import { AlertCircle, Loader2, Wand2, Brain, Fuel } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch"; 

export type FormData = Record<string, any>;

interface ContractConfigFormProps {
  templates: ContractTemplate[];
  onGenerateCode: (template: ContractTemplate, formData: FormData) => Promise<void>;
  onGetAISuggestions: (template: ContractTemplate, formData: FormData) => Promise<void>;
  onEstimateGasCosts: () => Promise<void>;
  isGeneratingCode: boolean;
  isGettingSuggestions: boolean;
  isEstimatingGas: boolean;
  generatedCode: string;
  selectedTemplateProp?: ContractTemplate;
}

export function ContractConfigForm({
  templates,
  onGenerateCode,
  onGetAISuggestions,
  onEstimateGasCosts,
  isGeneratingCode,
  isGettingSuggestions,
  isEstimatingGas,
  generatedCode,
  selectedTemplateProp,
}: ContractConfigFormProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<ContractTemplate | undefined>(selectedTemplateProp || templates[0]);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

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
        defaultValues.customDescription = ''; // Ensure customDescription is initialized for custom template
      }
      reset(defaultValues);
    }
  }, [selectedTemplate, reset]);

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

  const renderParameterInput = (param: ContractParameter) => {
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
              <Label htmlFor={param.name} className="flex items-center gap-1.5">
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
              <Select onValueChange={field.onChange} value={field.value as string} defaultValue={field.value as string || undefined}>
                <SelectTrigger id={param.name}>
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
              />
            )}
          />
        )}
        {errors[param.name] && <p className="text-sm text-destructive">{(errors[param.name] as any).message}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CardTitle className="text-2xl font-headline mb-1">Configure Your Contract</CardTitle>
        <CardDescription>Define contract parameters.</CardDescription>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contractType">Contract Type</Label>
        <Select onValueChange={handleTemplateChange} defaultValue={selectedTemplate?.id}>
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
        {selectedTemplate && <p className="text-sm text-muted-foreground mt-1">{selectedTemplate.description}</p>}
      </div>

      {selectedTemplate && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center space-x-2 my-4">
            <Label htmlFor="mode-switch" className="cursor-pointer">Mode:</Label>
            <span className="text-sm text-muted-foreground">Basic</span>
            <Switch
              id="mode-switch"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
              aria-label={isAdvancedMode ? "Switch to Basic Mode" : "Switch to Advanced Mode"}
            />
            <span className="text-sm text-muted-foreground">Advanced</span>
          </div>

          {selectedTemplate.parameters
            .filter(param => isAdvancedMode || !param.advancedOnly) 
            .map(renderParameterInput)}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isGeneratingCode || isGettingSuggestions || isEstimatingGas} 
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
              disabled={!generatedCode || isGettingSuggestions || isGeneratingCode || isEstimatingGas}
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
              disabled={!generatedCode || isEstimatingGas || isGeneratingCode || isGettingSuggestions}
              className="w-full sm:col-span-2 hover:shadow-lg hover:scale-105 transition-transform"
            >
              {isEstimatingGas ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                 <Fuel className="mr-2 h-4 w-4" />
              )}
              Estimate Gas Costs
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
