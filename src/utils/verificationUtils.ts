export const generateVerificationId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getSymbolName = (symbolId: number): string => {
  const symbols: Record<number, string> = {
    0: 'WILD',
    1: 'PUMPKIN',
    2: 'WHEAT',
    3: 'APPLE',
    4: 'CORN',
    5: 'GRAPES',
    6: 'MAPLE',
    7: 'COINS',
    8: 'CHERRY',
    9: 'BANANA',
    10: 'ORANGE'
  };
  return symbols[symbolId] || 'UNKNOWN';
};

export const logPaylineCheck = (
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

export const createGameStateSnapshot = (grid: any[][], matchedPositions: [number, number][]) => {
  return {
    timestamp: new Date().toISOString(),
    gridState: JSON.stringify(grid),
    matchedPositions: JSON.stringify(matchedPositions),
    verificationId: generateVerificationId()
  };
};