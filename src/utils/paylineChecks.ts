import { Cell } from "./gameTypes";
import { GAME_PIECES } from "./gameConstants";
import { logPaylineCheck, generateVerificationId } from "./verificationUtils";

export interface PaylineCheckResult {
  hasMatches: boolean;
  winnings: number;
  hasWild: boolean;
  matchedPositions: [number, number][];
  matchedSymbols: number[];
  verificationId: string;
  symbolCombination: string;
}

export const checkPaylineMatch = (
  payline: [number, number][],
  grid: Cell[][],
  paylineIndex: number
): PaylineCheckResult => {
  const verificationId = generateVerificationId();
  console.log(`\n🔍 Starting payline ${paylineIndex} check [${verificationId}]`);
  
  const symbols: number[] = payline.map(([row, col]) => {
    const symbol = grid[row][col].type;
    console.log(`Position [${row},${col}] contains symbol: ${symbol}`);
    return symbol;
  });

  let matchCount = 0;
  let hasWild = false;
  let matchedPositions: [number, number][] = [];
  let matchedSymbols: number[] = [];
  let winnings = 0;
  let wildCount = 0;
  let symbolCombination = '';

  // Check for consecutive matches
  for (let i = 0; i < symbols.length - 2; i++) {
    const baseSymbol = symbols[i];
    
    // Skip if base symbol is WILD
    if (baseSymbol === GAME_PIECES.WILD) {
      console.log(`⚠️ [${verificationId}] Skipping WILD as base symbol at position ${i}`);
      continue;
    }

    let consecutiveMatches = 1;
    let currentMatches: [number, number][] = [payline[i]];
    let currentMatchedSymbols: number[] = [baseSymbol];
    let currentWildCount = 0;
    let currentSymbols = [baseSymbol];

    // Look ahead for matches
    for (let j = i + 1; j < symbols.length; j++) {
      const nextSymbol = symbols[j];
      const isMatch = nextSymbol === baseSymbol;
      const isWild = nextSymbol === GAME_PIECES.WILD;

      if (isMatch || isWild) {
        consecutiveMatches++;
        currentMatches.push(payline[j]);
        currentMatchedSymbols.push(nextSymbol);
        currentSymbols.push(nextSymbol);
        
        if (isWild) {
          currentWildCount++;
          console.log(`🌟 Wild symbol found at position ${j}`);
        }
      } else {
        console.log(`Chain break at position ${j}: ${nextSymbol} doesn't match ${baseSymbol}`);
        break;
      }
    }

    // If we found a valid combination
    if (consecutiveMatches >= 3) {
      console.log(`✨ Valid combination found: ${consecutiveMatches} matches`);
      matchCount = consecutiveMatches;
      hasWild = currentWildCount > 0;
      matchedPositions = currentMatches;
      matchedSymbols = currentMatchedSymbols;
      wildCount = currentWildCount;
      symbolCombination = currentSymbols.join(' → ');
      winnings = matchCount * (hasWild ? 2 : 1); // Basic multiplier
      break;
    }
  }

  const result: PaylineCheckResult = {
    hasMatches: matchCount >= 3,
    winnings,
    hasWild,
    matchedPositions,
    matchedSymbols,
    verificationId,
    symbolCombination
  };

  logPaylineCheck(paylineIndex, matchedSymbols, matchCount, matchedPositions, wildCount, verificationId);
  return result;
};