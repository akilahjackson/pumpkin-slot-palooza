import { useEffect, useState } from "react";

const GRID_SIZE = 6;
const PUMPKIN_TYPES = ["🎃", "👻", "🦇", "🕷️", "🕸️"];

interface Cell {
  type: number;
  matched: boolean;
  key: string;
}

const GameGrid = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const newGrid: Cell[][] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        row.push({
          type: Math.floor(Math.random() * PUMPKIN_TYPES.length),
          matched: false,
          key: `${i}-${j}-${Date.now()}`
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  };

  return (
    <div className="game-grid">
      {grid.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={cell.key}
            className={`cell ${cell.matched ? "matched" : ""}`}
          >
            <span className="text-3xl pumpkin">
              {PUMPKIN_TYPES[cell.type]}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default GameGrid;