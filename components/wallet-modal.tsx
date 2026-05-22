'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useWalletStore } from '@/lib/store';
import { X, Zap } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BrowserWalletProvider {
  isMetaMask?: boolean;
  isRabby?: boolean;
  isOkxWallet?: boolean;
  providers?: BrowserWalletProvider[];
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { setWallet } = useWalletStore();

  if (!isOpen || typeof document === 'undefined') return null;

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true);

    try {
      const provider = getBrowserWalletProvider();

      if (provider) {
        const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
        const address = accounts[0];
        const balanceHex = await provider.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        }) as string;
        const balance = Number(BigInt(balanceHex)) / 1e18;

        setWallet(address, 'testnet', balance.toFixed(4));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockAddress = `0x${Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('')}`;
        const mockBalance = (Math.random() * 10 + 0.5).toFixed(3);

        setWallet(mockAddress, 'testnet', mockBalance);
      }

      onClose();
    } finally {
      setIsConnecting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative z-[101] w-full max-w-md rounded-xl border border-purple-500/35 bg-black/95 p-6 shadow-2xl shadow-purple-900/30">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-purple-200 transition-colors hover:bg-purple-500/20 hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto mb-7 max-w-sm pr-8 text-center sm:pr-0">
          <h2 className="mb-3 text-2xl font-bold text-white">Connect Wallet</h2>
          <p className="text-sm leading-6 text-purple-100">
            Connect your wallet to submit projects and participate in evaluations
          </p>
        </div>

        <div className="space-y-3">
          {['MetaMask', 'WalletConnect', 'Coinbase'].map((wallet) => (
            <button
              key={wallet}
              onClick={() => handleConnect(wallet)}
              disabled={isConnecting}
              className="relative z-[102] w-full rounded-lg border border-purple-500/40 p-4 text-left transition-all hover:border-purple-400/70 hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50"
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

        <div className="mt-6 rounded-lg border border-cyan-500/35 bg-cyan-500/10 p-3 text-center">
          <p className="text-xs leading-5 text-cyan-100">
            Your wallet connection is secure and encrypted. We never store your
            private keys.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

function getBrowserWalletProvider(): BrowserWalletProvider | undefined {
  if (typeof window === 'undefined') return undefined;

  const provider = (window as Window & { ethereum?: BrowserWalletProvider }).ethereum;

  if (!provider) return undefined;

  const providers = Array.isArray(provider.providers) ? provider.providers : [provider];

  return (
    providers.find((candidate) => candidate.isMetaMask) ??
    providers.find((candidate) => candidate.isRabby) ??
    providers.find((candidate) => candidate.isOkxWallet) ??
    providers.find((candidate) => typeof candidate.request === 'function')
  );
}
