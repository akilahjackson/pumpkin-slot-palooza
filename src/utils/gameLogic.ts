import { Cell, Position } from './gameTypes';
import { GRID_SIZE, PUMPKIN_TYPES } from './gameConstants';

export const createInitialGrid = (): Cell[][] => {
  return Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      type: Math.floor(Math.random() * PUMPKIN_TYPES.length),
      matched: false,
      key: `${Date.now()}-${Math.random()}`,
      isDropping: true
    }))
  );
};

export const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
};

export const isAdjacent = (pos1: Position, pos2: Position): boolean => {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};