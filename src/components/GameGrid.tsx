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
import confetti from 'canvas-confetti';

interface GameGridProps {
  betMultiplier: number;
  onWinningsUpdate: (winnings: number) => void;
}

const GameGrid = ({ betMultiplier, onWinningsUpdate }: GameGridProps) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showLoseDialog, setShowLoseDialog] = useState(false);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [isBigWin, setIsBigWin] = useState(false);
  const [isDisplayingWin, setIsDisplayingWin] = useState(false);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const baseBet = 0.01;

  const triggerWinningEffects = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500', '#FF8C00']
      });
      
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500', '#FF8C00']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

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

  const resetGameState = () => {
    setShowLoseDialog(false);
    setShowWinDialog(false);
    setIsBigWin(false);
    setIsSpinning(false);
    setIsDisplayingWin(false);
    const newGrid = createInitialGrid();
    setGrid(newGrid);
  };

  const spin = async () => {
    if (isSpinning || isDisplayingWin) return;
    
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
      }, 500);
    }, 1000);
  };

  const checkPaylines = () => {
    if (!grid.length) return;
    
    let hasMatches = false;
    const newGrid = [...grid];
    let currentTotalWinnings = 0;
    let highestMultiplier = 0;
    let hasWildBonus = false;
    
    PAYLINES.forEach((payline) => {
      const result = handlePaylineCheck(payline, newGrid, baseBet, betMultiplier);
      console.log('Payline check result:', result);
      
      if (result.hasMatches) {
        hasMatches = true;
        currentTotalWinnings += result.winnings;
        onWinningsUpdate(result.winnings);
        
        // Calculate the true multiplier based on the base bet only
        const multiplier = result.winnings / baseBet;
        console.log('Win multiplier:', multiplier);
        
        if (multiplier > highestMultiplier) {
          highestMultiplier = multiplier;
        }

        if (result.hasWild) {
          hasWildBonus = true;
        }

        // Show big win dialog for 50x or higher multipliers of the base bet
        const isBigWinAmount = multiplier >= 50;
        if (isBigWinAmount) {
          console.log('Big win detected! Multiplier:', multiplier);
          setIsBigWin(true);
          setShowWinDialog(true);
        }
      }
    });

    setGrid(newGrid);
    setIsSpinning(false);

    if (!hasMatches) {
      audioManager.stopBackgroundMusic();
      audioManager.playLoseSound();
      setShowLoseDialog(true);
      setTimeout(resetGameState, 1500);
    } else {
      audioManager.stopBackgroundMusic();
      audioManager.playWinSound();
      setIsDisplayingWin(true);
      setTotalWinnings(currentTotalWinnings);
      
      toast({
        title: "Winner! 🎉",
        description: `You won ${currentTotalWinnings.toFixed(3)} SOL!${hasWildBonus ? ' (Including Wild Bonus! 🌟)' : ''}`,
        duration: 3000,
      });
      
      if (highestMultiplier >= 50) {
        setIsBigWin(true);
        setShowWinDialog(true);
      }
      
      triggerWinningEffects();
      setTimeout(resetGameState, 2500);
    }
  };

  if (!grid.length) {
    initializeGrid();
    return null;
  }

  return (
    <Card className="bg-transparent border-amber-600/20 backdrop-blur-sm shadow-xl p-8">
      <div className="space-y-6">
        <GameBoard grid={grid} />
        <GameControls onSpin={spin} isSpinning={isSpinning || isDisplayingWin} />
        <GameDialogs
          showLoseDialog={showLoseDialog}
          showWinDialog={showWinDialog}
          isBigWin={isBigWin}
          winMultiplier={Math.floor(totalWinnings / baseBet)}
          totalWinAmount={totalWinnings}
          hasWildBonus={hasWildBonus}
          onLoseDialogClose={() => setShowLoseDialog(false)}
          onWinDialogClose={() => setShowWinDialog(false)}
        />
      </div>
    </Card>
  );
};

export default GameGrid;