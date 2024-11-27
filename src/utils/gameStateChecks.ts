import { Cell } from "./gameTypes";
import { PAYLINES, GAME_PIECES, WILD_MULTIPLIER } from "./gameConstants";

interface PaylineCheckResult {
  hasMatches: boolean;
  winnings: number;
  hasWild: boolean;
  matchedPositions: [number, number][];
}

interface GameCheckResult {
  hasMatches: boolean;
  totalWinnings: number;
  isBigWin: boolean;
  hasWildBonus: boolean;
  highestMultiplier: number;
  updatedGrid: Cell[][];
  matchedPositions: [number, number][];
}

const checkPaylineMatch = (
  payline: [number, number][],
  grid: Cell[][]
): PaylineCheckResult => {
  console.log('Checking payline:', payline);
  const symbols: number[] = payline.map(([row, col]) => grid[row][col].type);
  let matchCount = 0;
  let hasWild = false;
  let matchedPositions: [number, number][] = [];
  let winnings = 0;

  // Check for at least 3 matching symbols
  for (let i = 0; i < symbols.length - 2; i++) {
    const currentSymbol = symbols[i];
    const nextSymbol = symbols[i + 1];
    const thirdSymbol = symbols[i + 2];

    // Skip if current symbol is WILD
    if (currentSymbol === GAME_PIECES.WILD) continue;

    const isMatch = (symbol: number) => 
      symbol === currentSymbol || symbol === GAME_PIECES.WILD;

    if (isMatch(nextSymbol) && isMatch(thirdSymbol)) {
      matchCount = 3;
      hasWild = [nextSymbol, thirdSymbol].includes(GAME_PIECES.WILD);
      // Ensure positions are properly typed as tuples
      matchedPositions = payline.slice(i, i + 3).map(pos => [pos[0], pos[1]] as [number, number]);

      // Check for additional matches
      for (let j = i + 3; j < symbols.length; j++) {
        if (isMatch(symbols[j])) {
          matchCount++;
          matchedPositions.push([payline[j][0], payline[j][1]] as [number, number]);
        } else {
          break;
        }
      }

      // Calculate winnings based on match count
      winnings = matchCount * (hasWild ? WILD_MULTIPLIER : 1);
      break;
    }
  }

  console.log('Match result:', { matchCount, hasWild, matchedPositions, winnings });
  return {
    hasMatches: matchCount >= 3,
    winnings,
    hasWild,
    matchedPositions
  };
};

export const checkGameState = (
  grid: Cell[][],
  baseBet: number,
  betMultiplier: number,
  onWinningsUpdate: (winnings: number) => void
): GameCheckResult => {
  console.log('Starting game state check with grid:', grid);
  
  if (!grid || !grid.length) {
    console.warn('Invalid grid state during check');
    return {
      hasMatches: false,
      totalWinnings: 0,
      isBigWin: false,
      hasWildBonus: false,
      highestMultiplier: 0,
      updatedGrid: grid,
      matchedPositions: []
    };
  }

  const newGrid = grid.map(row => row.map(cell => ({...cell, matched: false})));
  let currentTotalWinnings = 0;
  let highestMultiplier = 0;
  let hasWildBonus = false;
  let hasMatches = false;
  const allMatchedPositions: [number, number][] = [];

  PAYLINES.forEach((payline, index) => {
    console.log(`Checking payline ${index}:`, payline);
    // Ensure payline is properly typed before passing to checkPaylineMatch
    const typedPayline = payline.map(pos => [pos[0], pos[1]] as [number, number]);
    const result = checkPaylineMatch(typedPayline, newGrid);
    console.log(`Payline ${index} result:`, result);

    if (result.hasMatches) {
      hasMatches = true;
      const winAmount = result.winnings * baseBet * betMultiplier;
      currentTotalWinnings += winAmount;
      onWinningsUpdate(winAmount);
      
      if (result.matchedPositions) {
        result.matchedPositions.forEach(([row, col]) => {
          if (newGrid[row] && newGrid[row][col]) {
            newGrid[row][col].matched = true;
            allMatchedPositions.push([row, col]);
          }
        });
      }

      const multiplier = result.winnings;
      console.log('Win multiplier:', multiplier);

      if (multiplier > highestMultiplier) {
        highestMultiplier = multiplier;
      }

      if (result.hasWild) {
        hasWildBonus = true;
      }
    }
  });

  if (hasMatches) {
    console.log('Matches found! Total winnings:', currentTotalWinnings);
    console.log('Matched positions:', allMatchedPositions);
  } else {
    console.log('No matches found in any payline');
  }

  return {
    hasMatches,
    totalWinnings: currentTotalWinnings,
    isBigWin: highestMultiplier >= 50,
    hasWildBonus,
    highestMultiplier,
    updatedGrid: newGrid,
    matchedPositions: allMatchedPositions
  };
};