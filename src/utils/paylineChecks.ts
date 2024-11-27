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
  
  // Get symbols for this payline
  const symbols = payline.map(([row, col]) => ({
    type: grid[row][col].type,
    position: [row, col] as [number, number]
  }));
  
  console.log('Symbols in payline:', symbols.map(s => s.type));

  let currentRun = {
    symbol: -1,
    count: 0,
    positions: [] as [number, number][],
    hasWild: false
  };

  let bestRun = {
    symbol: -1,
    count: 0,
    positions: [] as [number, number][],
    hasWild: false
  };

  // Analyze consecutive matches
  for (let i = 0; i < symbols.length; i++) {
    const { type: currentSymbol, position } = symbols[i];
    const isWild = currentSymbol === GAME_PIECES.WILD;
    
    console.log(`Position ${position}: Symbol ${currentSymbol} ${isWild ? '(WILD)' : ''}`);

    if (currentRun.count === 0) {
      // Start new run
      currentRun = {
        symbol: isWild ? -1 : currentSymbol,
        count: 1,
        positions: [position],
        hasWild: isWild
      };
    } else {
      const canMatch = 
        currentSymbol === currentRun.symbol || 
        isWild || 
        (currentRun.symbol === -1 && !isWild);

      if (canMatch) {
        // Continue current run
        if (currentRun.symbol === -1 && !isWild) {
          currentRun.symbol = currentSymbol;
        }
        currentRun.count++;
        currentRun.positions.push(position);
        currentRun.hasWild = currentRun.hasWild || isWild;
      } else {
        // End current run and check if it's better than best run
        if (currentRun.count >= 3 && currentRun.count > bestRun.count) {
          bestRun = { ...currentRun };
        }
        // Start new run with current symbol
        currentRun = {
          symbol: currentSymbol,
          count: 1,
          positions: [position],
          hasWild: isWild
        };
      }
    }
  }

  // Check final run
  if (currentRun.count >= 3 && currentRun.count > bestRun.count) {
    bestRun = { ...currentRun };
  }

  const hasMatches = bestRun.count >= 3;
  const winnings = hasMatches ? bestRun.count * (bestRun.hasWild ? 2 : 1) : 0;

  console.log(`Payline ${paylineIndex} result:`, {
    hasMatches,
    matchCount: bestRun.count,
    positions: bestRun.positions,
    symbol: bestRun.symbol,
    hasWild: bestRun.hasWild,
    winnings
  });

  return {
    hasMatches,
    winnings,
    hasWild: bestRun.hasWild,
    matchedPositions: bestRun.positions,
    symbolCombination: hasMatches ? 
      `${bestRun.count}x ${bestRun.symbol} ${bestRun.hasWild ? '(with WILD)' : ''}` : 
      'No matches',
    verificationId
  };
};