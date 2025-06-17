
"use client";

import React, { useState, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { ContractParameter } from '@/config/contracts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { explainContractParameter } from '@/ai/flows/explain-contract-parameter';
import { useToast } from "@/hooks/use-toast";

interface ParameterInputDisplayProps {
  param: ContractParameter;
  anyPrimaryActionLoading: boolean;
  contractTypeName: string;
}

const ParameterInputDisplay = React.memo(({
  param,
  anyPrimaryActionLoading,
  contractTypeName,
}: ParameterInputDisplayProps) => {
  const { control, watch, formState: { errors } } = useFormContext();
  const { toast } = useToast();

  const [isExplanationVisible, setIsExplanationVisible] = useState(false);
  const [explanationText, setExplanationText] = useState<string | null>(null);
  const [isFetchingExplanation, setIsFetchingExplanation] = useState(false);

  const fetchExplanation = useCallback(async () => {
    if (!contractTypeName) return;
    setIsFetchingExplanation(true);
    setExplanationText(null);
    try {
      const result = await explainContractParameter({
        parameterName: param.name,
        parameterLabel: param.label,
        contractTypeName: contractTypeName,
        parameterContextDescription: param.description,
      });
      setExplanationText(result.explanation);
    } catch (error) {
      console.error("Error fetching parameter explanation:", error);
      const errorMessage = (error as Error).message || "AI explanation failed.";
      setExplanationText(`Error: ${errorMessage}`);
      toast({ variant: "destructive", title: "Explanation Error", description: errorMessage });
    } finally {
      setIsFetchingExplanation(false);
    }
  }, [param, contractTypeName, toast]);

  const handleToggleExplanation = useCallback(() => {
    const newVisibility = !isExplanationVisible;
    setIsExplanationVisible(newVisibility);
    if (newVisibility && !explanationText && !isFetchingExplanation) {
      fetchExplanation();
    }
  }, [isExplanationVisible, explanationText, isFetchingExplanation, fetchExplanation]);

  let showBasedOnDependency = true;
  if (param.dependsOn) {
    const dependentValue = watch(param.dependsOn);
    if (typeof param.dependsOnValue === 'function') {
      showBasedOnDependency = param.dependsOnValue(dependentValue);
    } else {
      showBasedOnDependency = dependentValue === param.dependsOnValue;
    }
  }
  if (!showBasedOnDependency) return null;

  const commonInputClass = "bg-background/70 focus:bg-background h-9 text-sm";
  const commonProps = {
    name: param.name,
    control: control,
    rules: { required: param.type !== 'boolean' ? `${param.label} is required.` : false },
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={param.name} className="text-sm font-medium text-foreground flex items-center gap-1">
          {param.icon && <param.icon className="h-3.5 w-3.5 text-primary/80" />}
          {param.label}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-primary"
          onClick={handleToggleExplanation}
          aria-label={`Explanation for ${param.label}`}
          disabled={anyPrimaryActionLoading || isFetchingExplanation}
        >
          <Lightbulb className="h-3.5 w-3.5" />
        </Button>
      </div>

      {param.type === 'select' && param.options ? (
        <Controller
          {...commonProps}
          defaultValue={param.defaultValue || param.options[0]?.value}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value as string} defaultValue={field.value as string || undefined} disabled={anyPrimaryActionLoading}>
              <SelectTrigger id={param.name} className={cn(commonInputClass)}>
                <SelectValue placeholder={param.placeholder || `Select ${param.label}`} />
              </SelectTrigger>
              <SelectContent>
                {param.options?.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-sm">{option.label}</SelectItem>
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
              rows={param.rows || 2} // Reduced rows
              {...field}
              className={cn(commonInputClass, "min-h-[4rem]")} // Ensure min-height for textarea
              disabled={anyPrimaryActionLoading}
            />
          )}
        />
      ) : param.type === 'boolean' ? (
        <Controller
          {...commonProps}
          defaultValue={param.defaultValue || false}
          render={({ field }) => (
            <div className="flex items-center space-x-2 h-9">
              <Switch id={param.name} checked={field.value} onCheckedChange={field.onChange} disabled={anyPrimaryActionLoading} />
              <Label htmlFor={param.name} className="text-xs text-muted-foreground">
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
              className={cn(commonInputClass)}
              disabled={anyPrimaryActionLoading}
            />
          )}
        />
      )}
      {errors[param.name] && <p className="text-xs text-destructive mt-0.5">{(errors[param.name] as any).message}</p>}

      {isExplanationVisible && (
        <div className="mt-2 p-2.5 bg-muted/50 border border-border/30 rounded-md text-xs shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-xs font-semibold text-primary flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              AI Explains:
            </h4>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive -mt-1 -mr-1" onClick={() => setIsExplanationVisible(false)} aria-label="Close explanation">
              <XCircle className="h-3 w-3" />
            </Button>
          </div>
          {isFetchingExplanation ? (
            <div className="flex items-center space-x-1.5 text-muted-foreground py-1.5"> <Loader2 className="h-3.5 w-3.5 animate-spin" /> <span>Fetching wisdom...</span> </div>
          ) : explanationText ? (
            <p className="text-foreground leading-normal">{explanationText}</p>
          ) : (
            <p className="text-destructive py-1.5">Explanation unavailable.</p>
          )}
          {param.description && !isFetchingExplanation && ( <p className="text-muted-foreground/70 italic mt-1.5 pt-1.5 border-t border-border/20"> Hint: {param.description} </p> )}
        </div>
      )}
    </div>
  );
});

ParameterInputDisplay.displayName = "ParameterInputDisplay";
export default ParameterInputDisplay;
