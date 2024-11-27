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

export const checkPaylineMatch = (
  payline: [number, number][],
  grid: Cell[][],
  paylineIndex: number
): PaylineCheckResult => {
  const verificationId = `payline-${paylineIndex}-${Date.now()}`;
  const symbols: number[] = [];
  const positions: [number, number][] = [];
  let hasWild = false;

  // Collect symbols and positions along the payline
  payline.forEach(([row, col]) => {
    if (grid[row] && grid[row][col]) {
      symbols.push(grid[row][col].type);
      positions.push([row, col]);
      if (grid[row][col].type === GAME_PIECES.WILD) {
        hasWild = true;
      }
    }
  });

  // Find the longest consecutive matching sequence
  let maxSequence = {
    length: 0,
    positions: [] as [number, number][],
    hasWild: false,
    baseSymbol: -1
  };

  for (let start = 0; start < positions.length; start++) {
    let currentSymbol = symbols[start];
    if (currentSymbol === GAME_PIECES.WILD) continue;

    let sequence = {
      length: 1,
      positions: [positions[start]],
      hasWild: false,
      baseSymbol: currentSymbol
    };

    for (let next = start + 1; next < positions.length; next++) {
      const nextSymbol = symbols[next];
      if (nextSymbol === currentSymbol || nextSymbol === GAME_PIECES.WILD) {
        sequence.length++;
        sequence.positions.push(positions[next]);
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