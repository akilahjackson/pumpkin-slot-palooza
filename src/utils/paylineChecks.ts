import { Cell } from './gameTypes';
import { GAME_PIECES, PUMPKIN_TYPES } from './gameConstants';

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
  console.log(`\n🎰 Checking payline ${paylineIndex}`);
  
  const verificationId = `payline-${paylineIndex}-${Date.now()}`;
  const symbols = payline.map(([row, col]) => grid[row][col].type);
  
  console.log('Symbols in payline:', symbols.map(s => 
    s === GAME_PIECES.WILD ? '🌟' : PUMPKIN_TYPES[s]
  ).join(' '));
  
  // Find first non-wild symbol to use as base
  let baseSymbol = symbols[0];
  let startIndex = 0;
  
  // Find the first non-wild symbol to use as base for matching
  while (baseSymbol === GAME_PIECES.WILD && startIndex < symbols.length) {
    startIndex++;
    if (startIndex < symbols.length) {
      baseSymbol = symbols[startIndex];
    }
  }
  
  // If all symbols are wild, use wild as base
  if (startIndex === symbols.length) {
    baseSymbol = GAME_PIECES.WILD;
    startIndex = 0;
  }
  
  let matchCount = 1;
  let hasWild = symbols[0] === GAME_PIECES.WILD;
  let matchedPositions: [number, number][] = [payline[0]];
  
  // Check consecutive matches starting from the first position
  for (let i = 1; i < symbols.length; i++) {
    const currentSymbol = symbols[i];
    const isMatch = currentSymbol === baseSymbol || currentSymbol === GAME_PIECES.WILD;
    
    if (isMatch) {
      matchCount++;
      matchedPositions.push(payline[i]);
      if (currentSymbol === GAME_PIECES.WILD) {
        hasWild = true;
      }
    } else {
      break; // Break on first non-match
    }
  }
  
  // Only count as a win if we have 3 or more matches
  const isWinningSequence = matchCount >= 3;
  matchedPositions = isWinningSequence ? matchedPositions : [];
  
  // Calculate winnings based on match count and wild multiplier
  const baseWinnings = isWinningSequence ? matchCount : 0;
  const wildMultiplier = hasWild ? 2 : 1;
  const totalWinnings = baseWinnings * wildMultiplier;
  
  console.log(`Match summary for payline ${paylineIndex}:`, {
    matchCount,
    hasWild,
    isWinningSequence,
    totalWinnings,
    matchedPositions
  });
  
  return {
    hasMatches: isWinningSequence,
    winnings: totalWinnings,
    hasWild,
    matchedPositions,
    symbolCombination: `${matchCount}x ${PUMPKIN_TYPES[baseSymbol]}${hasWild ? ' with WILD' : ''}`,
    verificationId
  };
};