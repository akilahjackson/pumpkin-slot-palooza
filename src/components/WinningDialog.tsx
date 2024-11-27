import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface WinningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  emoji: string;
}

const WinningDialog = ({ isOpen, onClose, message, emoji }: WinningDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-600/20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center space-y-4"
        >
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {emoji}
          </motion.div>
          <div className="overflow-hidden">
            {message.split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="inline-block text-2xl font-bold text-amber-200"
              >
                {char}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default WinningDialog;