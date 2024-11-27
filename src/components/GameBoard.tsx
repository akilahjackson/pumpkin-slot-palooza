import { Cell } from "../utils/gameTypes";
import { PUMPKIN_TYPES } from "../utils/gameConstants";
import GamePiece from "./GamePiece";
import { useEffect, useState } from "react";

interface GameBoardProps {
  grid: Cell[][];
  isInitialLoad: boolean;
}

const GameBoard = ({ grid, isInitialLoad }: GameBoardProps) => {
  const [visiblePieces, setVisiblePieces] = useState<boolean[][]>(
    Array(grid.length).fill(null).map(() => Array(grid[0].length).fill(false))
  );

  useEffect(() => {
    // Reset visibility when grid changes
    setVisiblePieces(Array(grid.length).fill(null).map(() => Array(grid[0].length).fill(false)));
    
    // Show pieces one by one with delays
    grid.forEach((row, i) => {
      row.forEach((_, j) => {
        setTimeout(() => {
          setVisiblePieces(prev => {
            const newVisible = prev.map(row => [...row]);
            newVisible[i][j] = true;
            return newVisible;
          });
        }, (i * grid[0].length + j) * 100); // 100ms delay between each piece
      });
    });
  }, [grid]);

  return (
    <div className="game-grid">
      {grid.map((row, i) =>
        row.map((cell, j) => (
          <div key={cell.key} className="cell">
            {visiblePieces[i][j] && (
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