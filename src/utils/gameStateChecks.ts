import { Cell } from "./gameTypes";
import { PAYLINES, GAME_PIECES, WILD_MULTIPLIER } from "./gameConstants";

interface PaylineCheckResult {
  hasMatches: boolean;
  winnings: number;
  hasWild: boolean;
  matchedPositions: [number, number][];
  matchedSymbols: number[];
  verificationId: string;
}

interface GameCheckResult {
  hasMatches: boolean;
  totalWinnings: number;
  isBigWin: boolean;
  hasWildBonus: boolean;
  highestMultiplier: number;
  updatedGrid: Cell[][];
  matchedPositions: [number, number][];
  verificationDetails: {
    timestamp: string;
    paylineResults: PaylineCheckResult[];
    totalPayout: number;
    gridSnapshot: string;
  };
}

const generateVerificationId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const logPaylineCheck = (
  paylineIndex: number,
  symbols: number[],
  matches: number,
  positions: [number, number][],
  wildCount: number
) => {
  console.log(`🎰 Checking Payline #${paylineIndex}:`);
  console.log(`📊 Symbols in payline:`, symbols.map(s => GAME_PIECES[s]).join(' → '));
  console.log(`✨ Consecutive matches: ${matches}`);
  console.log(`🌟 Wild symbols used: ${wildCount}`);
  console.log(`📍 Matched positions:`, positions);
};

const checkPaylineMatch = (
  payline: [number, number][],
  grid: Cell[][],
  paylineIndex: number
): PaylineCheckResult => {
  console.log(`\n🔍 Starting payline ${paylineIndex} check`);
  
  const symbols: number[] = payline.map(([row, col]) => grid[row][col].type);
  let matchCount = 0;
  let hasWild = false;
  let matchedPositions: [number, number][] = [];
  let matchedSymbols: number[] = [];
  let winnings = 0;
  let wildCount = 0;

  for (let i = 0; i < symbols.length - 2; i++) {
    const currentSymbol = symbols[i];
    
    if (currentSymbol === GAME_PIECES.WILD) {
      console.log(`⚠️ Skipping WILD as base symbol at position ${i}`);
      continue;
    }

    let consecutiveMatches = 1;
    let currentMatches: [number, number][] = [[payline[i][0], payline[i][1]]];
    let currentMatchedSymbols: number[] = [currentSymbol];
    wildCount = 0;

    for (let j = i + 1; j < symbols.length; j++) {
      const nextSymbol = symbols[j];
      if (nextSymbol === currentSymbol || nextSymbol === GAME_PIECES.WILD) {
        consecutiveMatches++;
        currentMatches.push([payline[j][0], payline[j][1]]);
        currentMatchedSymbols.push(nextSymbol);
        if (nextSymbol === GAME_PIECES.WILD) {
          wildCount++;
        }
      } else {
        break;
      }
    }

    if (consecutiveMatches >= 3) {
      matchCount = consecutiveMatches;
      hasWild = wildCount > 0;
      matchedPositions = currentMatches;
      matchedSymbols = currentMatchedSymbols;
      winnings = matchCount * (hasWild ? WILD_MULTIPLIER : 1);
      
      logPaylineCheck(paylineIndex, matchedSymbols, matchCount, matchedPositions, wildCount);
      break;
    }
  }

  const result: PaylineCheckResult = {
    hasMatches: matchCount >= 3,
    winnings,
    hasWild,
    matchedPositions,
    matchedSymbols,
    verificationId: generateVerificationId()
  };

  console.log(`✅ Payline ${paylineIndex} result:`, result);
  return result;
};

export const checkGameState = (
  grid: Cell[][],
  baseBet: number,
  betMultiplier: number,
  onWinningsUpdate: (winnings: number) => void
): GameCheckResult => {
  console.log('\n🎮 Starting new game state check');
  console.log('💰 Base bet:', baseBet, 'Multiplier:', betMultiplier);
  
  const newGrid = grid.map(row => row.map(cell => ({...cell, matched: false})));
  let currentTotalWinnings = 0;
  let highestMultiplier = 0;
  let hasWildBonus = false;
  let hasMatches = false;
  const allMatchedPositions: [number, number][] = [];
  const paylineResults: PaylineCheckResult[] = [];

  PAYLINES.forEach((payline, index) => {
    const typedPayline = payline.map(pos => [pos[0], pos[1]] as [number, number]);
    const result = checkPaylineMatch(typedPayline, newGrid, index);
    paylineResults.push(result);

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

      if (result.winnings > highestMultiplier) {
        highestMultiplier = result.winnings;
      }

      if (result.hasWild) {
        hasWildBonus = true;
      }
    }
  });

  const verificationDetails = {
    timestamp: new Date().toISOString(),
    paylineResults,
    totalPayout: currentTotalWinnings,
    gridSnapshot: JSON.stringify(grid)
  };

  console.log('\n📊 Game Check Summary:');
  console.log('💰 Total Winnings:', currentTotalWinnings);
  console.log('🎯 Total Matched Positions:', allMatchedPositions.length);
  console.log('🌟 Highest Multiplier:', highestMultiplier);
  console.log('🎲 Wild Bonus Applied:', hasWildBonus);

  return {
    hasMatches,
    totalWinnings: currentTotalWinnings,
    isBigWin: highestMultiplier >= 50,
    hasWildBonus,
    highestMultiplier,
    updatedGrid: newGrid,
    matchedPositions: allMatchedPositions,
    verificationDetails
  };
};