import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

const HowToWinDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-amber-900/50 hover:bg-amber-800/50"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-b from-amber-950 to-orange-950 border-amber-600/20 text-amber-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-200 mb-4">How to Win</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-lg">
            Match 3 or more identical symbols in a row to win! Matches can be:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Horizontal (across any row)</li>
            <li>Vertical (down any column)</li>
            <li>Diagonal (corner to corner)</li>
          </ul>
          <div className="mt-4">
            <h3 className="font-bold text-amber-200 mb-2">Special Features:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>🌟 Wild symbols can match with any other symbol</li>
              <li>Wild combinations multiply your winnings by 2x</li>
              <li>Longer matches (4+ symbols) increase your winnings</li>
              <li>Big wins occur at 50x multiplier or higher!</li>
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-amber-200 mb-2">Betting:</h3>
            <p>Use the slider to adjust your bet multiplier. Higher bets mean bigger potential wins!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowToWinDialog;