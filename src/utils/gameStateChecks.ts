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
  const matchedPositionsSet = new Set<string>();
  const paylineResults: PaylineCheckResult[] = [];

  PAYLINES.forEach((payline, index) => {
    const result = checkPaylineMatch(payline, newGrid, index);
    paylineResults.push(result);

    if (result.hasMatches) {
      const winAmount = result.winnings * baseBet * betMultiplier;
      totalWinnings += winAmount;
      
      console.log(`\n💎 Win on payline ${index}:`, {
        amount: winAmount,
        positions: result.matchedPositions
      });
      
      onWinningsUpdate(winAmount);

      result.matchedPositions.forEach(([row, col]) => {
        if (newGrid[row] && newGrid[row][col]) {
          newGrid[row][col].matched = true;
          matchedPositionsSet.add(`${row},${col}`);
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

  const uniqueMatchedPositions = Array.from(matchedPositionsSet).map(pos => {
    const [row, col] = pos.split(',').map(Number);
    return [row, col] as [number, number];
  }) as [number, number][];

  const snapshot = createGameStateSnapshot(grid, uniqueMatchedPositions);
  
  console.log('\n📊 Game Check Summary:', {
    totalWin: totalWinnings,
    matchCount: uniqueMatchedPositions.length,
    highestMultiplier,
    hasWildBonus,
    verificationId: snapshot.verificationId
  });

  return {
    hasMatches: uniqueMatchedPositions.length > 0,
    totalWinnings,
    isBigWin: highestMultiplier >= 50,
    hasWildBonus,
    highestMultiplier,
    updatedGrid: newGrid,
    matchedPositions: uniqueMatchedPositions,
    verificationDetails: {
      id: snapshot.verificationId,
      timestamp: snapshot.timestamp,
      paylineResults,
      totalPayout: totalWinnings,
      gridSnapshot: snapshot.gridState
    }
  };
};