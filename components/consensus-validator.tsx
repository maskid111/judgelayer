'use client'

import React from 'react'
import { motion, type Variants } from 'framer-motion'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'

interface ValidatorNode {
  id: string
  name: string
  score: number
  status: 'approved' | 'rejected' | 'pending'
  confidence?: number
}

interface ConsensusValidatorProps {
  validators: ValidatorNode[]
  consensusScore?: number
  projectTitle?: string
}

export function ConsensusValidator({
  validators,
  consensusScore = 0,
  projectTitle = 'Project Evaluation',
}: ConsensusValidatorProps) {
  const approvedCount = validators.filter((v) => v.status === 'approved').length
  const rejectedCount = validators.filter((v) => v.status === 'rejected').length
  const pendingCount = validators.filter((v) => v.status === 'pending').length

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  }

  const getStatusColor = (status: ValidatorNode['status']) => {
    switch (status) {
      case 'approved':
        return 'text-green-400'
      case 'rejected':
        return 'text-red-400'
      case 'pending':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: ValidatorNode['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5" />
      case 'rejected':
        return <AlertCircle className="w-5 h-5" />
      case 'pending':
        return <Clock className="w-5 h-5" />
      default:
        return null
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Consensus Score Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{projectTitle}</h2>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {consensusScore.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Consensus Score</p>
          </div>
        </div>
      </div>

      {/* Validators Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {validators.map((validator) => (
          <motion.div
            key={validator.id}
            variants={itemVariants}
            className="glassmorphism rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground text-sm">{validator.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">Validator</p>
              </div>
              <div className={`${getStatusColor(validator.status)}`}>
                {getStatusIcon(validator.status)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Score</span>
                <span className="text-lg font-bold text-accent">{validator.score}</span>
              </div>

              {validator.confidence !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Confidence</span>
                  <span className="text-sm text-purple-400">{(validator.confidence * 100).toFixed(0)}%</span>
                </div>
              )}

              {/* Progress bar for score */}
              <div className="w-full h-1.5 bg-secondary/30 rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${validator.score}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glassmorphism rounded-lg p-4 text-center border border-green-500/20">
          <div className="text-2xl font-bold text-green-400">{approvedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Approved</p>
        </div>
        <div className="glassmorphism rounded-lg p-4 text-center border border-red-500/20">
          <div className="text-2xl font-bold text-red-400">{rejectedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Rejected</p>
        </div>
        <div className="glassmorphism rounded-lg p-4 text-center border border-yellow-500/20">
          <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Pending</p>
        </div>
      </div>
    </div>
  )
}
