import { create } from 'zustand';

export interface Transaction {
  id: string;
  type: 'submission' | 'evaluation' | 'consensus';
  status: 'pending' | 'confirming' | 'confirmed' | 'failed';
  hash?: string;
  timestamp: number;
  data: Record<string, any>;
}

export interface WalletState {
  isConnected: boolean;
  address?: string;
  network?: 'mainnet' | 'testnet';
  balance?: string;
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  setWallet: (address: string, network: string, balance: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => {
  // Check for demo mode
  const isDemoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo');
  
  return {
  isConnected: isDemoMode,
  address: isDemoMode ? '0x742d35Cc6634C0532925a3b844Bc622e2eB17f53' : undefined,
  network: isDemoMode ? 'testnet' : undefined,
  balance: isDemoMode ? '5.42 ETH' : undefined,
  transactions: [],
  
  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions],
    })),
  
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      ),
    })),
  
  setWallet: (address, network, balance) =>
    set({
      isConnected: true,
      address,
      network: network as 'mainnet' | 'testnet',
      balance,
    }),
  
  disconnect: () =>
    set({
      isConnected: false,
      address: undefined,
      network: undefined,
      balance: undefined,
      transactions: [],
    }),
  }
});

export interface HackathonContext {
  id: string;
  name: string;
  description: string;
  judgingCriteria: Array<{ name: string; weight: number }>;
  sponsorTracks: string[];
  themes: string[];
  requirements: string[];
  startDate: string;
  endDate: string;
  prizePool?: string;
}

export interface HackathonState {
  context?: HackathonContext;
  isLoading: boolean;
  error?: string;
  setContext: (context: HackathonContext) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  clear: () => void;
}

export const useHackathonStore = create<HackathonState>((set) => ({
  context: undefined,
  isLoading: false,
  error: undefined,
  
  setContext: (context) =>
    set({
      context,
      error: undefined,
    }),
  
  setLoading: (isLoading) =>
    set({ isLoading }),
  
  setError: (error) =>
    set({ error }),
  
  clear: () =>
    set({
      context: undefined,
      error: undefined,
      isLoading: false,
    }),
}));
