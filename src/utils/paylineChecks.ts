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

export const checkPaylineMatch = (
  payline: [number, number][],
  grid: Cell[][],
  paylineIndex: number
): PaylineCheckResult => {
  console.log(`\n🔍 Checking payline ${paylineIndex}:`, payline);
  const verificationId = generateVerificationId();

  // Extract cells for this payline
  const cells = payline.map(([row, col]) => ({
    cell: grid[row][col],
    position: [row, col] as [number, number]
  }));

  let currentRun = {
    length: 0,
    positions: [] as [number, number][],
    hasWild: false,
    baseSymbol: -1
  };

  let bestRun = {
    length: 0,
    positions: [] as [number, number][],
    hasWild: false,
    baseSymbol: -1
  };

  // Check each position in the payline
  for (let i = 0; i < cells.length; i++) {
    const { cell, position } = cells[i];
    const isWild = isWildSymbol(cell);
    
    console.log(`Checking position [${position}], symbol: ${cell.type}, isWild: ${isWild}`);

    // Start new run
    if (currentRun.length === 0) {
      currentRun.length = 1;
      currentRun.positions = [position];
      currentRun.hasWild = isWild;
      currentRun.baseSymbol = isWild ? -1 : cell.type;
      continue;
    }

    // Check if current cell continues the run
    const matchesRun = isWild || 
      cell.type === currentRun.baseSymbol || 
      (currentRun.baseSymbol === -1 && !isWild);

    if (matchesRun) {
      // Update base symbol if it was previously undefined (all wilds)
      if (currentRun.baseSymbol === -1 && !isWild) {
        currentRun.baseSymbol = cell.type;
      }
      
      currentRun.length++;
      currentRun.positions.push(position);
      currentRun.hasWild = currentRun.hasWild || isWild;
    } else {
      // Save current run if it's better than best run
      if (currentRun.length >= 3 && currentRun.length > bestRun.length) {
        bestRun = { ...currentRun };
      }
      
      // Start new run with current cell
      currentRun = {
        length: 1,
        positions: [position],
        hasWild: isWild,
        baseSymbol: isWild ? -1 : cell.type
      };
    }
  }

  // Check final run
  if (currentRun.length >= 3 && currentRun.length > bestRun.length) {
    bestRun = { ...currentRun };
  }

  // Calculate winnings based on match length
  const baseWinnings = bestRun.length >= 3 ? bestRun.length : 0;
  const wildMultiplier = bestRun.hasWild ? 2 : 1;
  const totalWinnings = baseWinnings * wildMultiplier;

  console.log('Payline check result:', {
    paylineIndex,
    matchLength: bestRun.length,
    hasWild: bestRun.hasWild,
    positions: bestRun.positions,
    baseSymbol: bestRun.baseSymbol,
    winnings: totalWinnings
  });

  return {
    hasMatches: bestRun.length >= 3,
    winnings: totalWinnings,
    hasWild: bestRun.hasWild,
    matchedPositions: bestRun.positions,
    symbolCombination: bestRun.length >= 3 ? 
      `${bestRun.length}x ${bestRun.baseSymbol} ${bestRun.hasWild ? '(with WILD)' : ''}` : 
      'No matches',
    verificationId
  };
};