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

const isWildSymbol = (cell: Cell): boolean => {
  return cell.type === GAME_PIECES.WILD;
};

const getBaseSymbol = (cells: Cell[], startIdx: number): number | null => {
  // Find the first non-wild symbol to use as base for matching
  for (let i = startIdx; i < cells.length; i++) {
    if (!isWildSymbol(cells[i])) {
      return cells[i].type;
    }
  }
  return null; // All wilds case
};

export const checkPaylineMatch = (
  payline: [number, number][],
  grid: Cell[][],
  paylineIndex: number
): PaylineCheckResult => {
  console.log(`\n🔍 Checking payline ${paylineIndex}`);
  const verificationId = generateVerificationId();

  // Extract cells from grid based on payline positions
  const cells = payline.map(([row, col]) => grid[row][col]);
  
  let bestMatch = {
    length: 0,
    startIndex: 0,
    hasWild: false,
    positions: [] as [number, number][],
    symbol: -1
  };

  // Check each possible starting position
  for (let startIdx = 0; startIdx < cells.length - 2; startIdx++) {
    const baseSymbol = getBaseSymbol(cells, startIdx);
    if (baseSymbol === null) continue;

    let currentMatch = {
      length: 0,
      positions: [] as [number, number][],
      hasWild: false
    };

    // Check consecutive positions from this start
    for (let i = startIdx; i < cells.length; i++) {
      const cell = cells[i];
      const isWild = isWildSymbol(cell);
      
      // Check if this cell continues the match
      if (isWild || cell.type === baseSymbol) {
        currentMatch.length++;
        currentMatch.positions.push(payline[i]);
        currentMatch.hasWild = currentMatch.hasWild || isWild;
      } else {
        break; // Stop on first non-match
      }
    }

    // Update best match if this is better
    if (currentMatch.length >= 3 && currentMatch.length > bestMatch.length) {
      bestMatch = {
        length: currentMatch.length,
        startIndex: startIdx,
        hasWild: currentMatch.hasWild,
        positions: currentMatch.positions,
        symbol: baseSymbol
      };
    }
  }

  // Calculate winnings based on match length
  const baseWinnings = bestMatch.length >= 3 ? bestMatch.length : 0;
  const wildMultiplier = bestMatch.hasWild ? 2 : 1;
  const totalWinnings = baseWinnings * wildMultiplier;

  console.log(`Payline ${paylineIndex} results:`, {
    matchLength: bestMatch.length,
    hasWild: bestMatch.hasWild,
    positions: bestMatch.positions,
    symbol: bestMatch.symbol,
    winnings: totalWinnings
  });

  return {
    hasMatches: bestMatch.length >= 3,
    winnings: totalWinnings,
    hasWild: bestMatch.hasWild,
    matchedPositions: bestMatch.positions,
    symbolCombination: bestMatch.length >= 3 ? 
      `${bestMatch.length}x ${bestMatch.symbol} ${bestMatch.hasWild ? '(with WILD)' : ''}` : 
      'No matches',
    verificationId
  };
};