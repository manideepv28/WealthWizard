import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LocalStorageService } from "@/lib/storage";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const transactionSchema = z.object({
  fundId: z.string().min(1, "Please select a fund"),
  amount: z.string().min(1, "Please enter an amount").transform(val => parseFloat(val)),
  type: z.enum(['buy', 'sell', 'sip']),
  frequency: z.enum(['monthly', 'quarterly', 'weekly']).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'buy' | 'sell' | 'sip';
  onSuccess: () => void;
}

export default function TransactionModal({ isOpen, onClose, type, onSuccess }: TransactionModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const user = AuthService.getCurrentUser();
  const funds = LocalStorageService.getMutualFunds();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type,
      frequency: 'monthly',
    },
  });

  const titles = {
    buy: 'Purchase Fund',
    sell: 'Redeem Fund', 
    sip: 'Start SIP',
  };

  const handleSubmit = async (data: TransactionFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const fund = LocalStorageService.getFundById(parseInt(data.fundId));
      if (!fund) throw new Error('Fund not found');

      const nav = parseFloat(fund.currentNav);
      const units = data.amount / nav;

      // Add transaction
      LocalStorageService.addTransaction({
        userId: user.id,
        fundId: parseInt(data.fundId),
        type: data.type,
        amount: data.amount.toString(),
        units: units.toString(),
        nav: nav.toString(),
        status: 'completed',
      });

      // If it's a SIP, also create SIP plan
      if (data.type === 'sip' && data.frequency) {
        const nextDate = new Date();
        if (data.frequency === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (data.frequency === 'quarterly') {
          nextDate.setMonth(nextDate.getMonth() + 3);
        } else if (data.frequency === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7);
        }

        LocalStorageService.addSipPlan({
          userId: user.id,
          fundId: parseInt(data.fundId),
          amount: data.amount.toString(),
          frequency: data.frequency,
          nextDate,
        });

        // Create alert for SIP
        LocalStorageService.addAlert({
          userId: user.id,
          type: 'sip_due',
          title: 'SIP Started Successfully',
          description: `Your SIP for ${fund.name} (₹${data.amount}/${data.frequency}) has been activated.`,
        });
      }

      toast({
        title: "Success",
        description: `${type === 'sip' ? 'SIP started' : 'Transaction completed'} successfully!`,
      });

      onSuccess();
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{titles[type]}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fundId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fund</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a fund" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {funds.map(fund => (
                        <SelectItem key={fund.id} value={fund.id.toString()}>
                          {fund.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter amount" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === 'sip' && (
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
