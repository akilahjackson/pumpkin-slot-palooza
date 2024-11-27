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
    
    // Skip if current symbol is WILD - we want actual symbols as the base
    if (currentSymbol === GAME_PIECES.WILD) continue;

    let consecutiveMatches = 1;
    let currentMatches: [number, number][] = [[payline[i][0], payline[i][1]]];
    let wildCount = 0;

    // Check subsequent positions
    for (let j = i + 1; j < symbols.length; j++) {
      const nextSymbol = symbols[j];
      if (nextSymbol === currentSymbol || nextSymbol === GAME_PIECES.WILD) {
        consecutiveMatches++;
        currentMatches.push([payline[j][0], payline[j][1]]);
        if (nextSymbol === GAME_PIECES.WILD) {
          wildCount++;
        }
      } else {
        break;
      }
    }

    // If we found at least 3 matches
    if (consecutiveMatches >= 3) {
      matchCount = consecutiveMatches;
      hasWild = wildCount > 0;
      matchedPositions = currentMatches;
      winnings = matchCount * (hasWild ? WILD_MULTIPLIER : 1);
      console.log(`Found ${matchCount} matches with ${wildCount} wilds for symbol ${currentSymbol}`);
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
      
      result.matchedPositions.forEach(([row, col]) => {
        if (newGrid[row] && newGrid[row][col]) {
          newGrid[row][col].matched = true;
          allMatchedPositions.push([row, col]);
        }
      });

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