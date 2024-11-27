import { Clover, Trophy } from "lucide-react";
import WinningDialog from "./WinningDialog";

interface GameDialogsProps {
  showLoseDialog: boolean;
  showWinDialog: boolean;
  isBigWin: boolean;
  onLoseDialogClose: () => void;
  onWinDialogClose: () => void;
}

const GameDialogs = ({
  showLoseDialog,
  showWinDialog,
  isBigWin,
  onLoseDialogClose,
  onWinDialogClose
}: GameDialogsProps) => {
  return (
    <>
      <WinningDialog
        isOpen={showLoseDialog}
        onClose={onLoseDialogClose}
        message="Better luck next time! 🍀"
        emoji={<Clover className="text-green-500 w-16 h-16" />}
        duration={5000}
      />

      <WinningDialog
        isOpen={showWinDialog}
        onClose={onWinDialogClose}
        message={isBigWin ? "MASSIVE WIN! 🎰 🎉\n50X OR HIGHER!" : "Congratulations! You've hit a winning combination! 🎉"}
        emoji={<Trophy className={`text-yellow-500 w-16 h-16 ${isBigWin ? 'animate-flash' : ''}`} />}
        duration={5000}
        className={isBigWin ? 'animate-flash' : ''}
      />
    </>
  );
};

export default GameDialogs;