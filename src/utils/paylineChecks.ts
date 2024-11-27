import { Cell } from "./gameTypes";
import { GAME_PIECES } from "./gameConstants";

export interface PaylineCheckResult {
  hasMatches: boolean;
  winnings: number;
  hasWild: boolean;
  matchedPositions: [number, number][];
  symbolCombination: string;
  verificationId: string;
}

export const checkPaylineMatch = (
  payline: [number, number][],
  grid: Cell[][],
  paylineIndex: number
): PaylineCheckResult => {
  const verificationId = `payline-${paylineIndex}-${Date.now()}`;
  
  // Get symbols for the payline
  const symbols = payline.map(([row, col]) => grid[row][col].type);
  
  // Count consecutive matches from start
  let matchCount = 1;
  let hasWild = symbols[0] === GAME_PIECES.WILD;
  let baseSymbol = symbols[0];
  let matchedPositions: [number, number][] = [payline[0]];
  
  // If first symbol is wild, find first non-wild symbol
  if (baseSymbol === GAME_PIECES.WILD) {
    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i] !== GAME_PIECES.WILD) {
        baseSymbol = symbols[i];
        break;
      }
    }
  }
  
  // Check consecutive matches
  for (let i = 1; i < symbols.length; i++) {
    const currentSymbol = symbols[i];
    
    if (currentSymbol === baseSymbol || currentSymbol === GAME_PIECES.WILD) {
      matchCount++;
      matchedPositions.push(payline[i]);
      if (currentSymbol === GAME_PIECES.WILD) {
        hasWild = true;
      }
    } else {
      break;
    }
  }

  console.log(`Payline ${paylineIndex} check:`, {
    symbols: symbols.join(','),
    matchCount,
    hasWild,
    baseSymbol,
    positions: matchedPositions
  });

  return {
    hasMatches: matchCount >= 3,
    winnings: matchCount >= 3 ? matchCount * (hasWild ? 2 : 1) : 0,
    hasWild,
    matchedPositions,
    symbolCombination: `${matchCount}x ${baseSymbol}${hasWild ? ' with WILD' : ''}`,
    verificationId
  };
};