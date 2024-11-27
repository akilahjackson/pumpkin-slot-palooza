import { Cell } from "./gameTypes";
import { PAYLINES } from "./gameConstants";
import { checkPaylineMatch } from "./paylineChecks";

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
  console.log('\n🎮 Starting game state check');
  
  let totalWinnings = 0;
  let hasWildBonus = false;
  let highestMultiplier = 0;
  const allMatchedPositions = new Set<string>();
  
  // Create a new grid with all matches reset
  const updatedGrid = grid.map(row =>
    row.map(cell => ({
      ...cell,
      matched: false
    }))
  );
  
  // Check each payline
  PAYLINES.forEach((payline, index) => {
    const result = checkPaylineMatch(payline, grid, index);
    
    if (result.hasMatches) {
      // Calculate winnings for this payline
      const paylineWinnings = result.winnings * baseBet * betMultiplier;
      totalWinnings += paylineWinnings;
      
      console.log(`\n💎 Win on payline ${index}:`, {
        amount: paylineWinnings,
        combination: result.symbolCombination,
        positions: result.matchedPositions
      });
      
      // Mark matched positions in the grid
      result.matchedPositions.forEach(([row, col]) => {
        updatedGrid[row][col].matched = true;
        allMatchedPositions.add(`${row},${col}`);
      });
      
      if (result.hasWild) {
        hasWildBonus = true;
      }
      
      if (result.winnings > highestMultiplier) {
        highestMultiplier = result.winnings;
      }
    }
  });
  
  // Convert matched positions set back to array of tuples
  const matchedPositions: [number, number][] = Array.from(allMatchedPositions)
    .map(pos => pos.split(',').map(Number) as [number, number]);
  
  console.log('\n📊 Game Check Summary:', {
    totalWin: totalWinnings,
    matchCount: matchedPositions.length,
    highestMultiplier,
    hasWildBonus
  });
  
  return {
    hasMatches: matchedPositions.length > 0,
    totalWinnings,
    isBigWin: highestMultiplier >= 50,
    hasWildBonus,
    highestMultiplier,
    updatedGrid,
    matchedPositions
  };
};