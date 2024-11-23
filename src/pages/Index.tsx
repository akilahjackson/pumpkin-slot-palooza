import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import GameGrid from "@/components/GameGrid";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@/hooks/useWallet";

const Index = () => {
  const { toast } = useToast();
  const { wallet, balance, connectWallet } = useWallet();
  const [isPlaying, setIsPlaying] = useState(false);
  const [betAmount, setBetAmount] = useState(0.01);

  const handlePlay = async () => {
    if (!wallet) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to play",
        variant: "destructive",
      });
      return;
    }

    if (balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough SOL to place this bet",
        variant: "destructive",
      });
      return;
    }

    setIsPlaying(true);
    // Game logic will be implemented here
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-casino-purple to-casino-orange bg-clip-text text-transparent">
            Luna Casino
          </h1>
          <WalletConnect />
        </div>

        <Card className="p-6 bg-opacity-10 backdrop-blur-lg border-casino-purple/20">
          <div className="space-y-6">
            <GameGrid />
            
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Bet Amount (SOL)</p>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min={0.01}
                  step={0.01}
                  className="bg-black/20 border border-casino-purple/20 rounded px-3 py-2 w-32"
                />
              </div>
              
              <Button
                onClick={handlePlay}
                disabled={!wallet || isPlaying}
                className="bg-gradient-to-r from-casino-purple to-casino-orange hover:opacity-90 transition-opacity"
              >
                {isPlaying ? "Playing..." : "Play Now"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;