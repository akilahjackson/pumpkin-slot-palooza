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
        "transform hover:scale-105",
        isMatched && isWild ? "animate-flash" : 
        isMatched ? "animate-glow" : 
        "bg-amber-900/20 backdrop-blur-sm",
        isSelected && "ring-2 ring-amber-400",
        !isMatched && isDropping && "animate-drop",
        !isMatched && !isDropping && "animate-fade-in-down"
      )}
    >
      <span 
        className={cn(
          "text-3xl transform transition-all duration-300",
          "rounded-lg p-2",
          isMatched ? "text-white scale-125" : "bg-amber-400/5",
          isWild && "text-yellow-300 font-bold",
          isMatched && "animate-bounce",
          "hover:scale-110 select-none"
        )}
      >
        {type}
      </span>
    </div>
  );
};

export default GamePiece;