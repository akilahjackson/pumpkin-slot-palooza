import { Cell } from "./gameTypes";
import { PAYLINES } from "./gameConstants";
import { handlePaylineCheck } from "./paylineUtils";
import { toast } from "@/components/ui/use-toast";
import { audioManager } from "./audio";

interface GameCheckResult {
  hasMatches: boolean;
  totalWinnings: number;
  isBigWin: boolean;
  hasWildBonus: boolean;
  highestMultiplier: number;
  updatedGrid: Cell[][];
}

export const checkGameState = (
  grid: Cell[][],
  baseBet: number,
  betMultiplier: number,
  onWinningsUpdate: (winnings: number) => void
): GameCheckResult => {
  if (!grid.length) return {
    hasMatches: false,
    totalWinnings: 0,
    isBigWin: false,
    hasWildBonus: false,
    highestMultiplier: 0,
    updatedGrid: grid
  };

  const newGrid = grid.map(row => row.map(cell => ({...cell})));
  let currentTotalWinnings = 0;
  let highestMultiplier = 0;
  let hasWildBonus = false;
  let hasMatches = false;

  // Reset all matches before checking new ones
  newGrid.forEach(row => {
    row.forEach(cell => {
      cell.matched = false;
    });
  });

  // Ensure each payline is properly typed as a tuple array
  PAYLINES.forEach((payline: [number, number][]) => {
    const result = handlePaylineCheck(payline, newGrid, baseBet, betMultiplier);
    console.log('Payline check result:', result);

    if (result.hasMatches) {
      hasMatches = true;
      currentTotalWinnings += result.winnings;
      onWinningsUpdate(result.winnings);

      const multiplier = result.winnings / baseBet;
      console.log('Win multiplier:', multiplier);

      if (multiplier > highestMultiplier) {
        highestMultiplier = multiplier;
      }

      if (result.hasWild) {
        hasWildBonus = true;
      }
    }
  });

  if (hasMatches) {
    toast({
      title: "Winner! 🎉",
      description: `You won ${currentTotalWinnings.toFixed(3)} SOL!${hasWildBonus ? ' (Including Wild Bonus! 🌟)' : ''}`,
      duration: 3000,
    });
  }

  return {
    hasMatches,
    totalWinnings: currentTotalWinnings,
    isBigWin: highestMultiplier >= 50,
    hasWildBonus,
    highestMultiplier,
    updatedGrid: newGrid
  };
};