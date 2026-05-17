'use client';

import { useState } from 'react';
import { useHackathonStore, HackathonContext } from '@/lib/store';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader } from 'lucide-react';

type ParsingStage = 'idle' | 'reading' | 'analyzing' | 'extracting' | 'complete' | 'error';

const parsingStages = [
  { stage: 'reading' as ParsingStage, label: 'Reading hackathon rules...' },
  { stage: 'analyzing' as ParsingStage, label: 'Analyzing criteria...' },
  { stage: 'extracting' as ParsingStage, label: 'Extracting key details...' },
];

export function ContextParser() {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [stage, setStage] = useState<ParsingStage>('idle');
  const { setContext, setLoading, setError, error } = useHackathonStore();

  const simulateExtraction = async () => {
    setLoading(true);
    setStage('reading');
    setError(undefined);

    try {
      // Simulate stage progression
      for (const { stage: nextStage } of parsingStages) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setStage(nextStage);
      }

      // Simulate extraction result
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockContext: HackathonContext = {
        id: `hack_${Date.now()}`,
        name: 'Web3 Innovation Summit 2024',
        description:
          'A premier hackathon for decentralized innovation with focus on AI and blockchain integration',
        judgingCriteria: [
          { name: 'Innovation & Uniqueness', weight: 0.3 },
          { name: 'Technical Execution', weight: 0.25 },
          { name: 'Impact & Scalability', weight: 0.25 },
          { name: 'Team Presentation', weight: 0.2 },
        ],
        sponsorTracks: [
          'Best AI Integration',
          'Best Use of GenLayer',
          'Best Infrastructure',
        ],
        themes: [
          'Decentralized AI',
          'Cross-chain Interoperability',
          'On-chain Governance',
        ],
        requirements: [
          'Teams of 2-5 members',
          'Open source submission',
          'Live demo during judging',
          'GitHub repository with documentation',
        ],
        startDate: '2024-06-15',
        endDate: '2024-06-17',
        prizePool: '$250,000',
      };

      setContext(mockContext);
      setStage('complete');
      setInput('');
    } catch (err) {
      setStage('error');
      setError('Failed to parse hackathon details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    simulateExtraction();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Input Type Selector */}
      <div className="flex gap-2 mb-4">
        {(['text', 'url'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setInputType(type)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              inputType === type
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                : 'bg-black/30 text-purple-300 border border-purple-500/30 hover:border-purple-500/60'
            }`}
          >
            {type === 'text' ? 'Paste Details' : 'Enter URL'}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={stage !== 'idle'}
          placeholder={
            inputType === 'text'
              ? 'Paste hackathon rules, judging criteria, sponsor info, or any relevant details...'
              : 'Enter hackathon website URL...'
          }
          className="w-full h-32 p-4 rounded-lg bg-black/30 border border-purple-500/30 text-white placeholder-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none focus:outline-none focus:border-purple-500/60 transition-all"
        />
      </div>

      {/* Error Message */}
      {error && stage === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-red-300 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Parsing Progress */}
      {stage !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 space-y-2"
        >
          {parsingStages.map(({ stage: s, label }, idx) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="flex items-center gap-2 text-sm"
            >
              {stage === 'complete' ? (
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              ) : stage === s ? (
                <Loader className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" />
              ) : stage === 'error' ? (
                <div className="w-4 h-4 rounded-full border border-gray-500/50 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
              )}
              <span
                className={
                  stage === 'complete'
                    ? 'text-cyan-400'
                    : stage === s
                      ? 'text-purple-300'
                      : 'text-gray-500'
                }
              >
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Success Message */}
      {stage === 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-2 text-cyan-300 text-sm"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Hackathon context extracted successfully!</span>
        </motion.div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!input.trim() || stage !== 'idle'}
        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-purple-500/50"
      >
        {stage === 'idle'
          ? 'Parse Hackathon Details'
          : stage === 'complete'
            ? 'Context Loaded ✓'
            : 'Parsing...'}
      </button>
    </form>
  );
}
