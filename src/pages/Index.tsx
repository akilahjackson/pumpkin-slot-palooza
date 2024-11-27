import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import GameGrid from "@/components/GameGrid";
import { Volume2, VolumeX } from "lucide-react";
import { audioManager } from "@/utils/audio";
import HowToWinDialog from "@/components/HowToWinDialog";

const Index = () => {
  const [betMultiplier, setBetMultiplier] = useState(1);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const baseBet = 0.01;

  useEffect(() => {
    audioManager.playBackgroundMusic();
    return () => {
      audioManager.stopAllSoundEffects();
    };
  }, []);

  const handleMaxBet = () => {
    setBetMultiplier(100);
  };

  const handleWinningsUpdate = (winnings: number) => {
    setTotalWinnings(prev => prev + winnings);
  };

  const toggleMute = () => {
    const newMutedState = audioManager.toggleMute();
    setIsMuted(newMutedState);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6"
      style={{
        backgroundImage: "url('/images/harvest-background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <HowToWinDialog />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="bg-amber-900/50 hover:bg-amber-800/50"
        >
          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </Button>
      </div>

      <Badge 
        variant="secondary" 
        className="px-4 py-2 text-lg bg-white/50 backdrop-blur-sm"
      >
        Total Winnings: {totalWinnings.toFixed(3)} SOL
      </Badge>

      <div className="w-full max-w-2xl mx-auto">
        <GameGrid 
          betMultiplier={betMultiplier}
          onWinningsUpdate={handleWinningsUpdate}
        />
      </div>
      
      <div className="w-full max-w-md space-y-4 bg-amber-900/50 p-6 rounded-lg backdrop-blur-sm">
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
  );
};

export default Index;