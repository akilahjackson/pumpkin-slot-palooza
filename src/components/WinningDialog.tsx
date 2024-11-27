import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Clover } from "lucide-react";

interface WinningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  emoji?: React.ReactNode;
}

const WinningDialog = ({ 
  isOpen, 
  onClose, 
  message, 
  emoji = <Clover className="text-green-500 w-16 h-16" /> 
}: WinningDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="bg-transparent border-none shadow-none backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center space-y-4 bg-amber-900/40 p-6 rounded-lg"
        >
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {emoji}
          </motion.div>
          <div className="overflow-hidden">
            <p className="text-2xl font-bold text-amber-200 leading-relaxed">
              {message}
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default WinningDialog;