import { useEffect, useState } from "react";

const GRID_SIZE = 6;
const PUMPKIN_TYPES = ["🎃", "👻", "🦇", "🕷️", "🕸️"];

// Define the 12 paylines (horizontal, vertical, and diagonal patterns)
const PAYLINES = [
  // Horizontal lines (5)
  [[0,0], [0,1], [0,2], [0,3], [0,4], [0,5]],
  [[1,0], [1,1], [1,2], [1,3], [1,4], [1,5]],
  [[2,0], [2,1], [2,2], [2,3], [2,4], [2,5]],
  [[3,0], [3,1], [3,2], [3,3], [3,4], [3,5]],
  [[4,0], [4,1], [4,2], [4,3], [4,4], [4,5]],
  [[5,0], [5,1], [5,2], [5,3], [5,4], [5,5]],
  // Vertical lines (3)
  [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2]],
  [[0,3], [1,3], [2,3], [3,3], [4,3], [5,3]],
  [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4]],
  // Diagonal lines (3)
  [[0,0], [1,1], [2,2], [3,3], [4,4], [5,5]], // Diagonal from top-left
  [[0,5], [1,4], [2,3], [3,2], [4,1], [5,0]], // Diagonal from top-right
  [[2,0], [3,1], [4,2], [5,3]], // Short diagonal
];

interface Cell {
  type: number;
  matched: boolean;
  key: string;
  isDropping: boolean;
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
    const newGrid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        type: Math.floor(Math.random() * PUMPKIN_TYPES.length),
        matched: false,
        key: `${Date.now()}-${Math.random()}`,
        isDropping: true
      }))
    );

    setGrid(newGrid);
    
    // Animate pieces dropping in
    setTimeout(() => {
      const updatedGrid = newGrid.map(row =>
        row.map(cell => ({ ...cell, isDropping: false }))
      );
      setGrid(updatedGrid);
      checkAllPaylines();
    }, 500);
  };

  const checkAllPaylines = async () => {
    setIsChecking(true);
    let hasMatches = false;
    const newGrid = [...grid];
    
    // Check each payline for matches
    PAYLINES.forEach(payline => {
      // Get the symbols in the current payline
      const symbols = payline.map(([row, col]) => newGrid[row][col].type);
      
      // Check for 3 or more consecutive matches
      for (let i = 0; i < symbols.length - 2; i++) {
        if (symbols[i] === symbols[i + 1] && symbols[i] === symbols[i + 2]) {
          // Mark matched cells
          payline.slice(i, i + 3).forEach(([row, col]) => {
            newGrid[row][col].matched = true;
            hasMatches = true;
          });
        }
      }
    });

    if (hasMatches) {
      setGrid(newGrid);
      await new Promise(resolve => setTimeout(resolve, 500));
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
            newGrid[writeRow][col] = {
              ...newGrid[row][col],
              isDropping: true
            };
            newGrid[row][col] = {
              type: Math.floor(Math.random() * PUMPKIN_TYPES.length),
              matched: false,
              key: `${Date.now()}-${Math.random()}`,
              isDropping: true
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
          key: `${Date.now()}-${Math.random()}`,
          isDropping: true
        };
        writeRow--;
      }
    }
    
    setGrid(newGrid);
    
    // Animate new pieces dropping
    setTimeout(() => {
      const updatedGrid = newGrid.map(row =>
        row.map(cell => ({ ...cell, isDropping: false }))
      );
      setGrid(updatedGrid);
      checkAllPaylines();
    }, 300);
  };

  const swapCells = async (pos1: Position, pos2: Position) => {
    if (isChecking) return;

    const newGrid = [...grid];
    const temp = { ...newGrid[pos1.row][pos1.col] };
    newGrid[pos1.row][pos1.col] = { ...newGrid[pos2.row][pos2.col] };
    newGrid[pos2.row][pos2.col] = temp;
    setGrid(newGrid);
    
    const hasMatches = await checkAllPaylines();
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

  const isAdjacent = (pos1: Position, pos2: Position) => {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
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
    <div className="game-grid grid grid-cols-6 gap-1 p-4 bg-black/20 rounded-lg">
      {grid.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={cell.key}
            className={`cell aspect-square flex items-center justify-center 
              ${cell.matched ? "animate-pulse bg-white/20" : ""} 
              ${cell.isDropping ? "animate-fade-in-down" : ""}
              ${selectedCell?.row === i && selectedCell?.col === j ? "ring-2 ring-white" : ""}
              cursor-pointer hover:bg-white/20 transition-all duration-300
              rounded-lg backdrop-blur-sm`}
            onClick={() => handleCellClick(i, j)}
          >
            <span className="text-3xl transform transition-transform hover:scale-110">
              {PUMPKIN_TYPES[cell.type]}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default GameGrid;