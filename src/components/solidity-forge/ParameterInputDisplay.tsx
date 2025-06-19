
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
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  const commonInputClass = "bg-input border-border focus:border-primary text-base h-11 font-share-tech-mono"; // From Input component style
  const commonProps = {
    name: param.name,
    control: control,
    rules: { required: param.type !== 'boolean' ? `${param.label} is required.` : false },
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={param.name} className="text-base font-space-mono text-primary/90 flex items-center gap-2">
          {param.icon && <param.icon className="h-4 w-4 text-primary/70" />}
          {param.label}
        </Label>
        {param.description && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  aria-label={`More information about ${param.label}`}
                  disabled={anyPrimaryActionLoading}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="end" className="max-w-sm text-sm p-2.5 bg-popover border-glass-section-border shadow-xl font-uncut-sans">
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
              <SelectContent className="bg-popover border-glass-section-border">
                {param.options?.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-base py-2 font-share-tech-mono focus:bg-primary/20">{option.label}</SelectItem>
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
              rows={param.rows || 3} // Slightly more rows
              {...field}
              className={cn(commonInputClass, "min-h-[6rem]", "py-2.5 leading-relaxed")}
              disabled={anyPrimaryActionLoading}
            />
          )}
        />
      ) : param.type === 'boolean' ? (
        <Controller
          {...commonProps}
          defaultValue={param.defaultValue || false}
          render={({ field }) => (
            <div className="flex items-center space-x-3 h-11">
              <Switch 
                id={param.name} 
                checked={field.value} 
                onCheckedChange={field.onChange} 
                disabled={anyPrimaryActionLoading}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
              />
              <Label htmlFor={param.name} className="text-sm text-muted-foreground font-uncut-sans">
                {field.value ? 'ACTIVE' : 'INACTIVE'}
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
      {errors[param.name] && <p className="text-sm text-destructive mt-1 font-uncut-sans">{(errors[param.name] as any).message}</p>}
    </div>
  );
});

ParameterInputDisplay.displayName = "ParameterInputDisplay";
export default ParameterInputDisplay;
