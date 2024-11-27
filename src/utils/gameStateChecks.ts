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
  console.log('\n🎮 Starting new game state check');
  console.log('💰 Bet configuration:', { baseBet, betMultiplier });

  const newGrid = grid.map(row => row.map(cell => ({...cell, matched: false})));
  let totalWinnings = 0;
  let highestMultiplier = 0;
  let hasWildBonus = false;
  let allMatchedPositions: [number, number][] = [];
  const paylineResults: PaylineCheckResult[] = [];

  // Check each payline
  PAYLINES.forEach((payline, index) => {
    const typedPayline = payline as [number, number][];
    const result = checkPaylineMatch(typedPayline, newGrid, index);
    paylineResults.push(result);

    if (result.hasMatches) {
      const winAmount = result.winnings * baseBet * betMultiplier;
      totalWinnings += winAmount;
      
      console.log(`\n💎 Win on payline ${index}:`);
      console.log(`   Combination: ${result.symbolCombination}`);
      console.log(`   Amount: ${winAmount}`);
      
      onWinningsUpdate(winAmount);

      // Mark matched positions on grid
      result.matchedPositions.forEach(([row, col]) => {
        if (newGrid[row] && newGrid[row][col]) {
          newGrid[row][col].matched = true;
          allMatchedPositions.push([row, col]);
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

  // Create verification details
  const snapshot = createGameStateSnapshot(grid, allMatchedPositions);
  const verificationDetails = {
    id: snapshot.verificationId,
    timestamp: snapshot.timestamp,
    paylineResults,
    totalPayout: totalWinnings,
    gridSnapshot: snapshot.gridState
  };

  // Log final results
  console.log('\n📊 Game Check Summary:');
  console.log(`💰 Total Win: ${totalWinnings}`);
  console.log(`🎯 Matched Positions: ${allMatchedPositions.length}`);
  console.log(`🌟 Highest Multiplier: ${highestMultiplier}`);
  console.log(`🎲 Wild Bonus: ${hasWildBonus}`);
  console.log(`🔍 Verification ID: ${verificationDetails.id}`);

  return {
    hasMatches: allMatchedPositions.length > 0,
    totalWinnings,
    isBigWin: highestMultiplier >= 50,
    hasWildBonus,
    highestMultiplier,
    updatedGrid: newGrid,
    matchedPositions: allMatchedPositions,
    verificationDetails
  };
};