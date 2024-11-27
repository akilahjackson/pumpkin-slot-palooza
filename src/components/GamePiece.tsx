import { cn } from "@/lib/utils";

interface GamePieceProps {
  type: string;
  isMatched: boolean;
  isSelected: boolean;
  isDropping: boolean;
}

const GamePiece = ({ type, isMatched, isSelected, isDropping }: GamePieceProps) => {
  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center",
        "rounded-lg backdrop-blur-sm transition-all duration-300",
        "transform hover:scale-105",
        isMatched && "scale-105 animate-pulse shadow-lg shadow-amber-400/50",
        isSelected && "ring-2 ring-amber-400",
        isDropping && "animate-fade-in-down"
      )}
    >
      <span 
        className={cn(
          "text-3xl transform transition-all duration-300",
          "rounded-lg p-2 bg-amber-400/5",
          "hover:scale-110 select-none",
          isMatched && "scale-105 shadow-xl"
        )}
      >
        {type}
      </span>
    </div>
  );
};

export default GamePiece;