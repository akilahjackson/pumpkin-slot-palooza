import { Cell } from "../utils/gameTypes";
import { PUMPKIN_TYPES } from "../utils/gameConstants";
import GamePiece from "./GamePiece";
import { useEffect, useState } from "react";

interface GameBoardProps {
  grid: Cell[][];
  isInitialLoad: boolean;
}

const GameBoard = ({ grid, isInitialLoad }: GameBoardProps) => {
  const [visiblePieces, setVisiblePieces] = useState<boolean[][]>([]);

  useEffect(() => {
    if (!grid || grid.length === 0) return;

    // Initialize visibility matrix with the same dimensions as the grid
    const newVisiblePieces = Array(grid.length)
      .fill(false)
      .map(() => Array(grid[0].length).fill(false));
    
    setVisiblePieces(newVisiblePieces);

    // Show pieces one by one with delays
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
  }, [grid]);

  if (!grid || grid.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-grid">
      {grid.map((row, i) =>
        row.map((cell, j) => (
          <div key={cell.key} className="cell">
            {visiblePieces[i]?.[j] && (
              <GamePiece
                type={PUMPKIN_TYPES[cell.type]}
                isMatched={!isInitialLoad && cell.matched}
                isSelected={false}
                isDropping={cell.isDropping}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default GameBoard;