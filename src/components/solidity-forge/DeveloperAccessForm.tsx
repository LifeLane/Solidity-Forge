
"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Gift, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const developerAccessSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  telegramUsername: z.string().min(3, { message: "Telegram username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]{3,32}$/, { message: "Invalid Telegram username format."}),
  solanaAddress: z.string().min(32, { message: "Solana address must be at least 32 characters." }).max(44, { message: "Solana address must be at most 44 characters." }).regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, { message: "Invalid Solana address format."}),
});

type DeveloperAccessFormData = z.infer<typeof developerAccessSchema>;

interface DeveloperAccessFormProps {
  onSignupSuccess: () => void;
}

export function DeveloperAccessForm({ onSignupSuccess }: DeveloperAccessFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<DeveloperAccessFormData>({
    resolver: zodResolver(developerAccessSchema),
    defaultValues: {
      email: "",
      telegramUsername: "",
      solanaAddress: "",
    },
  });

  const onSubmit = async (data: DeveloperAccessFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Developer Access Signup Data:", data);
    onSignupSuccess();
    setIsSubmitting(false);
    form.reset(); 
  };

  return (
    <Card className={cn("w-full bg-card/80 backdrop-blur-sm glow-border-cyan border")}>
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-3">
            <Gift className="w-10 h-10 animate-text-multicolor-glow" />
        </div>
        <CardTitle className="text-2xl font-headline animate-text-multicolor-glow">
          🚀 UNLOCK ELITE DEVELOPER STATUS!
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          The Forge is calling your name! Obliterate your limits, seize UNLIMITED contract generations, AND secure your exclusive spot for the monumental 40 Billion Token AirDrop. Entry is FREE – claim your future now!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base animate-text-multicolor-glow">Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} className="glow-border-purple bg-background/70 focus:bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telegramUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base animate-text-multicolor-glow">Telegram Username</FormLabel>
                  <FormControl>
                    <Input placeholder="@your_telegram_handle" {...field} className="glow-border-purple bg-background/70 focus:bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="solanaAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base animate-text-multicolor-glow">Solana Wallet Address (for AirDrop)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Solana (SOL) address for the 40 Billion Drop" {...field} className="glow-border-purple bg-background/70 focus:bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full glow-border-primary bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-3">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Gift className="mr-2 h-5 w-5" />
              )}
              Claim My Elite Access & AirDrop!
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-center block">
        <p className="text-xs text-muted-foreground">
            Your details pave the way for coding greatness (and epic rewards). We protect your info like it's the last line of code. P.S. BSAI token holders? You're already legends – the BlockSmithAI universe is yours to command, always free.
        </p>
      </CardFooter>
    </Card>
  );
}
    

