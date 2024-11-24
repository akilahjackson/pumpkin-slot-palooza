import { useEffect, useState } from "react";

const GRID_SIZE = 6;
const PUMPKIN_TYPES = ["🎃", "👻", "🦇", "🕷️", "🕸️"];

interface Cell {
  type: number;
  matched: boolean;
  key: string;
}

interface Position {
  row: number;
  col: number;
}

const GameGrid = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [isChecking, setIsChecking] = useState(false);

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
          key: `${i}-${j}-${Date.now()}-${Math.random()}`
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  };

  const isAdjacent = (pos1: Position, pos2: Position) => {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const swapCells = async (pos1: Position, pos2: Position) => {
    const newGrid = [...grid];
    const temp = { ...newGrid[pos1.row][pos1.col] };
    newGrid[pos1.row][pos1.col] = { ...newGrid[pos2.row][pos2.col] };
    newGrid[pos2.row][pos2.col] = temp;
    setGrid(newGrid);
    
    // Check for matches after swap
    const hasMatches = await checkMatches();
    if (!hasMatches) {
      // Swap back if no matches
      setTimeout(() => {
        const revertGrid = [...newGrid];
        revertGrid[pos1.row][pos1.col] = temp;
        revertGrid[pos2.row][pos2.col] = newGrid[pos1.row][pos1.col];
        setGrid(revertGrid);
      }, 500);
    }
  };

  const checkMatches = async (): Promise<boolean> => {
    setIsChecking(true);
    let hasMatches = false;
    const newGrid = [...grid];
    
    // Check rows
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE - 2; j++) {
        if (
          newGrid[i][j].type === newGrid[i][j + 1].type &&
          newGrid[i][j].type === newGrid[i][j + 2].type
        ) {
          newGrid[i][j].matched = true;
          newGrid[i][j + 1].matched = true;
          newGrid[i][j + 2].matched = true;
          hasMatches = true;
        }
      }
    }

    // Check columns
    for (let i = 0; i < GRID_SIZE - 2; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (
          newGrid[i][j].type === newGrid[i + 1][j].type &&
          newGrid[i][j].type === newGrid[i + 2][j].type
        ) {
          newGrid[i][j].matched = true;
          newGrid[i + 1][j].matched = true;
          newGrid[i + 2][j].matched = true;
          hasMatches = true;
        }
      }
    }

    if (hasMatches) {
      setGrid(newGrid);
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 500));
      // Remove matched pieces and drop new ones
      await handleMatches();
    }

    setIsChecking(false);
    return hasMatches;
  };

  const handleMatches = async () => {
    const newGrid = [...grid];
    
    // Remove matched pieces and drop new ones
    for (let col = 0; col < GRID_SIZE; col++) {
      let writeRow = GRID_SIZE - 1;
      
      // Move unmatched pieces down
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (!newGrid[row][col].matched) {
          if (writeRow !== row) {
            newGrid[writeRow][col] = newGrid[row][col];
            newGrid[row][col] = {
              type: Math.floor(Math.random() * PUMPKIN_TYPES.length),
              matched: false,
              key: `${row}-${col}-${Date.now()}-${Math.random()}`
            };
          }
          writeRow--;
        }
      }
      
      // Fill empty spaces with new pieces
      while (writeRow >= 0) {
        newGrid[writeRow][col] = {
          type: Math.floor(Math.random() * PUMPKIN_TYPES.length),
          matched: false,
          key: `${writeRow}-${col}-${Date.now()}-${Math.random()}`
        };
        writeRow--;
      }
    }
    
    setGrid(newGrid);
    // Check for new matches after pieces have dropped
    await new Promise(resolve => setTimeout(resolve, 300));
    await checkMatches();
  };

  const handleCellClick = (row: number, col: number) => {
    if (isChecking) return;

    const clickedPosition = { row, col };
    
    if (!selectedCell) {
      setSelectedCell(clickedPosition);
      return;
    }

    if (row === selectedCell.row && col === selectedCell.col) {
      setSelectedCell(null);
      return;
    }

    if (isAdjacent(selectedCell, clickedPosition)) {
      swapCells(selectedCell, clickedPosition);
      setSelectedCell(null);
    } else {
      setSelectedCell(clickedPosition);
    }
  };

  return (
    <div className="game-grid">
      {grid.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={cell.key}
            className={`cell ${cell.matched ? "matched" : ""} ${
              selectedCell?.row === i && selectedCell?.col === j ? "selected" : ""
            } cursor-pointer hover:bg-white/20`}
            onClick={() => handleCellClick(i, j)}
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