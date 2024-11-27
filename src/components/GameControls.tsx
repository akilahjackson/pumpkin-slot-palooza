import { Button } from "@/components/ui/button";

interface GameControlsProps {
  onSpin: () => void;
  isSpinning: boolean;
}

const GameControls = ({ onSpin, isSpinning }: GameControlsProps) => {
  return (
    <Button
      onClick={onSpin}
      disabled={isSpinning}
      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3"
    >
      {isSpinning ? "Spinning..." : "Spin"}
    </Button>
  );
};

export default GameControls;