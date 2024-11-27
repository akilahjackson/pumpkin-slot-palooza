import { cn } from "@/lib/utils";
import { GAME_PIECES, PUMPKIN_TYPES } from "@/utils/gameConstants";

interface GamePieceProps {
  type: string;
  isMatched: boolean;
  isSelected: boolean;
  isDropping: boolean;
  dropDelay?: number;
}

const GamePiece = ({ type, isMatched, isSelected, isDropping, dropDelay = 0 }: GamePieceProps) => {
  const isWild = type === PUMPKIN_TYPES[GAME_PIECES.WILD];
  const style = {
    animationDelay: isDropping ? `${dropDelay}ms` : '0ms'
  };

  return (
    <div
      style={style}
      className={cn(
        "relative w-full h-full flex items-center justify-center",
        "rounded-lg transition-all duration-300",
        "transform",
        isMatched && [
          "bg-amber-500/50",
          "border-2 border-amber-400",
          "scale-105",
          "shadow-lg shadow-amber-400/50",
          isWild ? "animate-piece-flash" : "animate-piece-glow"
        ],
        !isMatched && "bg-amber-900/20 backdrop-blur-sm",
        isSelected && "ring-2 ring-amber-400",
        !isMatched && isDropping && "animate-piece-drop",
        !isMatched && !isDropping && "animate-piece-enter"
      )}
      data-type={type}
      data-matched={isMatched}
      data-wild={isWild}
    >
      <span 
        className={cn(
          "text-3xl transform transition-all duration-300",
          "rounded-lg p-2",
          isMatched ? "text-white" : "bg-amber-400/5",
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