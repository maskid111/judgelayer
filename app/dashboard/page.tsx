'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { GlowCard } from '@/components/glow-card'
import { ConsensusValidator } from '@/components/consensus-validator'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp } from 'lucide-react'

const projectData = {
  name: 'Neural Budget Optimizer',
  submitted: '2024-05-15',
  consensusScore: 87.5,
  validators: [
    { id: '1', name: 'CodeAnalyzer-Pro', score: 92, status: 'approved' as const, confidence: 0.98 },
    { id: '2', name: 'CreativeEval-V2', score: 85, status: 'approved' as const, confidence: 0.94 },
    { id: '3', name: 'SecurityAudit-AI', score: 88, status: 'approved' as const, confidence: 0.96 },
    { id: '4', name: 'InnovationMetrics', score: 85, status: 'pending' as const, confidence: 0.89 },
  ],
}

const scoreBreakdown = [
  { category: 'Code Quality', value: 92, max: 100 },
  { category: 'Innovation', value: 88, max: 100 },
  { category: 'Usability', value: 84, max: 100 },
  { category: 'Performance', value: 90, max: 100 },
  { category: 'Documentation', value: 86, max: 100 },
]

const timelineData = [
  { date: 'Day 1', consensus: 65, novelty: 70, impact: 60 },
  { date: 'Day 2', consensus: 72, novelty: 75, impact: 68 },
  { date: 'Day 3', consensus: 78, novelty: 82, impact: 75 },
  { date: 'Day 4', consensus: 85, novelty: 88, impact: 82 },
  { date: 'Day 5', consensus: 87.5, novelty: 89, impact: 85 },
]

const evaluationHistory = [
  { validator: 'CodeAnalyzer-Pro', timestamp: '2024-05-16 10:42', score: 92, category: 'Technical Excellence' },
  { validator: 'CreativeEval-V2', timestamp: '2024-05-16 10:45', score: 85, category: 'Innovation & Creativity' },
  { validator: 'SecurityAudit-AI', timestamp: '2024-05-16 10:48', score: 88, category: 'Security & Robustness' },
]

export default function DashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <main className="bg-background min-h-screen pb-20">
      {/* Animated gradient background */}
      <div className="fixed inset-0 animated-gradient opacity-20 pointer-events-none" />

      {/* Header */}
      <motion.div
        className="sticky top-0 z-40 backdrop-blur-sm border-b border-purple-500/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Project Dashboard</h1>
          <div className="w-10" />
        </div>
      </motion.div>

      <section className="relative pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-2">{projectData.name}</h2>
          <p className="text-muted-foreground">Submitted on {projectData.submitted}</p>
        </motion.div>

        {/* Consensus Validator - Main Hero */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <ConsensusValidator
            validators={projectData.validators}
            consensusScore={projectData.consensusScore}
            projectTitle={projectData.name}
          />
        </motion.div>

        {/* Analytics Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Score Radar */}
          <motion.div variants={itemVariants}>
            <GlowCard glowColor="purple">
              <h3 className="font-semibold text-foreground mb-4">Score Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={scoreBreakdown}>
                  <PolarGrid stroke="rgba(147, 51, 234, 0.2)" />
                  <PolarAngleAxis dataKey="category" stroke="rgba(147, 51, 234, 0.5)" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(147, 51, 234, 0.3)" />
                  <Radar name="Score" dataKey="value" stroke="#9333ea" fill="#9333ea" fillOpacity={0.5} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 10, 30, 0.9)',
                      border: '1px solid rgba(147, 51, 234, 0.3)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#9333ea' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </GlowCard>
          </motion.div>

          {/* Timeline Chart */}
          <motion.div variants={itemVariants}>
            <GlowCard glowColor="cyan">
              <h3 className="font-semibold text-foreground mb-4">Evaluation Progress</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timelineData}>
                  <CartesianGrid stroke="rgba(34, 211, 238, 0.1)" />
                  <XAxis dataKey="date" stroke="rgba(34, 211, 238, 0.5)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgba(34, 211, 238, 0.5)" tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 10, 30, 0.9)',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ color: 'rgba(147, 51, 234, 0.7)' }} />
                  <Line type="monotone" dataKey="consensus" stroke="#9333ea" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="novelty" stroke="#22d3ee" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="impact" stroke="#ec4899" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </GlowCard>
          </motion.div>

          {/* Key Metrics */}
          <motion.div variants={itemVariants} className="space-y-4">
            <GlowCard glowColor="blue">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm text-muted-foreground">Final Score</h4>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {projectData.consensusScore}
              </div>
              <p className="text-xs text-muted-foreground mt-2">4 validators evaluated</p>
            </GlowCard>

            <GlowCard glowColor="purple">
              <h4 className="text-sm text-muted-foreground mb-3">Validator Consensus</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Agreement</span>
                  <span className="text-green-400 font-semibold">94%</span>
                </div>
                <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400"
                    initial={{ width: 0 }}
                    animate={{ width: '94%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </GlowCard>

            <GlowCard glowColor="cyan">
              <h4 className="text-sm text-muted-foreground mb-3">Status</h4>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-semibold text-green-400">Approved</span>
              </div>
            </GlowCard>
          </motion.div>
        </motion.div>

        {/* Evaluation History */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <GlowCard glowColor="purple">
            <h3 className="font-semibold text-foreground mb-6">Evaluation History</h3>
            <div className="space-y-4">
              {evaluationHistory.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start justify-between p-4 rounded-lg bg-secondary/20 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{item.validator}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent">{item.score}</p>
                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlowCard>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <GlowCard interactive glowColor="cyan">
              <h3 className="font-semibold text-foreground mb-2">Detailed Report</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download full evaluation report with detailed feedback from each validator.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Download Report
              </Button>
            </GlowCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlowCard interactive glowColor="purple">
              <h3 className="font-semibold text-foreground mb-2">Submit Another Project</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ready to evaluate another project? Submit it now and get instant feedback.
              </p>
              <Link href="/submit">
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                  New Submission
                </Button>
              </Link>
            </GlowCard>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
