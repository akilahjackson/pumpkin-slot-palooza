import { Cell } from "./gameTypes";
import { GAME_PIECES, WILD_MULTIPLIER } from "./gameConstants";
import { isValidPosition } from "./gameLogic";

interface PaylineCheckResult {
  hasMatches: boolean;
  winnings: number;
  matchCount: number;
  hasWild: boolean;
  matchedPositions?: [number, number][];
}

export const handlePaylineCheck = (
  payline: number[][],
  grid: Cell[][],
  baseBet: number,
  betMultiplier: number
): PaylineCheckResult => {
  const validPositions = payline.filter(([row, col]) => 
    isValidPosition(row, col)
  );

  if (validPositions.length < 3) {
    return { 
      hasMatches: false, 
      winnings: 0, 
      matchCount: 0, 
      hasWild: false 
    };
  }

  const symbols = validPositions.map(([row, col]) => grid[row][col].type);
  let maxResult: PaylineCheckResult = { 
    hasMatches: false, 
    winnings: 0, 
    matchCount: 0, 
    hasWild: false,
    matchedPositions: []
  };

  for (let i = 0; i < symbols.length - 2; i++) {
    const hasWild = symbols.slice(i, i + 3).includes(GAME_PIECES.WILD);
    const symbolToMatch = symbols[i] === GAME_PIECES.WILD ? symbols[i + 1] : symbols[i];
    
    if (symbolToMatch === GAME_PIECES.WILD) continue;

    let matchCount = 0;
    let j = i;
    let currentMatchedPositions: [number, number][] = [];

    while (j < symbols.length && 
           (symbols[j] === symbolToMatch || symbols[j] === GAME_PIECES.WILD)) {
      matchCount++;
      currentMatchedPositions.push(validPositions[j]);
      j++;
    }

    if (matchCount >= 3) {
      const basePayout = baseBet * betMultiplier * matchCount;
      const payout = hasWild ? basePayout * WILD_MULTIPLIER : basePayout;

      if (payout > maxResult.winnings) {
        maxResult = {
          hasMatches: true,
          winnings: payout,
          matchCount,
          hasWild,
          matchedPositions: currentMatchedPositions
        };
      }
    }
  }

  return maxResult;
};