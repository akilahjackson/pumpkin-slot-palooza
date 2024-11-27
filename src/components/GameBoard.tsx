import { Cell } from "../utils/gameTypes";
import { PUMPKIN_TYPES } from "../utils/gameConstants";
import GamePiece from "./GamePiece";

interface GameBoardProps {
  grid: Cell[][];
}

const GameBoard = ({ grid }: GameBoardProps) => {
  return (
    <div className="game-grid">
      {grid.map((row, i) =>
        row.map((cell, j) => (
          <div key={cell.key} className="cell">
            <GamePiece
              type={PUMPKIN_TYPES[cell.type]}
              isMatched={cell.matched}
              isSelected={false}
              isDropping={cell.isDropping}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default GameBoard;