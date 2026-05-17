'use client';

import { useHackathonStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Badge, CheckCircle2, Calendar, Trophy, Target } from 'lucide-react';
import { GlowCard } from './glow-card';

export function ContextDisplay() {
  const { context } = useHackathonStore();

  if (!context) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">{context.name}</h2>
        <p className="text-purple-300 text-lg">{context.description}</p>
      </motion.div>

      {/* Key Details Grid */}
      <motion.div
        variants={itemVariants}
        className="grid md:grid-cols-2 gap-4"
      >
        <GlowCard glowColor="purple" className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Event Duration</h3>
          </div>
          <p className="text-purple-200">
            {new Date(context.startDate).toLocaleDateString()} -{' '}
            {new Date(context.endDate).toLocaleDateString()}
          </p>
        </GlowCard>

        {context.prizePool && (
          <GlowCard glowColor="cyan" className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">Prize Pool</h3>
            </div>
            <p className="text-cyan-300 font-bold text-lg">{context.prizePool}</p>
          </GlowCard>
        )}
      </motion.div>

      {/* Judging Criteria */}
      {context.judgingCriteria.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-semibold text-white">
              Judging Criteria
            </h3>
          </div>
          <div className="space-y-2">
            {context.judgingCriteria.map((criterion, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-3 rounded-lg bg-black/30 border border-purple-500/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">
                    {criterion.name}
                  </span>
                  <span className="text-cyan-400 font-bold">
                    {Math.round(criterion.weight * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/50 border border-purple-500/20 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${criterion.weight * 100}%` }}
                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sponsor Tracks */}
      {context.sponsorTracks.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Badge className="w-5 h-5 text-cyan-400" />
            Sponsor Tracks
          </h3>
          <div className="grid gap-2">
            {context.sponsorTracks.map((track, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-3 rounded-lg glassmorphism border border-cyan-500/30 hover:border-cyan-500/60 transition-all"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="text-white font-medium">{track}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Themes */}
      {context.themes.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Themes</h3>
          <div className="flex flex-wrap gap-2">
            {context.themes.map((theme, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/40 text-purple-200 font-medium hover:border-purple-500/60 transition-all"
              >
                {theme}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Requirements */}
      {context.requirements.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Requirements</h3>
          <ul className="space-y-2">
            {context.requirements.map((req, idx) => (
              <motion.li
                key={idx}
                variants={itemVariants}
                className="flex gap-3 p-2 rounded text-purple-200"
              >
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{req}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}
