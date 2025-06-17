
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Gift, Loader2 } from 'lucide-react';
import { saveLead, type SaveLeadInput } from '@/ai/flows/save-lead-flow';
import { useToast } from "@/hooks/use-toast";

const developerAccessFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  telegramUsername: z.string().min(3, { message: "Telegram username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]{3,32}$/, { message: "Invalid Telegram username format."}),
  solanaAddress: z.string().min(32, { message: "Solana address must be at least 32 characters." }).max(44, { message: "Solana address must be at most 44 characters." }).regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, { message: "Invalid Solana address format."}),
});

type DeveloperAccessFormData = z.infer<typeof developerAccessFormSchema>;

interface DeveloperAccessFormProps {
  onSignupSuccess: () => void;
}

export function DeveloperAccessForm({ onSignupSuccess }: DeveloperAccessFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<DeveloperAccessFormData>({
    resolver: zodResolver(developerAccessFormSchema),
    defaultValues: { email: "", telegramUsername: "", solanaAddress: "" },
  });

  const onSubmit = async (data: DeveloperAccessFormData) => {
    setIsSubmitting(true);
    try {
      const result = await saveLead(data as SaveLeadInput); 
      if (!result.success) {
        toast({ variant: "destructive", title: "Server Error", description: result.message || "Could not save details." });
      }
      onSignupSuccess(); 
    } catch (error) {
      console.error("Error submitting developer access form:", error);
      toast({ variant: "destructive", title: "Submission Error", description: (error instanceof Error ? error.message : "An unexpected error occurred.") });
    } finally {
      setIsSubmitting(false);
      form.reset(); 
    }
  };

  return (
    <Card className="w-full bg-card/90 backdrop-blur-sm border border-primary/30 shadow-lg">
      <CardHeader className="text-center p-4 md:p-6">
        <div className="flex justify-center items-center mb-2">
            <Gift className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-lg md:text-xl font-semibold text-primary">
          Unlock Elite Developer Access!
        </CardTitle>
        <CardDescription className="text-xs md:text-sm text-muted-foreground mt-1">
          Gain unlimited forging, secure your 40 Billion Token AirDrop, and more. Entry is FREE.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} className="bg-background/70 focus:bg-background h-9 text-sm" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telegramUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Telegram Username</FormLabel>
                  <FormControl>
                    <Input placeholder="@your_telegram" {...field} className="bg-background/70 focus:bg-background h-9 text-sm" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="solanaAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Solana Wallet Address (for AirDrop)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Solana (SOL) address" {...field} className="bg-background/70 focus:bg-background h-9 text-sm" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm py-2.5 h-auto">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}
              Claim Elite Access & AirDrop!
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-center block p-4 md:p-6 pt-0">
        <p className="text-xs text-muted-foreground/80">
            Your details are safe with us. BSAI token holders get full BlockSmithAI access, always free.
        </p>
      </CardFooter>
    </Card>
  );
}
    
