import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import GameGrid from "@/components/GameGrid";

const Index = () => {
  const [betMultiplier, setBetMultiplier] = useState(1);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const baseBet = 0.01; // 0.01 SOL base bet

  const handleMaxBet = () => {
    setBetMultiplier(100);
  };

  const handleWinningsUpdate = (winnings: number) => {
    setTotalWinnings(prev => prev + winnings);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Badge variant="secondary" className="px-4 py-2 text-lg">
          Total Winnings: {totalWinnings.toFixed(3)} SOL
        </Badge>
        
        <div className="w-full max-w-md space-y-4 bg-amber-900/10 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-amber-200">Current Bet: {(baseBet * betMultiplier).toFixed(3)} SOL</span>
            <Button 
              variant="outline" 
              onClick={handleMaxBet}
              className="bg-amber-600 hover:bg-amber-700 text-white border-none"
            >
              Max Bet
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Slider
              value={[betMultiplier]}
              onValueChange={(value) => setBetMultiplier(value[0])}
              min={1}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="min-w-[4rem] text-right text-amber-200">{betMultiplier}x</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <GameGrid 
          betMultiplier={betMultiplier}
          onWinningsUpdate={handleWinningsUpdate}
        />
      </div>
    </div>
  );
};

export default Index;