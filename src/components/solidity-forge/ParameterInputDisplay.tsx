
"use client";

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { ContractParameter } from '@/config/contracts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react'; // Changed from Lightbulb
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ParameterInputDisplayProps {
  param: ContractParameter;
  anyPrimaryActionLoading: boolean;
  contractTypeName: string; // Retained for potential future use, though not directly used now
}

const ParameterInputDisplay = React.memo(({
  param,
  anyPrimaryActionLoading,
  contractTypeName,
}: ParameterInputDisplayProps) => {
  const { control, watch, formState: { errors } } = useFormContext();

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
        <Label htmlFor={param.name} className="text-sm font-medium text-foreground flex items-center gap-1.5">
          {param.icon && <param.icon className="h-3.5 w-3.5 text-primary/80" />}
          {param.label}
        </Label>
        {param.description && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-primary"
                  aria-label={`More information about ${param.label}`}
                  disabled={anyPrimaryActionLoading}
                >
                  <Info className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="end" className="max-w-xs text-xs p-2">
                <p>{param.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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
              rows={param.rows || 2}
              {...field}
              className={cn(commonInputClass, "min-h-[4rem]", "py-2 leading-relaxed")}
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
    </div>
  );
});

ParameterInputDisplay.displayName = "ParameterInputDisplay";
export default ParameterInputDisplay;
