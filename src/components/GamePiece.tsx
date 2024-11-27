import { cn } from "@/lib/utils";
import { GAME_PIECES, PUMPKIN_TYPES } from "@/utils/gameConstants";

interface GamePieceProps {
  type: string;
  isMatched: boolean;
  isSelected: boolean;
  isDropping: boolean;
}

const GamePiece = ({ type, isMatched, isSelected, isDropping }: GamePieceProps) => {
  const isWild = type === PUMPKIN_TYPES[GAME_PIECES.WILD];

  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center",
        "rounded-lg transition-all duration-300",
        "transform hover:scale-105",
        isMatched && isWild ? "animate-flash" : isMatched ? "bg-amber-500" : "bg-amber-900/20 backdrop-blur-sm",
        isSelected && "ring-2 ring-amber-400",
        isDropping && "animate-fade-in-down"
      )}
    >
      <span 
        className={cn(
          "text-3xl transform transition-all duration-300",
          "rounded-lg p-2",
          isMatched ? "text-white scale-105 animate-pulse" : "bg-amber-400/5",
          isWild && "text-yellow-300 font-bold",
          "hover:scale-110 select-none"
        )}
      >
        {type}
      </span>
    </div>
  );
};

export default GamePiece;