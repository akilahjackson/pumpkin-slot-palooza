import { useState, useCallback } from "react";
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
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [hasWildBonus, setHasWildBonus] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const triggerWinningEffects = useCallback(() => {
    console.log('🎉 Triggering winning effects');
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
  }, []);

  const handleWinningSequence = useCallback((result: any) => {
    console.log('🎯 Starting winning sequence');
    console.log('💰 Win amount:', result.totalWinnings);
    
    setGrid(prevGrid => {
      const newGrid = prevGrid.map((row, i) => 
        row.map((cell, j) => ({
          ...cell,
          matched: result.updatedGrid[i][j].matched
        }))
      );
      return newGrid;
    });
    
    audioManager.stopBackgroundMusic();
    audioManager.playWinSound();
    
    setTotalWinnings(result.totalWinnings);
    setHasWildBonus(result.hasWildBonus);
    
    if (result.isBigWin) {
      console.log('🌟 Big win detected!');
      setIsBigWin(true);
      setShowWinDialog(true);
    }
    
    triggerWinningEffects();
  }, [triggerWinningEffects]);

  const handleLoseSequence = useCallback(() => {
    console.log('😢 No matches - triggering lose sequence');
    audioManager.stopBackgroundMusic();
    audioManager.playLoseSound();
    setShowLoseDialog(true);
  }, []);

  const checkResults = useCallback(() => {
    console.log('🔍 Checking game results');
    const result = checkGameState(grid, baseBet, betMultiplier, onWinningsUpdate);
    
    if (result.hasMatches) {
      handleWinningSequence(result);
    } else {
      handleLoseSequence();
    }
    
    setIsSpinning(false);
  }, [grid, baseBet, betMultiplier, onWinningsUpdate, handleWinningSequence, handleLoseSequence]);

  const spin = useCallback(async () => {
    if (isSpinning) return;
    
    console.log('🎰 Starting new spin');
    setIsSpinning(true);
    setIsInitialLoad(false);
    
    // Reset previous game state
    setShowLoseDialog(false);
    setShowWinDialog(false);
    setIsBigWin(false);
    setHasWildBonus(false);
    
    // Play spin sound effects
    audioManager.stopAllSoundEffects();
    audioManager.playBackgroundMusic();
    audioManager.playDropSound();
    
    // Deduct bet amount
    onWinningsUpdate(-(baseBet * betMultiplier));
    
    // Generate new grid with dropping animations
    const timestamp = Date.now();
    const newGrid = createInitialGrid().map((row, rowIndex) => 
      row.map((cell, colIndex) => ({
        ...cell,
        matched: false,
        key: `${timestamp}-${rowIndex}-${colIndex}`,
        isDropping: true,
        dropDelay: (rowIndex * GRID_SIZE + colIndex) * 100
      }))
    );
    
    console.log('📥 Setting new grid');
    setGrid(newGrid);
    
    // Wait for drop animations to complete
    const dropDuration = 600; // CSS animation duration
    const totalDelay = (GRID_SIZE * GRID_SIZE * 100) + dropDuration;
    
    console.log(`⏳ Waiting ${totalDelay}ms for animations`);
    await new Promise(resolve => setTimeout(resolve, totalDelay));
    
    // Remove dropping states
    setGrid(prevGrid => 
      prevGrid.map(row => 
        row.map(cell => ({
          ...cell,
          isDropping: false
        }))
      )
    );
    
    // Check results after animations complete
    checkResults();
  }, [isSpinning, baseBet, betMultiplier, onWinningsUpdate, checkResults]);

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