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
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [hasWildBonus, setHasWildBonus] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const triggerWinningEffects = () => {
    console.log('🎉 Starting winning effects sequence');
    console.log('💫 Triggering confetti animation');
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
    console.log('✨ Confetti animation started');
  };

  const resetGameState = () => {
    console.log('🔄 Resetting game state');
    console.log('🎮 Clearing previous game dialogs and states');
    setShowLoseDialog(false);
    setShowWinDialog(false);
    setIsBigWin(false);
    setHasWildBonus(false);
  };

  const checkPaylines = async () => {
    console.log('🔍 Starting payline check sequence');
    console.log('📊 Grid state before check:', grid);

    if (!grid || grid.length === 0) {
      console.error('❌ Cannot check paylines: grid is empty');
      setIsSpinning(false);
      return;
    }

    const result = checkGameState(grid, baseBet, betMultiplier, onWinningsUpdate);
    console.log('✨ Game state check result:', result);
    console.log('💰 Total winnings:', result.totalWinnings);
    console.log('🎯 Has matches:', result.hasMatches);
    console.log('🌟 Is big win:', result.isBigWin);
    console.log('🃏 Has wild bonus:', result.hasWildBonus);
    
    if (!result.hasMatches) {
      console.log('😢 No matches found - triggering lose sequence');
      audioManager.stopBackgroundMusic();
      audioManager.playLoseSound();
      setShowLoseDialog(true);
    } else {
      console.log('🎯 Matches found! Starting win sequence');
      console.log('🎲 Updating matched states in grid');
      
      // Update matched states in place
      result.updatedGrid.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell.matched) {
            console.log(`🎯 Marking cell at [${i},${j}] as matched`);
            grid[i][j].matched = true;
          }
          grid[i][j].isDropping = false;
        });
      });
      
      console.log('🔄 Forcing grid re-render while preserving cell references');
      setGrid([...grid]);
      
      console.log('🎵 Playing win sound effects');
      audioManager.stopBackgroundMusic();
      audioManager.playWinSound();
      
      console.log('💰 Setting total winnings:', result.totalWinnings);
      setTotalWinnings(result.totalWinnings);
      setHasWildBonus(result.hasWildBonus);
      
      if (result.isBigWin) {
        console.log('🌟 Big win detected! Triggering special effects');
        setIsBigWin(true);
        setShowWinDialog(true);
      }
      
      console.log('🎊 Starting winning animations sequence');
      triggerWinningEffects();
    }
    
    setIsSpinning(false);
  };

  const spin = async () => {
    if (isSpinning) {
      console.log('⚠️ Spin blocked - already spinning');
      return;
    }
    
    console.log('🎰 Starting new spin sequence');
    resetGameState();
    setIsSpinning(true);
    setIsInitialLoad(false);
    
    console.log('🔊 Playing spin sound effects');
    audioManager.stopAllSoundEffects();
    audioManager.playBackgroundMusic();
    audioManager.playDropSound();
    
    onWinningsUpdate(-(baseBet * betMultiplier));
    
    const timestamp = Date.now();
    console.log('🎲 Generating new grid with dropping animations');
    const newGrid = createInitialGrid().map((row, rowIndex) => 
      row.map((cell, colIndex) => ({
        ...cell,
        matched: false,
        key: `${timestamp}-${rowIndex}-${colIndex}-${Math.random()}`,
        isDropping: true,
        dropDelay: (rowIndex * GRID_SIZE + colIndex) * 100
      }))
    );
    
    console.log('📥 Setting new grid with dropping pieces');
    setGrid(newGrid);
    
    const totalPieces = GRID_SIZE * GRID_SIZE;
    const pieceDelay = 100;
    const totalDelay = totalPieces * pieceDelay;
    
    console.log(`⏳ Waiting ${totalDelay}ms for pieces to drop before checking paylines`);
    await new Promise(resolve => setTimeout(resolve, totalDelay + 500));
    console.log('✅ Drop animation complete, checking paylines');
    await checkPaylines();
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