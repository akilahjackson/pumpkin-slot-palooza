import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useWallet = () => {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<any>(null);
  const [balance, setBalance] = useState(0);

  const connectWallet = useCallback(async () => {
    try {
      // Mock wallet connection for now
      console.log("Connecting wallet...");
      setWallet({ address: "mock-address" });
      setBalance(1.5); // Mock balance
      
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to your wallet",
        variant: "destructive",
      });
    }
  }, [toast]);

  const disconnectWallet = useCallback(() => {
    setWallet(null);
    setBalance(0);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  }, [toast]);

  return {
    wallet,
    balance,
    connectWallet,
    disconnectWallet,
  };
};