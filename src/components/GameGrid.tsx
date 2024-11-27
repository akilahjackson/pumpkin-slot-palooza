import { useEffect, useState } from "react";
import { GRID_SIZE, PUMPKIN_TYPES, PAYLINES } from "../utils/gameConstants";
import { Cell, Position } from "../utils/gameTypes";
import { createInitialGrid, isValidPosition, isAdjacent } from "../utils/gameLogic";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

const harvestMessages = [
  "A bountiful harvest! 🌾",
  "Your fields are overflowing! 🌟",
  "Nature's abundance flows! 🍂",
  "A golden harvest awaits! ✨",
  "Prosperity blooms! 🌺",
];

const getRandomMessage = () => {
  return harvestMessages[Math.floor(Math.random() * harvestMessages.length)];
};

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

          toast({
            title: getRandomMessage(),
            description: `Payline ${paylineIndex + 1}: ${matchCount} matches for ${payout.toFixed(3)} SOL`,
            className: "bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 border-amber-300",
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
    <Card className="p-8 bg-gradient-to-b from-amber-900/10 to-orange-900/10 border-amber-600/20">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
            Harvest Match
          </h2>
          <div className="text-lg font-semibold text-amber-400">
            Total Harvest: {totalWinnings.toFixed(3)} SOL
          </div>
        </div>
        
        <div className="game-grid">
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={cell.key}
                className={`cell
                  ${cell.matched ? "animate-pulse bg-amber-400/20" : ""} 
                  ${cell.isDropping ? "animate-fade-in-down" : ""}
                  ${selectedCell?.row === i && selectedCell?.col === j ? "ring-2 ring-amber-400" : ""}
                  cursor-pointer hover:bg-amber-400/10 transition-all duration-300
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
    </Card>
  );
};

export default GameGrid;