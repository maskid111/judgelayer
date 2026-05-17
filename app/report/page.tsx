'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Download, Share2, ArrowLeft } from 'lucide-react'
import { GlowCard } from '@/components/glow-card'
import { EvaluationVerified } from '@/components/evaluation-verified'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface FeedbackItem {
  validator: string
  score: number
  category: string
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
}

const feedbackData: FeedbackItem[] = [
  {
    validator: 'CodeAnalyzer-Pro',
    score: 92,
    category: 'Technical Excellence',
    strengths: [
      'Clean, well-structured code with excellent separation of concerns',
      'Comprehensive error handling and edge case management',
      'Efficient algorithms and optimal time complexity',
      'Well-documented functions with clear purpose',
    ],
    improvements: [
      'Consider adding more unit tests for edge cases',
      'Implement logging for better debugging',
    ],
    detailedFeedback:
      'Your code demonstrates professional-grade quality with strong architectural decisions. The use of design patterns shows maturity in software engineering. Performance is excellent across all tested scenarios.',
  },
  {
    validator: 'CreativeEval-V2',
    score: 85,
    category: 'Innovation & Creativity',
    strengths: [
      'Novel approach to solving the problem',
      'Creative use of emerging technologies',
      'Unique UI/UX implementation',
      'Innovative data visualization techniques',
    ],
    improvements: [
      'Explore more radical innovation possibilities',
      'Consider experimental features for differentiation',
    ],
    detailedFeedback:
      'The project shows strong creative thinking with a fresh perspective on the problem space. While the innovation is solid, there&apos;s potential to push boundaries further with more experimental approaches.',
  },
  {
    validator: 'SecurityAudit-AI',
    score: 88,
    category: 'Security & Robustness',
    strengths: [
      'Proper input validation throughout',
      'Secure authentication mechanisms',
      'No critical vulnerabilities detected',
      'Good use of cryptographic practices',
    ],
    improvements: [
      'Implement rate limiting on API endpoints',
      'Add CSRF protection mechanisms',
    ],
    detailedFeedback:
      'Security posture is strong with no critical issues found. The implementation follows best practices for data protection. Some additional hardening measures would further strengthen the system against edge-case attacks.',
  },
]

const summaryInsights = [
  'Your project excels in code quality and technical execution',
  'Strong focus on security shows professional consideration',
  'Creative innovations set your project apart from competitors',
  'Consensus across validators indicates well-rounded implementation',
]

export default function ReportPage() {
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null)

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Evaluation Report</h1>
          <div className="w-10" />
        </div>
      </motion.div>

      <section className="relative pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Report Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-foreground mb-2">Neural Budget Optimizer</h2>
          <p className="text-muted-foreground mb-6">Comprehensive AI-Powered Evaluation Report</p>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share Report
            </Button>
          </div>
        </motion.div>

        {/* Executive Summary */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlowCard animated glowColor="purple">
            <h3 className="text-2xl font-bold text-foreground mb-4">Executive Summary</h3>
            <div className="space-y-3">
              {summaryInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-purple-400 font-bold text-lg flex-shrink-0">✓</span>
                  <p className="text-foreground">{insight}</p>
                </motion.div>
              ))}
            </div>
          </GlowCard>
        </motion.div>

        {/* Overall Metrics */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <GlowCard glowColor="purple">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  88.3
                </div>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
            </GlowCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlowCard glowColor="cyan">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">3</div>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </GlowCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlowCard glowColor="blue">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">92%</div>
                <p className="text-sm text-muted-foreground">Agreement Rate</p>
              </div>
            </GlowCard>
          </motion.div>
        </motion.div>

        {/* Onchain Verification */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <EvaluationVerified
            consensusHash="0xc9f26e4b91a87218f8e61c61d8c02f1234a5b6c7d8e9f0a1b2c3d4e5f6a7b8c"
            agreementPercentage={92}
            timestamp="2 minutes ago"
            confidence={94}
            validatorCount={4}
            dissentingValidators={0}
          />
        </motion.div>

        {/* Detailed Feedback */}
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-2xl font-bold text-foreground mb-6">Detailed Validator Feedback</h3>

          {feedbackData.map((feedback, index) => (
            <motion.div key={index} variants={itemVariants}>
              <GlowCard
                glowColor={index === 0 ? 'purple' : index === 1 ? 'cyan' : 'blue'}
                className="cursor-pointer"
                onClick={() =>
                  setExpandedFeedback(expandedFeedback === feedback.validator ? null : feedback.validator)
                }
                interactive
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-lg">{feedback.validator}</h4>
                      <p className="text-sm text-muted-foreground">{feedback.category}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="text-3xl font-bold text-accent">{feedback.score}</div>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedFeedback === feedback.validator ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-purple-400" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: expandedFeedback === feedback.validator ? 1 : 0,
                      height: expandedFeedback === feedback.validator ? 'auto' : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-4 border-t border-purple-500/20">
                      {/* Strengths */}
                      <div>
                        <h5 className="font-semibold text-green-400 mb-2">Strengths</h5>
                        <ul className="space-y-1">
                          {feedback.strengths.map((strength, i) => (
                            <li key={i} className="text-sm text-foreground flex items-start gap-2">
                              <span className="text-green-400 flex-shrink-0">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div>
                        <h5 className="font-semibold text-yellow-400 mb-2">Areas for Improvement</h5>
                        <ul className="space-y-1">
                          {feedback.improvements.map((improvement, i) => (
                            <li key={i} className="text-sm text-foreground flex items-start gap-2">
                              <span className="text-yellow-400 flex-shrink-0">•</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Detailed Feedback */}
                      <div>
                        <h5 className="font-semibold text-purple-400 mb-2">Detailed Analysis</h5>
                        <p className="text-sm text-foreground leading-relaxed">{feedback.detailedFeedback}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Collapsed Preview */}
                  {expandedFeedback !== feedback.validator && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2 border-t border-purple-500/20">
                      <p className="text-sm text-muted-foreground line-clamp-1">{feedback.detailedFeedback}</p>
                    </motion.div>
                  )}
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Recommendations */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <GlowCard glowColor="cyan">
            <h3 className="text-xl font-bold text-foreground mb-4">Recommendations for Next Steps</h3>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="font-bold text-cyan-400 flex-shrink-0">1.</span>
                <span className="text-foreground">Address the security improvement suggestions to further harden your application against potential attacks.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-cyan-400 flex-shrink-0">2.</span>
                <span className="text-foreground">Expand test coverage to ensure robustness across all edge cases and user scenarios.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-cyan-400 flex-shrink-0">3.</span>
                <span className="text-foreground">Consider implementing additional creative features to further differentiate your project in the market.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-cyan-400 flex-shrink-0">4.</span>
                <span className="text-foreground">Prepare a scalability roadmap to demonstrate how your solution can grow with demand.</span>
              </li>
            </ol>
          </GlowCard>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          className="mt-12 flex gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link href="/dashboard">
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/submit">
            <Button variant="outline">
              Submit Another Project
            </Button>
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
