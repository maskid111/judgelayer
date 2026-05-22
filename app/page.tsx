'use client'

import React, { useState, useEffect } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Zap, Shield, Network, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WalletButton } from '@/components/wallet-button'
import { useWalletStore } from '@/lib/store'
import Link from 'next/link'

export default function Home() {
  const { isConnected } = useWalletStore()
  const [networkStatus, setNetworkStatus] = useState('Live')

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  const floatingVariants: Variants = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 4, repeat: Infinity },
    },
  }

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Network Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-purple-500/20 bg-background/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur animate-pulse" />
              <div className="relative w-2 h-2 bg-cyan-500 rounded-full" />
            </div>
            <span className="text-sm text-cyan-400 font-medium">GenLayer Network {networkStatus}</span>
          </div>
          <WalletButton />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-20 md:pt-32">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-7xl font-black text-balance mb-6 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent"
          >
            JudgeLayer
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Decentralized AI evaluation protocol. Connect your wallet, submit your project, and receive transparent consensus-based evaluation from GenLayer validators.
          </motion.p>

          {/* CTA - Conditional based on wallet connection */}
          <motion.div variants={itemVariants} className="flex gap-4 justify-center flex-wrap">
            {isConnected ? (
              <Link href="/evaluate">
                <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700 px-8">
                  Start Evaluation
                  <Zap className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <div className="text-muted-foreground">
                <p className="mb-4">Connect your wallet to begin</p>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          className="mb-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="glassmorphism p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-4 text-foreground">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-cyan-400 mb-2">1</div>
                <p className="text-sm text-muted-foreground">
                  Connect your Web3 wallet to verify your identity on the GenLayer network
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-400 mb-2">2</div>
                <p className="text-sm text-muted-foreground">
                  Provide hackathon context and submit your project for evaluation
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-cyan-400 mb-2">3</div>
                <p className="text-sm text-muted-foreground">
                  Watch AI validators reach consensus and receive onchain-verified results
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Protocol Features */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              icon: Cpu,
              title: 'Multi-Model Consensus',
              description: 'GenLayer validators reach decentralized agreement',
            },
            {
              icon: Shield,
              title: 'Transparent & Fair',
              description: 'All scores and reasoning are publicly verifiable',
            },
            {
              icon: Network,
              title: 'Onchain Verified',
              description: 'Results are finalized and stored on the blockchain',
            },
            {
              icon: Zap,
              title: 'Real-Time Feedback',
              description: 'Instant detailed evaluation with AI explanations',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="glassmorphism p-6 rounded-lg border border-purple-500/20 hover:border-cyan-500/30 transition-all"
            >
              <feature.icon className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Wallet Connection Prompt */}
        {!isConnected && (
          <motion.div
            className="max-w-2xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="glassmorphism p-8 rounded-xl border border-cyan-500/30 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">Ready to get started?</h3>
              <p className="text-muted-foreground mb-6">
                Click the wallet button in the top right to connect your Web3 wallet. JudgeLayer supports MetaMask, WalletConnect, and Coinbase Wallet.
              </p>
              <div className="flex justify-center">
                <WalletButton />
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          className="text-center mt-20 pt-12 border-t border-purple-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-muted-foreground text-sm">
            Powered by GenLayer • Decentralized AI Evaluation Protocol
          </p>
        </motion.div>
      </div>
    </main>
  )
}
