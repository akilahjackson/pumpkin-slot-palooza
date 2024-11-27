import { Cell } from "./gameTypes";
import { GAME_PIECES } from "./gameConstants";
import { generateVerificationId } from "./verificationUtils";

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
  console.log(`\n🔍 Checking payline ${paylineIndex}`);
  const verificationId = generateVerificationId();

  // Get all positions and symbols in the payline
  const paylineSymbols = payline.map(([row, col]) => ({
    type: grid[row][col].type,
    position: [row, col] as [number, number]
  }));

  console.log('Analyzing payline symbols:', paylineSymbols.map(s => 
    `${s.type} at [${s.position}]`
  ));

  let longestMatch = {
    startIndex: 0,
    length: 0,
    symbol: -1,
    positions: [] as [number, number][],
    hasWild: false
  };

  // Check each possible starting position
  for (let startIdx = 0; startIdx < paylineSymbols.length - 2; startIdx++) {
    let currentSymbol = paylineSymbols[startIdx].type;
    let isStartWild = currentSymbol === GAME_PIECES.WILD;
    
    // Track current sequence
    let currentMatch = {
      length: 1,
      symbol: isStartWild ? -1 : currentSymbol,
      positions: [paylineSymbols[startIdx].position],
      hasWild: isStartWild
    };

    // Look ahead for consecutive matches
    for (let j = startIdx + 1; j < paylineSymbols.length; j++) {
      const nextSymbol = paylineSymbols[j].type;
      const isWild = nextSymbol === GAME_PIECES.WILD;

      // Determine if this symbol can continue the sequence
      const canContinueSequence = 
        isWild || 
        nextSymbol === currentMatch.symbol ||
        (currentMatch.symbol === -1 && !isWild);

      if (!canContinueSequence) {
        break;
      }

      // Update sequence information
      currentMatch.length++;
      currentMatch.positions.push(paylineSymbols[j].position);
      currentMatch.hasWild = currentMatch.hasWild || isWild;
      
      // If we started with a wild or haven't set a symbol yet, use this non-wild symbol
      if (currentMatch.symbol === -1 && !isWild) {
        currentMatch.symbol = nextSymbol;
      }
    }

    // Check if this is the longest valid match we've found
    if (currentMatch.length >= 3 && currentMatch.length > longestMatch.length) {
      longestMatch = {
        startIndex: startIdx,
        length: currentMatch.length,
        symbol: currentMatch.symbol,
        positions: currentMatch.positions,
        hasWild: currentMatch.hasWild
      };
    }
  }

  const hasMatches = longestMatch.length >= 3;
  const winnings = hasMatches ? longestMatch.length * (longestMatch.hasWild ? 2 : 1) : 0;

  console.log('Match result:', {
    paylineIndex,
    hasMatches,
    matchLength: longestMatch.length,
    symbol: longestMatch.symbol,
    positions: longestMatch.positions,
    hasWild: longestMatch.hasWild,
    winnings
  });

  return {
    hasMatches,
    winnings,
    hasWild: longestMatch.hasWild,
    matchedPositions: longestMatch.positions,
    symbolCombination: hasMatches ? 
      `${longestMatch.length}x ${longestMatch.symbol} ${longestMatch.hasWild ? '(with WILD)' : ''}` : 
      'No matches',
    verificationId
  };
};