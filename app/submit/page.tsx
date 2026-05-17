'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, CheckCircle2, AlertCircle, Loader2, Wallet } from 'lucide-react'
import { GlowCard } from '@/components/glow-card'
import { WalletButton } from '@/components/wallet-button'
import { Button } from '@/components/ui/button'
import { useWalletStore } from '@/lib/store'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const formSteps = [
  { number: 1, title: 'Project Info', fields: ['Project Name', 'Description', 'Team'] },
  { number: 2, title: 'Upload Code', fields: ['Repository URL', 'Source Code'] },
  { number: 3, title: 'Details', fields: ['Technologies', 'Key Features'] },
  { number: 4, title: 'Review', fields: ['Confirm Submission'] },
]

export default function SubmitPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const { isConnected, addTransaction } = useWalletStore()
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    teamSize: '',
    repositoryUrl: '',
    technologies: '',
    features: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    setIsSubmitting(true)

    // Create submission transaction
    const txId = `tx_${Date.now()}`
    addTransaction({
      id: txId,
      type: 'submission',
      status: 'pending',
      timestamp: Date.now(),
      data: formData,
    })

    // Simulate transaction states
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Update to confirming
    const { updateTransaction } = useWalletStore.getState()
    updateTransaction(txId, {
      status: 'confirming',
      hash: `0x${Math.random().toString(16).slice(2)}`,
    })

    // Simulate confirmation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update to confirmed
    updateTransaction(txId, {
      status: 'confirmed',
    })

    setIsSubmitting(false)
    setSubmitSuccess(true)

    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitSuccess(false)
      setCurrentStep(1)
      setFormData({
        projectName: '',
        description: '',
        teamSize: '',
        repositoryUrl: '',
        technologies: '',
        features: '',
      })
    }, 3000)
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
          <h1 className="text-2xl font-bold text-foreground">Submit Your Project</h1>
          <WalletButton />
        </div>
      </motion.div>

      <section className="relative pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Progress Steps */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            {formSteps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <motion.button
                  onClick={() => setCurrentStep(step.number)}
                  className={`relative z-10 w-12 h-12 rounded-full font-semibold transition-all ${
                    currentStep >= step.number
                      ? 'bg-purple-600 text-white'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentStep > step.number ? <CheckCircle2 className="w-6 h-6" /> : step.number}
                </motion.button>

                {index < formSteps.length - 1 && (
                  <motion.div
                    className={`flex-1 h-1 mx-2 rounded-full ${
                      currentStep > step.number ? 'bg-purple-600' : 'bg-secondary/30'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {formSteps.map((step) => (
              <div key={step.number} className="text-sm">
                <p className="font-semibold text-foreground">{step.title}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <GlowCard glowColor="purple" className="mb-8">
            {/* Step 1: Project Info */}
            {currentStep === 1 && (
              <motion.div variants={itemVariants} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Project Information</h2>
                  <p className="text-muted-foreground">Tell us about your hackathon project</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Project Name *</label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      placeholder="Enter your project name"
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your project in detail"
                      rows={4}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Team Size *</label>
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="">Select team size</option>
                      <option value="1">1 person</option>
                      <option value="2-3">2-3 people</option>
                      <option value="4-5">4-5 people</option>
                      <option value="6+">6+ people</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Upload Code */}
            {currentStep === 2 && (
              <motion.div variants={itemVariants} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Upload Your Code</h2>
                  <p className="text-muted-foreground">Provide access to your project repository</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Repository URL *</label>
                    <input
                      type="url"
                      name="repositoryUrl"
                      value={formData.repositoryUrl}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username/project"
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  {/* Drag and Drop Area */}
                  <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <p className="font-semibold text-foreground mb-1">Drag and drop your files</p>
                    <p className="text-sm text-muted-foreground">or click to select files (Max 500MB)</p>
                    <p className="text-xs text-muted-foreground mt-2">Supported: ZIP, TAR, GIT</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Technologies */}
            {currentStep === 3 && (
              <motion.div variants={itemVariants} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Technologies & Features</h2>
                  <p className="text-muted-foreground">What technologies and features does your project use?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Technologies Used *</label>
                    <input
                      type="text"
                      name="technologies"
                      value={formData.technologies}
                      onChange={handleInputChange}
                      placeholder="e.g., React, Node.js, TensorFlow, Solidity"
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Key Features *</label>
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      placeholder="List the main features and functionalities"
                      rows={4}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <motion.div variants={itemVariants} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Review Your Submission</h2>
                  <p className="text-muted-foreground">Make sure everything looks correct before submitting</p>
                </div>

                <div className="space-y-4 bg-secondary/30 border border-purple-500/20 rounded-lg p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Project Name</p>
                      <p className="font-semibold text-foreground">{formData.projectName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Team Size</p>
                      <p className="font-semibold text-foreground">{formData.teamSize || 'Not provided'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-foreground text-sm">{formData.description || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Repository</p>
                    <p className="text-foreground text-sm break-all">{formData.repositoryUrl || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Technologies</p>
                    <p className="text-foreground text-sm">{formData.technologies || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-300">
                    By submitting, you agree that your project will be evaluated by our AI validators. Results will be available in your dashboard within minutes.
                  </p>
                </div>
              </motion.div>
            )}
          </GlowCard>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex gap-4 justify-between">
            <Button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="px-8"
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNextStep}
                className="px-8 bg-purple-600 hover:bg-purple-700"
              >
                Next Step
              </Button>
            ) : (
              <>
                {submitSuccess ? (
                  <Button disabled className="px-8 gap-2 bg-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Submitted Successfully
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isConnected}
                    className="px-8 gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!isConnected ? (
                      <>
                        <Wallet className="w-4 h-4" />
                        Connect Wallet First
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Submit Project
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
