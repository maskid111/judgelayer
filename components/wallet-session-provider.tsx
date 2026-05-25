'use client';

import { useEffect } from 'react';
import { useWalletStore } from '@/lib/store';

interface BrowserWalletProvider {
  providers?: BrowserWalletProvider[];
  isMetaMask?: boolean;
  isRabby?: boolean;
  isOkxWallet?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: BrowserWalletProvider;
  }
}

export function WalletSessionProvider() {
  const setWallet = useWalletStore((state) => state.setWallet);
  const disconnect = useWalletStore((state) => state.disconnect);

  useEffect(() => {
    const provider = getBrowserWalletProvider();
    if (!provider) return;

    const restoreWallet = async () => {
      const persistedWallet = readPersistedWallet();
      if (persistedWallet?.address) {
        setWallet(persistedWallet.address, persistedWallet.network ?? 'unknown', persistedWallet.balance ?? '0.0000');
      }

      const accounts = await provider.request({ method: 'eth_accounts' }).catch(() => []);
      const address = Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : undefined;

      if (!address) {
        if (persistedWallet?.address) disconnect();
        return;
      }

      const [chainId, balance] = await Promise.all([
        provider.request({ method: 'eth_chainId' }).catch(() => 'unknown'),
        provider.request({ method: 'eth_getBalance', params: [address, 'latest'] }).catch(() => undefined),
      ]);

      setWallet(address, String(chainId ?? 'unknown'), formatEthBalance(balance));
    };

    const handleAccountsChanged = (accounts: unknown) => {
      if (!Array.isArray(accounts) || typeof accounts[0] !== 'string') {
        disconnect();
        return;
      }

      void restoreWallet();
    };

    const handleChainChanged = () => {
      void restoreWallet();
    };

    const handleDisconnect = () => {
      disconnect();
    };

    void restoreWallet();
    provider.on?.('accountsChanged', handleAccountsChanged);
    provider.on?.('chainChanged', handleChainChanged);
    provider.on?.('disconnect', handleDisconnect);

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      provider.removeListener?.('chainChanged', handleChainChanged);
      provider.removeListener?.('disconnect', handleDisconnect);
    };
  }, [disconnect, setWallet]);

  return null;
}

function getBrowserWalletProvider(): BrowserWalletProvider | undefined {
  if (typeof window === 'undefined') return undefined;

  const provider = window.ethereum;
  if (!provider) return undefined;

  const providers = Array.isArray(provider.providers) ? provider.providers : [provider];

  return (
    providers.find((candidate) => candidate.isMetaMask) ??
    providers.find((candidate) => candidate.isRabby) ??
    providers.find((candidate) => candidate.isOkxWallet) ??
    providers.find((candidate) => typeof candidate.request === 'function')
  );
}

function formatEthBalance(balance: unknown) {
  if (typeof balance !== 'string') return '0.0000';

  try {
    return (Number(BigInt(balance)) / 1e18).toFixed(4);
  } catch {
    return '0.0000';
  }
}

interface PersistedWalletState {
  isConnected: boolean;
  address?: string;
  network?: string;
  balance?: string;
}

function readPersistedWallet(): PersistedWalletState | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('judgelayer.wallet');
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedWalletState;
    return parsed?.isConnected && parsed.address ? parsed : null;
  } catch {
    return null;
  }
}
