import { useState } from "react";
import { Cell } from "../utils/gameTypes";
import { createInitialGrid } from "../utils/gameLogic";
import { GRID_SIZE } from "../utils/gameConstants";
import { checkGameState } from "../utils/gameStateChecks";
import { audioManager } from "../utils/audio";
import { toast } from "@/components/ui/use-toast";
import confetti from 'canvas-confetti';

export const useGameState = (
  baseBet: number,
  betMultiplier: number,
  onWinningsUpdate: (winnings: number) => void
) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showLoseDialog, setShowLoseDialog] = useState(false);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [isBigWin, setIsBigWin] = useState(false);
  const [isDisplayingWin, setIsDisplayingWin] = useState(false);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [hasWildBonus, setHasWildBonus] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  const resetGameState = () => {
    console.log('Resetting game state');
    setShowLoseDialog(false);
    setShowWinDialog(false);
    setIsBigWin(false);
    setIsDisplayingWin(false);
    setHasWildBonus(false);
    setIsSpinning(false);
  };

  const checkPaylines = () => {
    console.log('Checking paylines');
    if (!grid || grid.length === 0) {
      console.error('Cannot check paylines: grid is empty');
      setIsSpinning(false);
      return;
    }

    const result = checkGameState(grid, baseBet, betMultiplier, onWinningsUpdate);
    console.log('Game state check result:', result);
    
    // Update grid with matched positions
    const newGrid = grid.map(row => row.map(cell => ({...cell, matched: false})));
    if (result.hasMatches && result.updatedGrid) {
      result.updatedGrid.forEach((row, i) => {
        row.forEach((cell, j) => {
          newGrid[i][j].matched = cell.matched;
        });
      });
      setGrid(newGrid);
    }
    
    if (!result.hasMatches) {
      console.log('No matches found');
      audioManager.stopBackgroundMusic();
      audioManager.playLoseSound();
      setShowLoseDialog(true);
      setIsSpinning(false);
    } else {
      console.log('Matches found! Displaying win');
      audioManager.stopBackgroundMusic();
      audioManager.playWinSound();
      setIsDisplayingWin(true);
      setTotalWinnings(result.totalWinnings);
      setHasWildBonus(result.hasWildBonus);
      
      if (result.isBigWin) {
        setIsBigWin(true);
        setShowWinDialog(true);
      }
      
      triggerWinningEffects();
      setIsSpinning(false);
    }
  };

  const spin = async () => {
    if (isSpinning) {
      console.log('Spin blocked - already spinning');
      return;
    }
    
    console.log('Starting new spin');
    resetGameState();
    setIsSpinning(true);
    setIsInitialLoad(false);
    
    audioManager.stopAllSoundEffects();
    audioManager.playBackgroundMusic();
    audioManager.playDropSound();
    
    onWinningsUpdate(-(baseBet * betMultiplier));
    
    const timestamp = Date.now();
    const newGrid = createInitialGrid().map((row, rowIndex) => 
      row.map((cell, colIndex) => ({
        ...cell,
        matched: false,
        key: `${timestamp}-${rowIndex}-${colIndex}-${Math.random()}`,
        isDropping: true,
        dropDelay: (rowIndex * GRID_SIZE + colIndex) * 100
      }))
    );
    
    console.log('Generated new grid:', newGrid);
    setGrid(newGrid);
    
    const totalPieces = GRID_SIZE * GRID_SIZE;
    const pieceDelay = 100;
    const totalDelay = totalPieces * pieceDelay;
    
    console.log(`Setting timeout for ${totalDelay}ms before checking paylines`);
    setTimeout(checkPaylines, totalDelay + 500);
  };

  return {
    grid,
    isSpinning,
    showLoseDialog,
    showWinDialog,
    isBigWin,
    totalWinnings,
    hasWildBonus,
    isInitialLoad,
    setShowLoseDialog,
    setShowWinDialog,
    spin,
    setGrid
  };
};