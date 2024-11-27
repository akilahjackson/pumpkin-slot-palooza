import { Clover, Trophy } from "lucide-react";
import WinningDialog from "./WinningDialog";

interface GameDialogsProps {
  showLoseDialog: boolean;
  showWinDialog: boolean;
  isBigWin: boolean;
  winMultiplier?: number;
  totalWinAmount?: number;
  hasWildBonus?: boolean;
  onLoseDialogClose: () => void;
  onWinDialogClose: () => void;
}

const GameDialogs = ({
  showLoseDialog,
  showWinDialog,
  isBigWin,
  winMultiplier = 0,
  totalWinAmount = 0,
  hasWildBonus = false,
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

      {isBigWin && (
        <WinningDialog
          isOpen={showWinDialog}
          onClose={onWinDialogClose}
          message={`MASSIVE WIN! 🎰 🎉\n${winMultiplier}X MULTIPLIER!\nTotal Win: ${totalWinAmount.toFixed(3)} SOL${hasWildBonus ? '\nIncludes Wild Bonus! 🌟' : ''}`}
          emoji={<Trophy className="text-yellow-500 w-16 h-16 animate-flash" />}
          duration={5000}
          className="animate-flash"
        />
      )}
    </>
  );
};

export default GameDialogs;