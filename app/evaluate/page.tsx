'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Upload, Zap, CheckCircle2, Loader2, ArrowLeft, Eye, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlowCard } from '@/components/glow-card'
import { ConsensusValidator } from '@/components/consensus-validator'
import { EvaluationVerified } from '@/components/evaluation-verified'
import { useWalletStore } from '@/lib/store'
import Link from 'next/link'

const EVALUATION_STEPS = [
  { id: 1, name: 'Hackathon Context', icon: '📋' },
  { id: 2, name: 'Project Details', icon: '🚀' },
  { id: 3, name: 'Submit & Review', icon: '⚡' },
  { id: 4, name: 'Consensus', icon: '🤖' },
  { id: 5, name: 'Results', icon: '✨' },
]

export default function EvaluatePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [consensusActive, setConsensusActive] = useState(false)
  const { isConnected, addTransaction } = useWalletStore()

  // Hackathon context state
  const [hackathonContext, setHackathonContext] = useState('')
  const [extractedContext, setExtractedContext] = useState<any>(null)
  const [parsingState, setParsingState] = useState<'idle' | 'reading' | 'analyzing' | 'extracting'>('idle')

  // Project submission state
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    teamSize: '',
    technologies: '',
  })

  // Results state
  const [evaluationResults, setEvaluationResults] = useState<any>(null)

  const demoValidators = [
    { id: '1', name: 'Alpha', score: 92, status: 'approved' as const, confidence: 0.98 },
    { id: '2', name: 'Beta', score: 88, status: 'approved' as const, confidence: 0.95 },
    { id: '3', name: 'Gamma', score: 90, status: 'approved' as const, confidence: 0.96 },
    { id: '4', name: 'Delta', score: 85, status: 'approved' as const, confidence: 0.92 },
  ]

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism p-8 rounded-xl border border-purple-500/20 text-center max-w-md"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">Wallet Connection Required</h2>
          <p className="text-muted-foreground mb-6">
            You must connect your wallet to access the evaluation protocol. Please return to the home page and connect.
          </p>
          <Link href="/">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  const handleParseHackathon = async () => {
    if (!hackathonContext.trim()) return

    setParsingState('reading')
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setParsingState('analyzing')
    await new Promise((resolve) => setTimeout(resolve, 1200))

    setParsingState('extracting')
    await new Promise((resolve) => setTimeout(resolve, 800))

    setExtractedContext({
      hackathonName: 'Web3 Innovation Summit 2024',
      judgingCriteria: [
        { name: 'Technical Innovation', weight: 30 },
        { name: 'User Experience', weight: 25 },
        { name: 'Market Potential', weight: 25 },
        { name: 'Code Quality', weight: 20 },
      ],
      tracks: ['AI/ML', 'DeFi', 'Infrastructure', 'Social Impact'],
      prizePool: '$50,000',
      themes: ['Sustainability', 'Accessibility', 'Security'],
    })

    setParsingState('idle')
    setCurrentStep(2)
  }

  const handleSubmitProject = async () => {
    if (!projectData.name || !projectData.description) return

    setIsLoading(true)

    // Create submission transaction
    const txId = `tx_${Date.now()}`
    addTransaction({
      id: txId,
      type: 'submission',
      status: 'pending',
      timestamp: Date.now(),
      data: projectData,
    })

    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Move to consensus phase
    setCurrentStep(4)
    setConsensusActive(true)
    setIsLoading(false)
  }

  const handleViewResults = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setEvaluationResults({
      consensusScore: 89,
      agreement: 98,
      timestamp: new Date().toISOString(),
      hash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
      feedback: {
        strengths: [
          'Exceptional technical architecture with scalable design patterns',
          'Outstanding user interface with intuitive navigation',
          'Strong market validation with clear product-market fit',
        ],
        improvements: [
          'Consider additional security audits before mainnet deployment',
          'Expand documentation for developer integration',
        ],
        recommendation: 'ACCEPT - Strong project with significant innovation potential',
      },
    })

    setCurrentStep(5)
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Evaluation Protocol</h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Step Indicator */}
      <div className="border-b border-purple-500/20 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            {EVALUATION_STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <motion.div
                  className={`flex flex-col items-center flex-1 ${
                    step.id <= currentStep ? 'text-cyan-400' : 'text-muted-foreground'
                  }`}
                  animate={step.id === currentStep ? { scale: 1.05 } : { scale: 1 }}
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                      step.id < currentStep
                        ? 'bg-green-500/20 border-green-500'
                        : step.id === currentStep
                          ? 'bg-purple-500/20 border-cyan-400'
                          : 'border-muted'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-center">{step.name}</span>
                </motion.div>
                {idx < EVALUATION_STEPS.length - 1 && (
                  <div
                    className={`h-1 mx-2 flex-1 ${step.id < currentStep ? 'bg-green-500/50' : 'bg-muted-foreground/20'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Hackathon Context */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Hackathon Context</h2>
                <p className="text-muted-foreground">
                  Provide information about the hackathon. This helps AI validators understand the evaluation criteria.
                </p>
              </div>

              <GlowCard className="p-6">
                <label className="block text-sm font-medium text-foreground mb-3">Hackathon Details</label>
                <textarea
                  value={hackathonContext}
                  onChange={(e) => setHackathonContext(e.target.value)}
                  placeholder="Paste hackathon rules, judging criteria, tracks, themes, or any other relevant information..."
                  className="w-full bg-background border border-purple-500/20 rounded-lg p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 min-h-40 resize-none"
                />

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={handleParseHackathon}
                    disabled={!hackathonContext.trim() || parsingState !== 'idle'}
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    {parsingState === 'idle' ? (
                      <>
                        <Zap className="w-4 h-4" />
                        Parse Details
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {parsingState === 'reading'
                          ? 'Reading...'
                          : parsingState === 'analyzing'
                            ? 'Analyzing...'
                            : 'Extracting...'}
                      </>
                    )}
                  </Button>
                </div>
              </GlowCard>

              {/* Extracted Context Display */}
              {extractedContext && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  <GlowCard className="p-6 bg-green-500/10 border-green-500/30">
                    <h3 className="font-bold text-foreground mb-4">Judging Criteria</h3>
                    <div className="space-y-3">
                      {extractedContext.judgingCriteria.map((criterion: any, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{criterion.name}</span>
                          <span className="text-sm font-bold text-cyan-400">{criterion.weight}%</span>
                        </div>
                      ))}
                    </div>
                  </GlowCard>

                  <GlowCard className="p-6 bg-purple-500/10 border-purple-500/30">
                    <h3 className="font-bold text-foreground mb-4">Track Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Tracks</p>
                        <div className="flex flex-wrap gap-2">
                          {extractedContext.tracks.map((track: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300"
                            >
                              {track}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                </motion.div>
              )}

              {extractedContext && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    className="gap-2 bg-cyan-600 hover:bg-cyan-700"
                  >
                    Continue to Project Details
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Project Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Project Details</h2>
                <p className="text-muted-foreground">
                  Tell us about your project. Provide clear descriptions to help validators understand your work.
                </p>
              </div>

              <GlowCard className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Project Name</label>
                  <input
                    type="text"
                    value={projectData.name}
                    onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                    placeholder="e.g. AI-Powered Analytics Platform"
                    className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    value={projectData.description}
                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                    placeholder="Describe your project, its features, and impact..."
                    className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 min-h-32 resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Team Size</label>
                    <input
                      type="text"
                      value={projectData.teamSize}
                      onChange={(e) => setProjectData({ ...projectData, teamSize: e.target.value })}
                      placeholder="e.g. 3-4 developers"
                      className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Technologies</label>
                    <input
                      type="text"
                      value={projectData.technologies}
                      onChange={(e) => setProjectData({ ...projectData, technologies: e.target.value })}
                      placeholder="e.g. React, Python, PostgreSQL"
                      className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>
              </GlowCard>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="gap-2 border-purple-500/30"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!projectData.name || !projectData.description}
                  className="gap-2 bg-cyan-600 hover:bg-cyan-700"
                >
                  Continue to Review
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Submit & Review */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Review & Submit</h2>
                <p className="text-muted-foreground">
                  Review your submission before sending it to GenLayer validators.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <GlowCard className="p-6 bg-purple-500/10 border-purple-500/30">
                  <h3 className="font-bold text-foreground mb-4">Project Summary</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Project Name</p>
                      <p className="text-foreground font-medium">{projectData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Description</p>
                      <p className="text-foreground">{projectData.description}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Team Size</p>
                      <p className="text-foreground">{projectData.teamSize}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Technologies</p>
                      <p className="text-foreground">{projectData.technologies}</p>
                    </div>
                  </div>
                </GlowCard>

                <GlowCard className="p-6 bg-cyan-500/10 border-cyan-500/30">
                  <h3 className="font-bold text-foreground mb-4">Hackathon Context</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Hackathon</p>
                      <p className="text-foreground font-medium">{extractedContext?.hackathonName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Selected Track</p>
                      <p className="text-foreground">{extractedContext?.tracks[0]}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Evaluation Criteria</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {extractedContext?.judgingCriteria.slice(0, 2).map((c: any, i: number) => (
                          <span key={i} className="px-2 py-1 bg-cyan-500/20 rounded text-xs">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="gap-2 border-purple-500/30"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmitProject}
                  disabled={isLoading}
                  className="gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Submit to GenLayer
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Consensus */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-2">AI Validators Evaluating</h2>
                <p className="text-muted-foreground">
                  GenLayer validators are analyzing your project against the hackathon criteria.
                </p>
              </div>

              {consensusActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-12"
                >
                  <ConsensusValidator validators={demoValidators} animated={true} />
                </motion.div>
              )}

              <div className="grid md:grid-cols-4 gap-4 mt-12">
                {demoValidators.map((validator) => (
                  <motion.div
                    key={validator.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * parseInt(validator.id) }}
                    className="glassmorphism p-4 rounded-lg border border-purple-500/20 text-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-400 rounded-full mx-auto mb-3" />
                    <p className="font-bold text-foreground">{validator.name}</p>
                    <p className="text-xs text-muted-foreground mt-2">Score: {validator.score}</p>
                    <p className="text-xs text-cyan-400 mt-1">
                      Confidence: {Math.round(validator.confidence * 100)}%
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleViewResults}
                  disabled={isLoading}
                  className="gap-2 bg-cyan-600 hover:bg-cyan-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      View Results
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Results */}
          {currentStep === 5 && evaluationResults && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Evaluation Complete</h2>
                <p className="text-muted-foreground">
                  Your project has been evaluated by GenLayer validators. Results are finalized onchain.
                </p>
              </div>

              {/* Verification Badge */}
              <EvaluationVerified
                consensusHash={evaluationResults.hash}
                agreementPercentage={evaluationResults.agreement}
                timestamp="Just now"
                confidence={evaluationResults.consensusScore}
                validatorCount={4}
                dissentingValidators={0}
              />

              {/* Score Display */}
              <GlowCard className="p-8 text-center bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/30">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                  {evaluationResults.consensusScore}/100
                </div>
                <p className="text-foreground font-bold mb-2">Consensus Score</p>
                <p className="text-muted-foreground text-sm">{evaluationResults.agreement}% validator agreement</p>
              </GlowCard>

              {/* Feedback Sections */}
              <div className="space-y-4">
                <GlowCard className="p-6 bg-green-500/10 border-green-500/30">
                  <h3 className="font-bold text-foreground mb-4 text-lg">Strengths</h3>
                  <ul className="space-y-3">
                    {evaluationResults.feedback.strengths.map((point: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="text-green-400 font-bold mt-1">✓</span>
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </GlowCard>

                <GlowCard className="p-6 bg-yellow-500/10 border-yellow-500/30">
                  <h3 className="font-bold text-foreground mb-4 text-lg">Areas for Improvement</h3>
                  <ul className="space-y-3">
                    {evaluationResults.feedback.improvements.map((point: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="text-yellow-400 font-bold mt-1">→</span>
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </GlowCard>

                <GlowCard className="p-6 bg-cyan-500/10 border-cyan-500/30">
                  <h3 className="font-bold text-foreground mb-4 text-lg">Recommendation</h3>
                  <p className="text-cyan-300 font-bold">{evaluationResults.feedback.recommendation}</p>
                </GlowCard>
              </div>

              {/* Onchain Details */}
              <GlowCard className="p-6 bg-purple-500/10 border-purple-500/30 space-y-4">
                <h3 className="font-bold text-foreground">Onchain Verification</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Transaction Hash</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-cyan-400 truncate max-w-xs">
                        {evaluationResults.hash.slice(0, 16)}...
                      </code>
                      <button className="text-cyan-400 hover:text-cyan-300">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Network</span>
                    <span className="text-foreground font-medium">GenLayer Testnet</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-green-400 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      Finalized
                    </span>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2 border-cyan-500/30 mt-4">
                  <ExternalLink className="w-4 h-4" />
                  View on GenLayer Explorer
                </Button>
              </GlowCard>

              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline" className="gap-2 border-purple-500/30">
                    Return Home
                  </Button>
                </Link>
                <Button onClick={() => window.location.reload()} className="gap-2 bg-purple-600 hover:bg-purple-700">
                  <Zap className="w-4 h-4" />
                  New Evaluation
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
