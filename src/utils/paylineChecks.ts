import { Cell } from "./gameTypes";
import { GAME_PIECES } from "./gameConstants";
import { logPaylineCheck } from "./verificationUtils";

export interface PaylineCheckResult {
  hasMatches: boolean;
  winnings: number;
  hasWild: boolean;
  matchedPositions: [number, number][];
  symbolCombination: string;
  verificationId: string;
}

interface SequenceInfo {
  length: number;
  positions: [number, number][];
  hasWild: boolean;
  baseSymbol: number;
}

export const checkPaylineMatch = (
  payline: [number, number][],
  grid: Cell[][],
  paylineIndex: number
): PaylineCheckResult => {
  const verificationId = `payline-${paylineIndex}-${Date.now()}`;
  
  // Convert payline positions to properly typed tuples
  const validPositions: [number, number][] = payline.map(([row, col]): [number, number] => [row, col]);
  const symbols: number[] = [];
  
  // Collect symbols along the payline
  validPositions.forEach(([row, col]) => {
    if (grid[row] && grid[row][col]) {
      symbols.push(grid[row][col].type);
    }
  });

  let maxSequence: SequenceInfo = {
    length: 0,
    positions: [],
    hasWild: false,
    baseSymbol: -1
  };

  // Find the longest consecutive matching sequence
  for (let start = 0; start < validPositions.length; start++) {
    const currentSymbol = symbols[start];
    if (currentSymbol === GAME_PIECES.WILD) continue;

    let sequence: SequenceInfo = {
      length: 1,
      positions: [validPositions[start]],
      hasWild: false,
      baseSymbol: currentSymbol
    };

    for (let next = start + 1; next < validPositions.length; next++) {
      const nextSymbol = symbols[next];
      if (nextSymbol === currentSymbol || nextSymbol === GAME_PIECES.WILD) {
        sequence.length++;
        sequence.positions.push(validPositions[next]);
        if (nextSymbol === GAME_PIECES.WILD) {
          sequence.hasWild = true;
        }
      } else {
        break;
      }
    }

    if (sequence.length >= 3 && sequence.length > maxSequence.length) {
      maxSequence = sequence;
    }
  }

  logPaylineCheck(
    paylineIndex,
    symbols,
    maxSequence.length,
    maxSequence.positions,
    maxSequence.hasWild ? 1 : 0,
    verificationId
  );

  return {
    hasMatches: maxSequence.length >= 3,
    winnings: maxSequence.length >= 3 ? maxSequence.length * (maxSequence.hasWild ? 2 : 1) : 0,
    hasWild: maxSequence.hasWild,
    matchedPositions: maxSequence.positions,
    symbolCombination: `${maxSequence.length}x ${maxSequence.baseSymbol}${maxSequence.hasWild ? ' with WILD' : ''}`,
    verificationId
  };
};