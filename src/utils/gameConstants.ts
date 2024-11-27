export const GRID_SIZE = 6;

export const GAME_PIECES = {
  WILD: 0,
  PUMPKIN: 1,
  WHEAT: 2,
  APPLE: 3,
  CORN: 4,
  GRAPES: 5,
  MAPLE: 6,
  COINS: 7,
  CHERRY: 8,
  BANANA: 9,
  ORANGE: 10
} as const;

export const PUMPKIN_TYPES = [
  "🌟", // WILD
  "🎃", // PUMPKIN
  "🌾", // WHEAT
  "🍎", // APPLE
  "🌽", // CORN
  "🍇", // GRAPES
  "🍁", // MAPLE
  "💰", // COINS
  "🍒", // CHERRY
  "🍌", // BANANA
  "🍊"  // ORANGE
];

// Define paylines with proper typing
export const PAYLINES: [number, number][][] = [
  // Horizontal lines
  [[0,0], [0,1], [0,2], [0,3], [0,4], [0,5]],
  [[1,0], [1,1], [1,2], [1,3], [1,4], [1,5]],
  [[2,0], [2,1], [2,2], [2,3], [2,4], [2,5]],
  [[3,0], [3,1], [3,2], [3,3], [3,4], [3,5]],
  [[4,0], [4,1], [4,2], [4,3], [4,4], [4,5]],
  [[5,0], [5,1], [5,2], [5,3], [5,4], [5,5]],
  
  // Vertical lines
  [[0,0], [1,0], [2,0], [3,0], [4,0], [5,0]],
  [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2]],
  [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4]],
  
  // Diagonal lines
  [[0,0], [1,1], [2,2], [3,3], [4,4], [5,5]], // Main diagonal
  [[0,5], [1,4], [2,3], [3,2], [4,1], [5,0]], // Other diagonal
  [[0,2], [1,3], [2,4], [3,5]], // Short diagonal
];

export const WILD_MULTIPLIER = 2;