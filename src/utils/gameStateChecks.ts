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
  const matchedPositions: [number, number][] = [];

  PAYLINES.forEach((payline, index) => {
    const result = checkPaylineMatch(payline, newGrid, index);
    
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
          matchedPositions.push([row, col]);
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

  const snapshot = createGameStateSnapshot(grid, matchedPositions);
  
  console.log('\n📊 Game Check Summary:', {
    totalWin: totalWinnings,
    matchCount: matchedPositions.length,
    highestMultiplier,
    hasWildBonus,
    verificationId: snapshot.verificationId
  });

  return {
    hasMatches: matchedPositions.length > 0,
    totalWinnings,
    isBigWin: highestMultiplier >= 50,
    hasWildBonus,
    highestMultiplier,
    updatedGrid: newGrid,
    matchedPositions,
    verificationDetails: {
      id: snapshot.verificationId,
      timestamp: snapshot.timestamp,
      paylineResults: PAYLINES.map((_, i) => checkPaylineMatch(PAYLINES[i], newGrid, i)),
      totalPayout: totalWinnings,
      gridSnapshot: snapshot.gridState
    }
  };
};