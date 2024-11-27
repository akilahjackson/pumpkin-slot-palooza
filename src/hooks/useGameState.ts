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
    console.log('🎲 Matched positions:', result.matchedPositions);
    
    setGrid(prevGrid => 
      prevGrid.map((row, i) => 
        row.map((cell, j) => ({
          ...cell,
          matched: result.updatedGrid[i][j].matched
        }))
      )
    );
    
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
    if (!grid || grid.length === 0) {
      console.log('⚠️ Grid is empty during result check');
      return;
    }
    
    console.log('🔍 Checking game results');
    console.log('Current grid state:', grid);
    
    const result = checkGameState(grid, baseBet, betMultiplier, onWinningsUpdate);
    console.log('Game state check result:', result);
    
    if (result.hasMatches) {
      console.log('✨ Matches found:', result.matchedPositions);
      handleWinningSequence(result);
    } else {
      console.log('❌ No matches found');
      handleLoseSequence();
    }
    
    setIsSpinning(false);
  }, [grid, baseBet, betMultiplier, onWinningsUpdate, handleWinningSequence, handleLoseSequence]);

  const spin = useCallback(async () => {
    if (isSpinning) {
      console.log('🚫 Spin already in progress');
      return;
    }
    
    console.log('🎰 Starting new spin');
    setIsSpinning(true);
    setIsInitialLoad(false);
    
    setShowLoseDialog(false);
    setShowWinDialog(false);
    setIsBigWin(false);
    setHasWildBonus(false);
    
    audioManager.stopAllSoundEffects();
    audioManager.playBackgroundMusic();
    audioManager.playDropSound();
    
    onWinningsUpdate(-(baseBet * betMultiplier));
    
    const timestamp = Date.now();
    const newGrid = createInitialGrid();
    console.log('New grid generated:', newGrid);
    
    const gridWithAnimations = newGrid.map((row, rowIndex) => 
      row.map((cell, colIndex) => ({
        ...cell,
        key: `${timestamp}-${rowIndex}-${colIndex}`,
        isDropping: true,
        dropDelay: (rowIndex * GRID_SIZE + colIndex) * 100
      }))
    );
    
    console.log('📥 Setting new grid with animations');
    setGrid(gridWithAnimations);
    
    const dropDuration = 600;
    const totalDelay = (GRID_SIZE * GRID_SIZE * 100) + dropDuration;
    
    console.log(`⏳ Waiting ${totalDelay}ms for animations`);
    await new Promise(resolve => setTimeout(resolve, totalDelay));
    
    setGrid(prevGrid => 
      prevGrid.map(row => 
        row.map(cell => ({
          ...cell,
          isDropping: false
        }))
      )
    );
    
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