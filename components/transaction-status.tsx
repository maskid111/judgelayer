'use client';

import { useWalletStore, Transaction } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, Loader, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function TransactionStatus() {
  const { transactions } = useWalletStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (transactions.length === 0) {
    return null;
  }

  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />,
    confirming: <Loader className="w-4 h-4 text-purple-400 animate-spin" />,
    confirmed: <CheckCircle2 className="w-4 h-4 text-cyan-400" />,
    failed: <AlertCircle className="w-4 h-4 text-red-400" />,
  };

  const statusLabel = {
    pending: 'Pending',
    confirming: 'Confirming',
    confirmed: 'Confirmed',
    failed: 'Failed',
  };

  const statusColor = {
    pending: 'text-yellow-400',
    confirming: 'text-purple-400',
    confirmed: 'text-cyan-400',
    failed: 'text-red-400',
  };

  return (
    <div className="fixed bottom-6 right-6 max-w-sm z-40">
      <div className="space-y-2">
        <AnimatePresence>
          {transactions.slice(0, 3).map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20, x: 100 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 100 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="rounded-lg glassmorphism border border-purple-500/30 p-4 hover:border-purple-500/60 transition-all group">
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === tx.id ? null : tx.id
                    )
                  }
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {statusIcons[tx.status]}
                      <span className="font-semibold text-white capitalize text-sm">
                        {tx.type.replace('_', ' ')}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-purple-400 transition-transform ${
                        expandedId === tx.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${statusColor[tx.status]}`}>
                      {statusLabel[tx.status]}
                    </span>
                    <span className="text-xs text-purple-300">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === tx.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-purple-500/20 space-y-2 text-xs"
                    >
                      {tx.hash && (
                        <div>
                          <div className="text-purple-400 mb-1">TX Hash:</div>
                          <div className="font-mono text-cyan-300 truncate bg-black/30 p-2 rounded border border-purple-500/20">
                            {tx.hash}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        {Object.entries(tx.data).map(([key, value]) => (
                          <div key={key}>
                            <div className="text-purple-400 capitalize">
                              {key}:
                            </div>
                            <div className="text-cyan-300">
                              {typeof value === 'string'
                                ? value
                                : JSON.stringify(value)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {tx.status === 'failed' && (
                        <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/30 text-red-300">
                          Transaction failed. Please try again.
                        </div>
                      )}

                      {tx.status === 'confirmed' && (
                        <a
                          href="#"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors inline-block mt-2"
                        >
                          View on GenLayer Explorer →
                        </a>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress Bar for confirming status */}
                {tx.status === 'confirming' && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                    className="mt-2 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
