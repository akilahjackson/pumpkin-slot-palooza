import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import GameDialogs from "./GameDialogs";
import GameBoard from "./GameBoard";
import GameControls from "./GameControls";
import { useGameState } from "@/hooks/useGameState";
import { createInitialGrid } from "@/utils/gameLogic";

interface GameGridProps {
  betMultiplier: number;
  onWinningsUpdate: (winnings: number) => void;
}

const GameGrid = ({ betMultiplier, onWinningsUpdate }: GameGridProps) => {
  const baseBet = 0.01;
  const {
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
  } = useGameState(baseBet, betMultiplier, onWinningsUpdate);

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

  const handleLoseDialogClose = () => {
    console.log('Closing lose dialog');
    setShowLoseDialog(false);
  };

  const handleWinDialogClose = () => {
    console.log('Closing win dialog');
    setShowWinDialog(false);
  };

  return (
    <Card className="bg-transparent border-amber-600/20 backdrop-blur-sm shadow-xl p-8">
      <div className="space-y-6">
        <GameBoard grid={grid} isInitialLoad={isInitialLoad} />
        <GameControls onSpin={spin} isSpinning={isSpinning} />
        <GameDialogs
          showLoseDialog={showLoseDialog}
          showWinDialog={showWinDialog}
          isBigWin={isBigWin}
          winMultiplier={Math.floor(totalWinnings / baseBet)}
          totalWinAmount={totalWinnings}
          hasWildBonus={hasWildBonus}
          onLoseDialogClose={handleLoseDialogClose}
          onWinDialogClose={handleWinDialogClose}
        />
      </div>
    </Card>
  );
};

export default GameGrid;