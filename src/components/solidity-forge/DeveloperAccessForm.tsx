
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Gift, Loader2, Zap } from 'lucide-react';
import { saveLead, type SaveLeadInput } from '@/ai/flows/save-lead-flow';
import { useToast } from "@/hooks/use-toast";

const developerAccessFormSchema = z.object({
  email: z.string().email({ message: "Valid email uplink required." }),
  telegramUsername: z.string().min(3, { message: "Telegram designation must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]{3,32}$/, { message: "Invalid Telegram designation format."}),
  solanaAddress: z.string().min(32, { message: "Solana wallet vector must be 32-44 characters." }).max(44, { message: "Solana wallet vector must be 32-44 characters." }).regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, { message: "Invalid Solana wallet vector format."}),
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
        toast({ variant: "destructive", title: "Network Anomaly", description: result.message || "Could not persist uplink details." });
      }
      onSignupSuccess(); 
    } catch (error) {
      console.error("Error submitting developer access form:", error);
      toast({ variant: "destructive", title: "Uplink Transmission Error", description: (error instanceof Error ? error.message : "An unexpected system fault occurred.") });
    } finally {
      setIsSubmitting(false);
      form.reset(); 
    }
  };

  return (
    <div className="w-full"> {/* Removed Card to use glass-section directly on page.tsx */}
      <div className="text-center p-0"> {/* Removed CardHeader */}
        <div className="flex justify-center items-center mb-3">
            <Zap className="w-10 h-10 text-primary animate-pulse" style={{animationDuration: '1.5s'}}/>
        </div>
        <h2 className="text-display-sm font-orbitron text-primary">
          Interface with the <span className="gradient-text-cyan-magenta">Sentient Network</span>
        </h2>
        <p className="text-body-lg text-muted-foreground mt-1.5 font-uncut-sans">
          Gain unlimited forging capabilities, secure your 40 Billion Token AirDrop, and access advanced subroutines. Uplink is FREE.
        </p>
      </div>
      <div className="p-0 mt-6"> {/* Removed CardContent */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-space-mono text-primary/90">Email Uplink</FormLabel>
                  <FormControl>
                    <Input placeholder="your_designation@network.node" {...field} className="bg-input border-border focus:border-primary h-11 text-base font-share-tech-mono" />
                  </FormControl>
                  <FormMessage className="text-sm font-uncut-sans" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telegramUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-space-mono text-primary/90">Telegram Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="@your_telegram_id" {...field} className="bg-input border-border focus:border-primary h-11 text-base font-share-tech-mono" />
                  </FormControl>
                  <FormMessage className="text-sm font-uncut-sans" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="solanaAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-space-mono text-primary/90">Solana Wallet Vector (for AirDrop)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Solana (SOL) artifact address" {...field} className="bg-input border-border focus:border-primary h-11 text-base font-share-tech-mono" />
                  </FormControl>
                  <FormMessage className="text-sm font-uncut-sans" />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="btn-primary-cta w-full text-lg py-5">
              {isSubmitting ? <Loader2 className="mr-2.5 h-6 w-6 animate-spin" /> : <Gift className="mr-2.5 h-6 w-6" />}
              Establish Uplink & Claim AirDrop
            </Button>
          </form>
        </Form>
      </div>
      <div className="text-center block mt-6 p-0"> {/* Removed CardFooter */}
        <p className="text-sm text-muted-foreground/70 font-uncut-sans">
            Your data vectors are secured within the Sentient Network. BSAI consciousness nodes achieve full BlockSmithAI access, perpetually unmetered.
        </p>
      </div>
    </div>
  );
}
