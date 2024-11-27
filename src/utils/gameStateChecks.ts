import { Cell } from "./gameTypes";
import { PAYLINES, GAME_PIECES, WILD_MULTIPLIER } from "./gameConstants";
import { handlePaylineCheck } from "./paylineUtils";

interface GameCheckResult {
  hasMatches: boolean;
  totalWinnings: number;
  isBigWin: boolean;
  hasWildBonus: boolean;
  highestMultiplier: number;
  updatedGrid: Cell[][];
  matchedPositions: [number, number][];
}

export const checkGameState = (
  grid: Cell[][],
  baseBet: number,
  betMultiplier: number,
  onWinningsUpdate: (winnings: number) => void
): GameCheckResult => {
  console.log('Starting game state check with grid:', grid);
  
  if (!grid || !grid.length) {
    console.warn('Invalid grid state during check');
    return {
      hasMatches: false,
      totalWinnings: 0,
      isBigWin: false,
      hasWildBonus: false,
      highestMultiplier: 0,
      updatedGrid: grid,
      matchedPositions: []
    };
  }

  const newGrid = grid.map(row => row.map(cell => ({...cell, matched: false})));
  let currentTotalWinnings = 0;
  let highestMultiplier = 0;
  let hasWildBonus = false;
  let hasMatches = false;
  const allMatchedPositions: [number, number][] = [];

  PAYLINES.forEach((payline, index) => {
    console.log(`Checking payline ${index}:`, payline);
    const result = handlePaylineCheck(payline, newGrid, baseBet, betMultiplier);
    console.log(`Payline ${index} result:`, result);

    if (result.hasMatches) {
      hasMatches = true;
      currentTotalWinnings += result.winnings;
      onWinningsUpdate(result.winnings);
      
      if (result.matchedPositions) {
        // Ensure positions are properly typed as tuples
        const typedPositions: [number, number][] = result.matchedPositions.map(
          pos => [pos[0], pos[1]] as [number, number]
        );
        allMatchedPositions.push(...typedPositions);
        
        typedPositions.forEach(([row, col]) => {
          if (newGrid[row] && newGrid[row][col]) {
            newGrid[row][col].matched = true;
          }
        });
      }

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
    console.log('Matches found! Total winnings:', currentTotalWinnings);
    console.log('Matched positions:', allMatchedPositions);
  } else {
    console.log('No matches found in any payline');
  }

  return {
    hasMatches,
    totalWinnings: currentTotalWinnings,
    isBigWin: highestMultiplier >= 50,
    hasWildBonus,
    highestMultiplier,
    updatedGrid: newGrid,
    matchedPositions: allMatchedPositions
  };
};