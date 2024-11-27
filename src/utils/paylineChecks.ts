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
  let currentSequence: [number, number][] = [payline[0]];
  
  // Check consecutive matches starting from the first position
  for (let i = 1; i < symbols.length; i++) {
    const currentSymbol = symbols[i];
    const isMatch = currentSymbol === baseSymbol || currentSymbol === GAME_PIECES.WILD;
    
    if (isMatch) {
      matchCount++;
      currentSequence.push(payline[i]);
      if (currentSymbol === GAME_PIECES.WILD) {
        hasWild = true;
      }
    } else {
      // Break if we hit a non-matching symbol
      break;
    }
  }
  
  // Only use the sequence if it forms a valid win (3 or more matches)
  matchedPositions = matchCount >= 3 ? currentSequence : [];
  
  console.log(`Match count: ${matchCount}, Has wild: ${hasWild}`);
  console.log('Matched positions:', matchedPositions);
  
  const isWinningSequence = matchCount >= 3;
  const winMultiplier = hasWild ? 2 : 1;
  const winnings = isWinningSequence ? matchCount * winMultiplier : 0;
  
  return {
    hasMatches: isWinningSequence,
    winnings,
    hasWild,
    matchedPositions,
    symbolCombination: `${matchCount}x ${PUMPKIN_TYPES[baseSymbol]}${hasWild ? ' with WILD' : ''}`,
    verificationId
  };
};