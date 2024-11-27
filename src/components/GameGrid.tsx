import { useState } from "react";
import { GRID_SIZE, PUMPKIN_TYPES, PAYLINES } from "../utils/gameConstants";
import { Cell } from "../utils/gameTypes";
import { createInitialGrid } from "../utils/gameLogic";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import GamePiece from "./GamePiece";
import { audioManager } from "@/utils/audio";
import { handlePaylineCheck } from "@/utils/paylineUtils";
import GameDialogs from "./GameDialogs";

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
  const [hasWinningCombination, setHasWinningCombination] = useState(false);

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
    setHasWinningCombination(false);
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
        checkAllPaylines();
        setIsSpinning(false);
      }, 500);
    }, 1000);
  };

  const checkAllPaylines = async () => {
    if (!grid.length) return false;
    
    let hasMatches = false;
    const newGrid = [...grid];
    let totalWinnings = 0;
    
    PAYLINES.forEach((payline) => {
      const result = handlePaylineCheck(payline, newGrid, baseBet, betMultiplier);
      if (result.hasMatches) {
        hasMatches = true;
        totalWinnings += result.winnings;
        onWinningsUpdate(result.winnings);
        
        if (!hasWinningCombination) {
          setHasWinningCombination(true);
          // Only show win dialog for big wins (50x bet or more)
          if (result.winnings >= baseBet * betMultiplier * 50) {
            setShowWinDialog(true);
            audioManager.stopBackgroundMusic();
            audioManager.playWinSound();
          }
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

    if (hasMatches) {
      setGrid(newGrid);
      await new Promise(resolve => setTimeout(resolve, 500));
      await handleMatches();
    }

    return hasMatches;
  };

  const handleMatches = async () => {
    const newGrid = [...grid];
    
    for (let col = 0; col < GRID_SIZE; col++) {
      let writeRow = GRID_SIZE - 1;
      
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (!newGrid[row][col].matched) {
          if (writeRow !== row) {
            newGrid[writeRow][col] = {
              ...newGrid[row][col],
              isDropping: true
            };
            newGrid[row][col] = {
              type: Math.floor(Math.random() * PUMPKIN_TYPES.length),
              matched: false,
              key: `${Date.now()}-${Math.random()}`,
              isDropping: true
            };
          }
          writeRow--;
        }
      }
      
      while (writeRow >= 0) {
        newGrid[writeRow][col] = {
          type: Math.floor(Math.random() * PUMPKIN_TYPES.length),
          matched: false,
          key: `${Date.now()}-${Math.random()}`,
          isDropping: true
        };
        writeRow--;
      }
    }
    
    setGrid(newGrid);
    
    setTimeout(() => {
      const updatedGrid = newGrid.map(row =>
        row.map(cell => ({ ...cell, isDropping: false }))
      );
      setGrid(updatedGrid);
      checkAllPaylines();
    }, 300);
  };

  if (!grid.length) {
    initializeGrid();
    return null;
  }

  return (
    <Card className="p-8 bg-gradient-to-b from-amber-900/[0.15] to-orange-900/[0.15] border-amber-600/20 backdrop-blur-sm shadow-xl">
      <div className="space-y-6">
        <div className="game-grid">
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={cell.key}
                className="cell"
              >
                <GamePiece
                  type={PUMPKIN_TYPES[cell.type]}
                  isMatched={cell.matched}
                  isSelected={false}
                  isDropping={cell.isDropping}
                />
              </div>
            ))
          )}
        </div>
        
        <Button
          onClick={spin}
          disabled={isSpinning}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3"
        >
          {isSpinning ? "Spinning..." : "Spin"}
        </Button>

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