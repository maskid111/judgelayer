'use client';

import { useState } from 'react';
import { useWalletStore } from '@/lib/store';
import { Wallet, LogOut } from 'lucide-react';
import { WalletModal } from './wallet-modal';

export function WalletButton() {
  const [showModal, setShowModal] = useState(false);
  const { isConnected, address, balance, disconnect } = useWalletStore();

  const handleDisconnect = () => {
    disconnect();
  };

  const displayAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : null;

  if (isConnected && displayAddress && balance) {
    return (
      <>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg glassmorphism border border-purple-500/30 hover:border-purple-500/50 transition-all">
          <div className="flex flex-col items-end">
            <span className="text-sm text-cyan-400 font-semibold">
              {displayAddress}
            </span>
            <span className="text-xs text-purple-300">{balance} ETH</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="p-1.5 hover:bg-purple-500/20 rounded transition-colors"
            aria-label="Disconnect wallet"
          >
            <LogOut className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>
      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
