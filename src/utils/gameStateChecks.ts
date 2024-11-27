import { Cell } from "./gameTypes";
import { GAME_PIECES, PAYLINES, WILD_MULTIPLIER } from "./gameConstants";

interface PaylineCheckResult {
  hasMatches: boolean;
  winnings: number;
  hasWild: boolean;
  matchedPositions: [number, number][];
  matchedSymbols: number[];
  verificationId: string;
  symbolCombination: string;
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
    id: string;
    timestamp: string;
    paylineResults: PaylineCheckResult[];
    totalPayout: number;
    gridSnapshot: string;
  };
}

const generateVerificationId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getSymbolName = (symbolId: number): string => {
  return Object.entries(GAME_PIECES).find(([_, value]) => value === symbolId)?.[0] || 'UNKNOWN';
};

const logPaylineCheck = (
  paylineIndex: number,
  symbols: number[],
  matches: number,
  positions: [number, number][],
  wildCount: number,
  verificationId: string
) => {
  console.log(`\n🎰 Payline #${paylineIndex} Check [${verificationId}]:`);
  console.log(`📊 Symbols:`, symbols.map(s => getSymbolName(s)).join(' → '));
  console.log(`✨ Matches: ${matches}`);
  console.log(`🌟 Wilds: ${wildCount}`);
  console.log(`📍 Positions:`, positions);
};

const checkPaylineMatch = (
  payline: [number, number][],
  grid: Cell[][],
  paylineIndex: number
): PaylineCheckResult => {
  const verificationId = generateVerificationId();
  console.log(`\n🔍 Starting payline ${paylineIndex} check [${verificationId}]`);
  
  const symbols: number[] = payline.map(([row, col]) => grid[row][col].type);
  let matchCount = 0;
  let hasWild = false;
  let matchedPositions: [number, number][] = [];
  let matchedSymbols: number[] = [];
  let winnings = 0;
  let wildCount = 0;
  let symbolCombination = '';

  for (let i = 0; i < symbols.length - 2; i++) {
    const currentSymbol = symbols[i];
    
    if (currentSymbol === GAME_PIECES.WILD) {
      console.log(`⚠️ [${verificationId}] Skipping WILD as base symbol at position ${i}`);
      continue;
    }

    let consecutiveMatches = 1;
    let currentMatches: [number, number][] = [[payline[i][0], payline[i][1]]];
    let currentMatchedSymbols: number[] = [currentSymbol];
    let currentWildCount = 0;
    let currentCombination = [getSymbolName(currentSymbol)];

    for (let j = i + 1; j < symbols.length; j++) {
      const nextSymbol = symbols[j];
      if (nextSymbol === currentSymbol || nextSymbol === GAME_PIECES.WILD) {
        consecutiveMatches++;
        currentMatches.push([payline[j][0], payline[j][1]]);
        currentMatchedSymbols.push(nextSymbol);
        currentCombination.push(getSymbolName(nextSymbol));
        if (nextSymbol === GAME_PIECES.WILD) {
          currentWildCount++;
        }
      } else {
        break;
      }
    }

    if (consecutiveMatches >= 3) {
      matchCount = consecutiveMatches;
      hasWild = currentWildCount > 0;
      matchedPositions = currentMatches;
      matchedSymbols = currentMatchedSymbols;
      wildCount = currentWildCount;
      symbolCombination = currentCombination.join(' → ');
      winnings = matchCount * (hasWild ? WILD_MULTIPLIER : 1);
      
      logPaylineCheck(
        paylineIndex,
        matchedSymbols,
        matchCount,
        matchedPositions,
        wildCount,
        verificationId
      );
      break;
    }
  }

  const result: PaylineCheckResult = {
    hasMatches: matchCount >= 3,
    winnings,
    hasWild,
    matchedPositions,
    matchedSymbols,
    verificationId,
    symbolCombination
  };

  console.log(`✅ Payline ${paylineIndex} result [${verificationId}]:`, {
    hasMatches: result.hasMatches,
    winnings: result.winnings,
    symbolCombination: result.symbolCombination,
    wildCount
  });
  
  return result;
};

export const checkGameState = (
  grid: Cell[][],
  baseBet: number,
  betMultiplier: number,
  onWinningsUpdate: (winnings: number) => void
): GameCheckResult => {
  const gameVerificationId = generateVerificationId();
  console.log(`\n🎮 Starting game state check [${gameVerificationId}]`);
  console.log(`💰 Bet: ${baseBet} × ${betMultiplier}`);
  
  const newGrid = grid.map(row => row.map(cell => ({...cell, matched: false})));
  let currentTotalWinnings = 0;
  let highestMultiplier = 0;
  let hasWildBonus = false;
  let hasMatches = false;
  const allMatchedPositions: [number, number][] = [];
  const paylineResults: PaylineCheckResult[] = [];

  PAYLINES.forEach((payline, index) => {
    console.log(`\n📍 Checking payline ${index} [${gameVerificationId}]`);
    const typedPayline = payline.map(pos => [pos[0], pos[1]] as [number, number]);
    const result = checkPaylineMatch(typedPayline, newGrid, index);
    paylineResults.push(result);

    if (result.hasMatches) {
      hasMatches = true;
      const winAmount = result.winnings * baseBet * betMultiplier;
      currentTotalWinnings += winAmount;
      
      console.log(`💎 Win on payline ${index} [${gameVerificationId}]:`);
      console.log(`   Combination: ${result.symbolCombination}`);
      console.log(`   Amount: ${winAmount}`);
      
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
    id: gameVerificationId,
    timestamp: new Date().toISOString(),
    paylineResults,
    totalPayout: currentTotalWinnings,
    gridSnapshot: JSON.stringify(grid)
  };

  console.log(`\n📊 Game Check Summary [${gameVerificationId}]:`);
  console.log(`💰 Total Win: ${currentTotalWinnings}`);
  console.log(`🎯 Matched Positions: ${allMatchedPositions.length}`);
  console.log(`🌟 Highest Multiplier: ${highestMultiplier}`);
  console.log(`🎲 Wild Bonus: ${hasWildBonus}`);
  console.log(`🔍 Verification ID: ${gameVerificationId}`);

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