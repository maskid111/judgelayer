'use client';

import { CheckCircle2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface EvaluationVerifiedProps {
  consensusHash: string;
  agreementPercentage: number;
  timestamp: string;
  confidence: number;
  validatorCount: number;
  dissentingValidators?: number;
}

export function EvaluationVerified({
  consensusHash,
  agreementPercentage,
  timestamp,
  confidence,
  validatorCount,
  dissentingValidators = 0,
}: EvaluationVerifiedProps) {
  const displayHash = `${consensusHash.substring(0, 10)}...${consensusHash.substring(consensusHash.length - 8)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-4 backdrop-blur-sm"
    >
      <div className="flex items-start gap-3 mb-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex-shrink-0"
        >
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
        </motion.div>
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Onchain Verified</h3>
          <p className="text-sm text-purple-300">
            Evaluation consensus verified on GenLayer
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Validator Agreement */}
        <div className="p-2 rounded bg-black/30 border border-purple-500/20">
          <div className="text-xs text-purple-300 mb-1">Consensus</div>
          <div className="text-lg font-bold text-cyan-400">
            {agreementPercentage}%
          </div>
          <div className="text-xs text-purple-400">
            {validatorCount - dissentingValidators}/{validatorCount} validators
          </div>
        </div>

        {/* Confidence Score */}
        <div className="p-2 rounded bg-black/30 border border-cyan-500/20">
          <div className="text-xs text-cyan-300 mb-1">Confidence</div>
          <div className="text-lg font-bold text-purple-400">{confidence}%</div>
          <div className="text-xs text-cyan-400">Score credibility</div>
        </div>
      </div>

      {/* Consensus Hash */}
      <div className="p-2 rounded bg-black/40 border border-purple-500/20 mb-4 font-mono text-xs">
        <div className="text-purple-300 mb-1">Consensus Hash</div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-cyan-400">{displayHash}</span>
          <a
            href={`#`}
            className="text-purple-400 hover:text-cyan-400 transition-colors flex-shrink-0"
            title="View on GenLayer"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-purple-300">
        Verified {timestamp}
      </div>

      {dissentingValidators > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 p-2 rounded bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300"
        >
          ⚠ {dissentingValidators} validator{dissentingValidators > 1 ? 's' : ''}{' '}
          disagreed with majority
        </motion.div>
      )}
    </motion.div>
  );
}
