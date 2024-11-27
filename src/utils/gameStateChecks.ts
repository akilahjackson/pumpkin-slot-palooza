import { Cell } from "./gameTypes";
import { PAYLINES } from "./gameConstants";
import { checkPaylineMatch, PaylineCheckResult } from "./paylineChecks";
import { createGameStateSnapshot } from "./verificationUtils";

interface GameCheckResult {
  hasMatches: boolean;
  totalWinnings: number;
  isBigWin: boolean;
  hasWildBonus: boolean;
  highestMultiplier: number;
  updatedGrid: Cell[][];
  matchedPositions: [number, number][];
  verificationDetails: {
    id: string;
    timestamp: string;
    paylineResults: PaylineCheckResult[];
    totalPayout: number;
    gridSnapshot: string;
  };
}

export const checkGameState = (
  grid: Cell[][],
  baseBet: number,
  betMultiplier: number,
  onWinningsUpdate: (winnings: number) => void
): GameCheckResult => {
  console.log('\n🎮 Starting game state check');
  
  const newGrid = grid.map(row => row.map(cell => ({...cell, matched: false})));
  let totalWinnings = 0;
  let highestMultiplier = 0;
  let hasWildBonus = false;
  const allMatchedPositions: [number, number][] = [];
  const paylineResults: PaylineCheckResult[] = [];

  // Check each payline
  PAYLINES.forEach((payline, index) => {
    const result = checkPaylineMatch(payline as [number, number][], newGrid, index);
    paylineResults.push(result);

    if (result.hasMatches) {
      const winAmount = result.winnings * baseBet * betMultiplier;
      totalWinnings += winAmount;
      
      console.log(`\n💎 Win on payline ${index}:`, {
        combination: result.symbolCombination,
        amount: winAmount,
        positions: result.matchedPositions
      });
      
      onWinningsUpdate(winAmount);

      // Mark matched positions on grid
      result.matchedPositions.forEach(([row, col]) => {
        if (newGrid[row] && newGrid[row][col]) {
          newGrid[row][col].matched = true;
          // Only add position if it's not already in the array
          if (!allMatchedPositions.some(([r, c]) => r === row && c === col)) {
            allMatchedPositions.push([row, col]);
          }
        }
      });

      if (result.winnings > highestMultiplier) {
        highestMultiplier = result.winnings;
      }

      if (result.hasWild) {
        hasWildBonus = true;
      }
    }
  });

  const snapshot = createGameStateSnapshot(grid, allMatchedPositions);
  
  console.log('\n📊 Game Check Summary:', {
    totalWin: totalWinnings,
    matchCount: allMatchedPositions.length,
    highestMultiplier,
    hasWildBonus,
    verificationId: snapshot.verificationId
  });

  return {
    hasMatches: allMatchedPositions.length > 0,
    totalWinnings,
    isBigWin: highestMultiplier >= 50,
    hasWildBonus,
    highestMultiplier,
    updatedGrid: newGrid,
    matchedPositions: allMatchedPositions,
    verificationDetails: {
      id: snapshot.verificationId,
      timestamp: snapshot.timestamp,
      paylineResults,
      totalPayout: totalWinnings,
      gridSnapshot: snapshot.gridState
    }
  };
};