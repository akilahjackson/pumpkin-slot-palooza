import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";

const WalletConnect = () => {
  const { wallet, balance, connectWallet, disconnectWallet } = useWallet();

  return (
    <div className="space-x-4">
      {wallet ? (
        <>
          <span className="text-sm text-gray-400">
            Balance: {balance.toFixed(4)} SOL
          </span>
          <Button
            variant="outline"
            onClick={disconnectWallet}
            className="border-casino-purple/20 text-casino-purple hover:bg-casino-purple/10"
          >
            Disconnect Wallet
          </Button>
        </>
      ) : (
        <Button
          onClick={connectWallet}
          className="bg-gradient-to-r from-casino-purple to-casino-orange hover:opacity-90 transition-opacity"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default WalletConnect;