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
  console.log(`\n🔍 Checking payline ${paylineIndex} [${verificationId}]`);
  
  // Extract symbols and positions from the payline
  const symbolsWithPositions = payline.map(([row, col]) => ({
    symbol: grid[row][col].type,
    position: [row, col] as [number, number]
  }));

  let currentRun = {
    symbol: -1,
    count: 0,
    positions: [] as [number, number][],
    includesWild: false
  };

  let bestRun = {
    symbol: -1,
    count: 0,
    positions: [] as [number, number][],
    includesWild: false
  };

  // Analyze consecutive matches
  for (let i = 0; i < symbolsWithPositions.length; i++) {
    const { symbol, position } = symbolsWithPositions[i];
    const isWild = symbol === GAME_PIECES.WILD;
    
    console.log(`Position ${position}: Symbol ${symbol} ${isWild ? '(WILD)' : ''}`);

    if (currentRun.count === 0) {
      // Start new run
      currentRun = {
        symbol: isWild ? -1 : symbol,
        count: 1,
        positions: [position],
        includesWild: isWild
      };
    } else {
      const canMatch = 
        symbol === currentRun.symbol || 
        isWild || 
        (currentRun.symbol === -1 && !isWild);

      if (canMatch) {
        // Continue current run
        if (currentRun.symbol === -1 && !isWild) {
          currentRun.symbol = symbol;
        }
        currentRun.count++;
        currentRun.positions.push(position);
        currentRun.includesWild = currentRun.includesWild || isWild;
      } else {
        // End current run and check if it's better than best run
        if (currentRun.count >= 3 && currentRun.count > bestRun.count) {
          bestRun = { ...currentRun };
        }
        // Start new run with current symbol
        currentRun = {
          symbol: symbol,
          count: 1,
          positions: [position],
          includesWild: isWild
        };
      }
    }
  }

  // Check final run
  if (currentRun.count >= 3 && currentRun.count > bestRun.count) {
    bestRun = { ...currentRun };
  }

  // Calculate result
  const hasMatches = bestRun.count >= 3;
  const winnings = hasMatches ? bestRun.count * (bestRun.includesWild ? 2 : 1) : 0;
  
  const result: PaylineCheckResult = {
    hasMatches,
    winnings,
    hasWild: bestRun.includesWild,
    matchedPositions: bestRun.positions,
    matchedSymbols: hasMatches ? [bestRun.symbol] : [],
    verificationId,
    symbolCombination: hasMatches ? 
      `${bestRun.count}x ${bestRun.symbol} ${bestRun.includesWild ? '(with WILD)' : ''}` : 
      'No matches'
  };

  logPaylineCheck(
    paylineIndex,
    result.matchedSymbols,
    bestRun.count,
    result.matchedPositions,
    bestRun.includesWild ? 1 : 0,
    verificationId
  );

  return result;
}