'use client';

import { useState } from 'react';
import { useWalletStore } from '@/lib/store';
import { X, Zap } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { setWallet } = useWalletStore();

  if (!isOpen) return null;

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true);
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock wallet address and balance
    const mockAddress = `0x${Array(40)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')}`;
    const mockBalance = (Math.random() * 10 + 0.5).toFixed(3);

    setWallet(mockAddress, 'testnet', mockBalance);
    setIsConnecting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-full max-w-md mx-4 p-6 rounded-xl glassmorphism border border-purple-500/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-purple-500/20 rounded transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-purple-300" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-purple-200 text-sm">
            Connect your wallet to submit projects and participate in evaluations
          </p>
        </div>

        <div className="space-y-3">
          {['MetaMask', 'WalletConnect', 'Coinbase'].map((wallet) => (
            <button
              key={wallet}
              onClick={() => handleConnect(wallet)}
              disabled={isConnecting}
              className="w-full p-4 rounded-lg border border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">{wallet}</div>
                  {isConnecting && (
                    <div className="text-xs text-purple-300">Connecting...</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <p className="text-xs text-cyan-200">
            Your wallet connection is secure and encrypted. We never store your
            private keys.
          </p>
        </div>
      </div>
    </div>
  );
}
