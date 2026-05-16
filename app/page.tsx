'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, Network, Zap, Shield, BarChart3, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlowCard } from '@/components/glow-card'
import { ConsensusValidator } from '@/components/consensus-validator'
import Link from 'next/link'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning models evaluate projects with deep technical understanding and creativity scoring.',
  },
  {
    icon: Network,
    title: 'Decentralized Consensus',
    description: 'Multiple validators reach agreement through transparent consensus mechanisms, ensuring fair and unbiased evaluation.',
  },
  {
    icon: Zap,
    title: 'Real-Time Feedback',
    description: 'Get instant feedback on your project with detailed breakdowns of strengths and areas for improvement.',
  },
  {
    icon: Shield,
    title: 'Transparent Scoring',
    description: 'See exactly how validators evaluated your project with clear reasoning and scoring methodology.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboard showing your project performance across multiple evaluation dimensions.',
  },
  {
    icon: Cpu,
    title: 'Multi-Model Validation',
    description: 'Leverages multiple cutting-edge AI models to provide balanced and comprehensive evaluation.',
  },
]

const demoValidators = [
  { id: '1', name: 'Alpha', score: 92, status: 'approved' as const, confidence: 0.98 },
  { id: '2', name: 'Beta', score: 88, status: 'approved' as const, confidence: 0.95 },
  { id: '3', name: 'Gamma', score: 90, status: 'approved' as const, confidence: 0.96 },
  { id: '4', name: 'Delta', score: 85, status: 'pending' as const, confidence: 0.87 },
]

export default function Home() {
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
    <main className="bg-background min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 animated-gradient opacity-30 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Hero Badge */}
          <div className="flex justify-center">
            <div className="glassmorphism rounded-full px-4 py-2 border border-purple-500/30">
              <p className="text-sm text-purple-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Powered by Distributed AI Validators
              </p>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Decentralized AI
            </span>
            <br />
            <span className="text-foreground">Hackathon Evaluation</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Submit your projects and get evaluated by an ensemble of specialized AI validators. Transparent consensus scoring, real-time feedback, and detailed analytics for every submission.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <Link href="/submit">
              <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700">
                Submit Project
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-purple-500/30 hover:bg-purple-500/10">
                View Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Demo Consensus Validator - Hero Element */}
        <motion.div
          className="mt-24 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <ConsensusValidator
            validators={demoValidators}
            consensusScore={88.75}
            projectTitle="Example: Smart Contract Auditor"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose JudgeLayer?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built on cutting-edge AI and blockchain principles for fair, transparent project evaluation.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={index} variants={itemVariants}>
                  <GlowCard interactive glowColor={index % 2 === 0 ? 'purple' : 'cyan'}>
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg p-3 bg-purple-500/10 border border-purple-500/30 flex-shrink-0">
                        <Icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                      </div>
                    </div>
                  </GlowCard>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Simple process to get your project evaluated</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { number: '1', title: 'Submit', description: 'Upload your project details and source code' },
              { number: '2', title: 'Validate', description: 'Multiple AI validators analyze your project' },
              { number: '3', title: 'Consensus', description: 'Validators reach agreement on scoring' },
              { number: '4', title: 'Report', description: 'Get detailed feedback and analytics' },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="relative">
                  <GlowCard glowColor="blue">
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                        {step.number}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </GlowCard>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-purple-500/30" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <GlowCard animated glowColor="purple" className="border-purple-500/40">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Get Evaluated?</h2>
            <p className="text-muted-foreground mb-6">
              Submit your hackathon project now and get instant AI-powered feedback from multiple validators.
            </p>
            <Link href="/submit">
              <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                Submit Your Project
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </GlowCard>
        </motion.div>
      </section>
    </main>
  )
}
