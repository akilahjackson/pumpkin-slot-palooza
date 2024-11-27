import { useState, useEffect } from "react";
import { GRID_SIZE } from "../utils/gameConstants";
import { Cell } from "../utils/gameTypes";
import { createInitialGrid } from "../utils/gameLogic";
import { Card } from "@/components/ui/card";
import { audioManager } from "@/utils/audio";
import GameDialogs from "./GameDialogs";
import GameBoard from "./GameBoard";
import GameControls from "./GameControls";
import confetti from 'canvas-confetti';
import { checkGameState } from "@/utils/gameStateChecks";
import { toast } from "@/components/ui/use-toast";

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
  const [hasWildBonus, setHasWildBonus] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const baseBet = 0.01;

  useEffect(() => {
    if (!grid || grid.length === 0) {
      console.log('Initial grid creation');
      const initialGrid = createInitialGrid();
      setGrid(initialGrid);
      
      toast({
        title: "Welcome to Harvest Slots! 🎮",
        description: "Place your bet and click Spin to start playing!",
        duration: 5000,
      });
    }
  }, []);

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
    
    if (!result.hasMatches) {
      console.log('No matches found');
      audioManager.stopBackgroundMusic();
      audioManager.playLoseSound();
      setShowLoseDialog(true);
      setIsSpinning(false);
      setIsDisplayingWin(false);
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
      
      setGrid(result.updatedGrid);
      triggerWinningEffects();
      setIsSpinning(false);
    }
  };

  const spin = async () => {
    if (isSpinning || isDisplayingWin) {
      console.log('Spin blocked - already spinning or displaying win');
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
    
    const newGrid = createInitialGrid();
    if (!newGrid || newGrid.length === 0) {
      console.error('Failed to create new grid during spin');
      setIsSpinning(false);
      return;
    }

    const gridWithKeys = newGrid.map(row => 
      row.map(cell => ({
        ...cell,
        key: `${Date.now()}-${Math.random()}`,
        isDropping: true
      }))
    );
    
    setGrid(gridWithKeys);
    
    // Calculate total delay based on grid size and piece delay
    const totalPieces = GRID_SIZE * GRID_SIZE;
    const pieceDelay = 100; // 100ms delay per piece
    const totalDelay = totalPieces * pieceDelay;
    
    console.log(`Setting timeout for ${totalDelay}ms before checking paylines`);
    setTimeout(checkPaylines, totalDelay);
  };

  return (
    <Card className="bg-transparent border-amber-600/20 backdrop-blur-sm shadow-xl p-8">
      <div className="space-y-6">
        <GameBoard grid={grid} isInitialLoad={isInitialLoad} />
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