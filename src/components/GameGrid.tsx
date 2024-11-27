import { useState } from "react";
import { GRID_SIZE, PUMPKIN_TYPES, PAYLINES } from "../utils/gameConstants";
import { Cell } from "../utils/gameTypes";
import { createInitialGrid } from "../utils/gameLogic";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { audioManager } from "@/utils/audio";
import { handlePaylineCheck } from "@/utils/paylineUtils";
import GameDialogs from "./GameDialogs";
import GameBoard from "./GameBoard";
import GameControls from "./GameControls";

interface GameGridProps {
  betMultiplier: number;
  onWinningsUpdate: (winnings: number) => void;
}

const GameGrid = ({ betMultiplier, onWinningsUpdate }: GameGridProps) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showLoseDialog, setShowLoseDialog] = useState(false);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const baseBet = 0.01;

  const initializeGrid = () => {
    const newGrid = createInitialGrid();
    setGrid(newGrid);
    audioManager.playDropSound();
    
    setTimeout(() => {
      const updatedGrid = newGrid.map(row =>
        row.map(cell => ({ ...cell, isDropping: false }))
      );
      setGrid(updatedGrid);
    }, 500);
  };

  const spin = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowLoseDialog(false);
    setShowWinDialog(false);
    audioManager.stopAllSoundEffects();
    audioManager.playBackgroundMusic();
    
    onWinningsUpdate(-(baseBet * betMultiplier));
    console.log('Bet deducted:', -(baseBet * betMultiplier));
    
    const newGrid = createInitialGrid();
    setGrid(newGrid);

    setTimeout(() => {
      const updatedGrid = newGrid.map(row =>
        row.map(cell => ({ ...cell, isDropping: false }))
      );
      setGrid(updatedGrid);
      
      setTimeout(() => {
        checkPaylines();
        setIsSpinning(false);
      }, 500);
    }, 1000);
  };

  const checkPaylines = () => {
    if (!grid.length) return;
    
    let hasMatches = false;
    const newGrid = [...grid];
    let totalWinnings = 0;
    
    PAYLINES.forEach((payline) => {
      const result = handlePaylineCheck(payline, newGrid, baseBet, betMultiplier);
      if (result.hasMatches) {
        hasMatches = true;
        totalWinnings += result.winnings;
        onWinningsUpdate(result.winnings);
        
        // Show win dialog for big wins (50x bet or more)
        if (result.winnings >= baseBet * betMultiplier * 50) {
          setShowWinDialog(true);
          audioManager.stopBackgroundMusic();
          audioManager.playWinSound();
        }

        toast({
          title: "🌟 Winning Combination!",
          description: `${result.matchCount} matches with ${result.winnings.toFixed(3)} SOL payout${result.hasWild ? " (Wild Bonus!)" : ""}`,
          className: "bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900",
        });
      }
    });

    if (!hasMatches) {
      audioManager.stopBackgroundMusic();
      audioManager.playLoseSound();
      setShowLoseDialog(true);
    }

    setGrid(newGrid);
  };

  if (!grid.length) {
    initializeGrid();
    return null;
  }

  return (
    <Card className="bg-transparent border-amber-600/20 backdrop-blur-sm shadow-xl p-8">
      <div className="space-y-6">
        <GameBoard grid={grid} />
        <GameControls onSpin={spin} isSpinning={isSpinning} />
        <GameDialogs
          showLoseDialog={showLoseDialog}
          showWinDialog={showWinDialog}
          onLoseDialogClose={() => setShowLoseDialog(false)}
          onWinDialogClose={() => setShowWinDialog(false)}
        />
      </div>
    </Card>
  );
};

export default GameGrid;