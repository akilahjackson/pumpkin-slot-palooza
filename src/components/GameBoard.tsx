import { Cell } from "../utils/gameTypes";
import { PUMPKIN_TYPES } from "../utils/gameConstants";
import GamePiece from "./GamePiece";
import { useEffect, useState, useCallback } from "react";

interface GameBoardProps {
  grid: Cell[][];
  isInitialLoad: boolean;
}

const GameBoard = ({ grid, isInitialLoad }: GameBoardProps) => {
  const [visiblePieces, setVisiblePieces] = useState<boolean[][]>([]);
  const [currentGrid, setCurrentGrid] = useState<Cell[][]>([]);

  // Initialize visibility matrix when grid changes
  useEffect(() => {
    console.log('Grid updated in GameBoard:', grid);
    if (!grid || grid.length === 0) return;

    setCurrentGrid(grid);
    
    if (isInitialLoad) {
      console.log('Initial load - setting up visibility animation');
      const newVisiblePieces = Array(grid.length)
        .fill(false)
        .map(() => Array(grid[0].length).fill(false));
      
      setVisiblePieces(newVisiblePieces);

      grid.forEach((row, i) => {
        row.forEach((_, j) => {
          setTimeout(() => {
            setVisiblePieces(prev => {
              const newVisible = prev.map(row => [...row]);
              newVisible[i][j] = true;
              return newVisible;
            });
          }, (i * grid[0].length + j) * 100);
        });
      });
    } else {
      console.log('Not initial load - all pieces visible');
      setVisiblePieces(Array(grid.length)
        .fill(true)
        .map(() => Array(grid[0].length).fill(true))
      );
    }
  }, [grid, isInitialLoad]);

  if (!currentGrid || currentGrid.length === 0) {
    console.log('Loading state - no grid available');
    return <div>Loading...</div>;
  }

  return (
    <div className="game-grid">
      {currentGrid.map((row, i) =>
        row.map((cell, j) => (
          <div key={`${cell.key}-${cell.matched}`} className="cell">
            {(!isInitialLoad || (visiblePieces[i] && visiblePieces[i][j])) && (
              <GamePiece
                type={PUMPKIN_TYPES[cell.type]}
                isMatched={cell.matched}
                isSelected={false}
                isDropping={cell.isDropping}
                dropDelay={cell.dropDelay}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default GameBoard;