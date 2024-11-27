import { useState } from "react";
import { GRID_SIZE, PUMPKIN_TYPES, PAYLINES, GAME_PIECES, WILD_MULTIPLIER } from "../utils/gameConstants";
import { Cell } from "../utils/gameTypes";
import { createInitialGrid, isValidPosition } from "../utils/gameLogic";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import GamePiece from "./GamePiece";
import { audioManager } from "@/utils/audio";

interface GameGridProps {
  betMultiplier: number;
  onWinningsUpdate: (winnings: number) => void;
}

const GameGrid = ({ betMultiplier, onWinningsUpdate }: GameGridProps) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
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

  const calculatePayout = (matchCount: number, hasWild: boolean): number => {
    const basePayout = baseBet * betMultiplier * matchCount;
    return hasWild ? basePayout * WILD_MULTIPLIER : basePayout;
  };

  const spin = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setHasWinningCombination(false);
    audioManager.stopAllSoundEffects();
    
    // Deduct bet amount before spin
    onWinningsUpdate(-(baseBet * betMultiplier));
    console.log('Bet deducted:', -(baseBet * betMultiplier));
    
    const newGrid = createInitialGrid();
    setGrid(newGrid);

    // Wait for grid animation to complete before checking results
    setTimeout(() => {
      const updatedGrid = newGrid.map(row =>
        row.map(cell => ({ ...cell, isDropping: false }))
      );
      setGrid(updatedGrid);
      
      // Check for wins after grid has settled
      setTimeout(() => {
        checkAllPaylines();
        setIsSpinning(false);
      }, 500);
    }, 1000);
  };

  const checkAllPaylines = async (): Promise<boolean> => {
    if (!grid.length) return false;
    
    let hasMatches = false;
    const newGrid = [...grid];
    let currentWinnings = 0;
    
    PAYLINES.forEach((payline) => {
      const validPositions = payline.filter(([row, col]) => 
        isValidPosition(row, col)
      );

      if (validPositions.length < 3) return;

      const symbols = validPositions.map(([row, col]) => newGrid[row][col].type);
      
      for (let i = 0; i < symbols.length - 2; i++) {
        const hasWild = symbols.slice(i, i + 3).includes(GAME_PIECES.WILD);
        const symbolToMatch = symbols[i] === GAME_PIECES.WILD ? symbols[i + 1] : symbols[i];
        
        if (symbolToMatch === GAME_PIECES.WILD) continue;

        let matchCount = 0;
        let j = i;

        while (j < symbols.length && 
              (symbols[j] === symbolToMatch || symbols[j] === GAME_PIECES.WILD)) {
          matchCount++;
          j++;
        }

        if (matchCount >= 3) {
          const payout = calculatePayout(matchCount, hasWild);
          currentWinnings += payout;
          onWinningsUpdate(payout);
          console.log('Win payout:', payout);

          if (!hasMatches) {
            setHasWinningCombination(true);
            audioManager.playWinSound();
          }

          validPositions.slice(i, i + matchCount).forEach(([row, col]) => {
            if (isValidPosition(row, col)) {
              newGrid[row][col].matched = true;
              hasMatches = true;
            }
          });

          toast({
            title: "🌟 Winning Combination!",
            description: `${matchCount} matches with ${payout.toFixed(3)} SOL payout${hasWild ? " (Wild Bonus!)" : ""}`,
            className: "bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900",
          });
        }
      }
    });

    // Only play lose sound after all paylines have been checked and no matches found
    if (!hasMatches && !hasWinningCombination) {
      setTimeout(() => {
        audioManager.playLoseSound();
      }, 1000);
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
    <Card className="p-8 bg-gradient-to-b from-amber-900/10 to-orange-900/10 border-amber-600/20 backdrop-blur-sm">
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
      </div>
    </Card>
  );
};

export default GameGrid;