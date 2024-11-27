import { useState } from "react";
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
  };

  const resetGameState = () => {
    setShowLoseDialog(false);
    setShowWinDialog(false);
    setIsBigWin(false);
    setIsSpinning(false);
    setIsDisplayingWin(false);
    setHasWildBonus(false);
    const newGrid = createInitialGrid();
    setGrid(newGrid);
  };

  const checkPaylines = () => {
    const result = checkGameState(grid, baseBet, betMultiplier, onWinningsUpdate);
    
    setGrid(result.updatedGrid);
    setIsSpinning(false);

    if (!result.hasMatches) {
      audioManager.stopBackgroundMusic();
      audioManager.playLoseSound();
      setShowLoseDialog(true);
      setTimeout(resetGameState, 1500);
    } else {
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
      setTimeout(resetGameState, 2500);
    }
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
    
    // Create new grid with unique keys for each spin
    const newGrid = createInitialGrid().map(row => 
      row.map(cell => ({
        ...cell,
        key: `${Date.now()}-${Math.random()}`,
        isDropping: true
      }))
    );
    setGrid(newGrid);

    // Check paylines after animation delay
    setTimeout(() => {
      checkPaylines();
    }, (GRID_SIZE * GRID_SIZE * 100) + 500); // Wait for all pieces to appear plus extra delay
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
