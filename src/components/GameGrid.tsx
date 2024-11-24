import { useEffect, useState } from "react";
import { GRID_SIZE, PUMPKIN_TYPES, PAYLINES } from "../utils/gameConstants";
import { Cell, Position } from "../utils/gameTypes";
import { createInitialGrid, isValidPosition, isAdjacent } from "../utils/gameLogic";
import { toast } from "@/components/ui/use-toast";

const GameGrid = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [totalWinnings, setTotalWinnings] = useState(0);

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const newGrid = createInitialGrid();
    setGrid(newGrid);
    
    setTimeout(() => {
      const updatedGrid = newGrid.map(row =>
        row.map(cell => ({ ...cell, isDropping: false }))
      );
      setGrid(updatedGrid);
      checkAllPaylines();
    }, 500);
  };

  const calculatePayout = (matchCount: number): number => {
    // Base payout of 0.01 SOL per match, multiplied by the number of matching pieces
    return 0.01 * matchCount;
  };

  const checkAllPaylines = async () => {
    if (!grid.length) return false;
    
    setIsChecking(true);
    let hasMatches = false;
    const newGrid = [...grid];
    let currentWinnings = 0;
    
    PAYLINES.forEach((payline, paylineIndex) => {
      const validPositions = payline.filter(([row, col]) => 
        isValidPosition(row, col)
      );

      if (validPositions.length < 3) return;

      const symbols = validPositions.map(([row, col]) => newGrid[row][col].type);
      
      for (let i = 0; i < symbols.length - 2; i++) {
        if (symbols[i] === symbols[i + 1] && symbols[i] === symbols[i + 2]) {
          // Count how many pieces match in sequence
          let matchCount = 3;
          for (let j = i + 3; j < symbols.length; j++) {
            if (symbols[j] === symbols[i]) {
              matchCount++;
            } else {
              break;
            }
          }

          const payout = calculatePayout(matchCount);
          currentWinnings += payout;

          validPositions.slice(i, i + matchCount).forEach(([row, col]) => {
            newGrid[row][col].matched = true;
            hasMatches = true;
          });

          // Show toast message for the win
          toast({
            title: "Winner! 🎉",
            description: `Payline ${paylineIndex + 1}: ${matchCount} matches for ${payout.toFixed(3)} SOL`,
          });
        }
      }
    });

    if (hasMatches) {
      setGrid(newGrid);
      setTotalWinnings(prev => prev + currentWinnings);
      await new Promise(resolve => setTimeout(resolve, 500));
      await handleMatches();
    }

    setIsChecking(false);
    return hasMatches;
  };

  const handleMatches = async () => {
    const newGrid = [...grid];
    
    for (let col = 0; col < GRID_SIZE; col++) {
      let writeRow = GRID_SIZE - 1;
      
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
    
    setTimeout(() => {
      const updatedGrid = newGrid.map(row =>
        row.map(cell => ({ ...cell, isDropping: false }))
      );
      setGrid(updatedGrid);
      checkAllPaylines();
    }, 300);
  };

  const swapCells = async (pos1: Position, pos2: Position) => {
    if (isChecking || !isValidPosition(pos1.row, pos1.col) || !isValidPosition(pos2.row, pos2.col)) return;

    const newGrid = [...grid];
    const temp = { ...newGrid[pos1.row][pos1.col] };
    newGrid[pos1.row][pos1.col] = { ...newGrid[pos2.row][pos2.col] };
    newGrid[pos2.row][pos2.col] = temp;
    setGrid(newGrid);
    
    const hasMatches = await checkAllPaylines();
    if (!hasMatches) {
      setTimeout(() => {
        const revertGrid = [...newGrid];
        revertGrid[pos1.row][pos1.col] = temp;
        revertGrid[pos2.row][pos2.col] = newGrid[pos1.row][pos1.col];
        setGrid(revertGrid);
      }, 500);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (isChecking || !isValidPosition(row, col)) return;

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

  if (!grid.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Match 3 Game</h2>
        <div className="text-lg font-semibold text-casino-purple">
          Total Winnings: {totalWinnings.toFixed(3)} SOL
        </div>
      </div>
      
      <div className="game-grid">
        {grid.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={cell.key}
              className={`cell
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
    </div>
  );
};

export default GameGrid;