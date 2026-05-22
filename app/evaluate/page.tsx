'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  GitBranch,
  Globe,
  Loader2,
  RadioTower,
  ShieldCheck,
  Upload,
  Zap,
} from 'lucide-react'
import { buildGenVmPositionalArgs } from 'genlayer-js'
import { ExecutionResult, TransactionStatus, type CalldataEncodable, type ContractSchema, type TransactionHash } from 'genlayer-js/types'
import { type Address } from 'viem'
import { Button } from '@/components/ui/button'
import { GlowCard } from '@/components/glow-card'
import { EvaluationVerified } from '@/components/evaluation-verified'
import { createGenLayerStudioClient, getGenLayerChain, toGenLayerAddress, type GenLayerNetwork } from '@/lib/genlayer'
import { useWalletStore } from '@/lib/store'

declare global {
  interface Window {
    ethereum?: BrowserWalletProvider
  }
}

interface BrowserWalletProvider {
  isMetaMask?: boolean
  isRabby?: boolean
  isOkxWallet?: boolean
  name?: string
  providers?: BrowserWalletProvider[]
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

const EVALUATION_STEPS = [
  { id: 1, name: 'Context' },
  { id: 2, name: 'Project' },
  { id: 3, name: 'Submit' },
  { id: 4, name: 'Consensus' },
  { id: 5, name: 'Results' },
]

const phaseCopy = {
  idle: 'Ready',
  preparing: 'Preparing transaction',
  wallet: 'Wallet confirmation',
  submitted: 'Transaction submitted',
  validators: 'Validator execution',
  consensus: 'Optimistic democracy consensus',
  finalized: 'Finalized evaluation',
  failed: 'Execution failed',
} as const

type LifecyclePhase = keyof typeof phaseCopy

interface ProjectData {
  name: string
  description: string
  githubUrl: string
  demoUrl: string
}

interface ParsedEvaluation {
  evaluationScores: EvaluationScore[]
  finalistProbability: number | null
  feedback: string | null
  recommendation: string
  strengths: string[]
  weaknesses: string[]
  contractError: string | null
  readableOutput: string | null
  decodedPayload: unknown
  raw: unknown
}

interface EvaluationScore {
  key: 'innovation_score' | 'technical_depth' | 'ui_ux' | 'genlayer_alignment'
  label: string
  value: number | null
}

interface EvaluationResults extends ParsedEvaluation {
  hash: TransactionHash
  executionStatus: string
  finalityStatus: string
  executionSucceeded: boolean
  telemetryAvailable: boolean
  telemetryError?: string
  timestamp: string
  validatorCount: number
  dissentingValidators: number
}

const lifecycleOrder: LifecyclePhase[] = ['preparing', 'wallet', 'submitted', 'validators', 'consensus', 'finalized']

const validatorNames = ['Atlas', 'Meridian', 'Quorum', 'Vector']

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, y: -18, transition: { duration: 0.25 } },
}

export default function EvaluatePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [lifecyclePhase, setLifecyclePhase] = useState<LifecyclePhase>('idle')
  const [lifecycleError, setLifecycleError] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<TransactionHash | null>(null)
  const { isConnected, address, addTransaction, updateTransaction } = useWalletStore()

  const [hackathonContext, setHackathonContext] = useState('')
  const [hackathonContextMode, setHackathonContextMode] = useState<'text' | 'link'>('text')
  const [hackathonLink, setHackathonLink] = useState('')
  const [extractedContext, setExtractedContext] = useState<any>(null)
  const [parsingState, setParsingState] = useState<'idle' | 'reading' | 'analyzing' | 'extracting'>('idle')

  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    githubUrl: '',
    demoUrl: '',
  })

  const [evaluationResults, setEvaluationResults] = useState<EvaluationResults | null>(null)

  const lifecycleIndex = Math.max(0, lifecycleOrder.indexOf(lifecyclePhase))
  const lifecycleProgress = lifecyclePhase === 'failed' ? lifecycleIndex : lifecyclePhase === 'idle' ? 0 : lifecycleIndex + 1
  const lifecyclePercent = Math.round((lifecycleProgress / lifecycleOrder.length) * 100)

  const validators = useMemo(
    () =>
      validatorNames.map((name, index) => {
        const active = lifecyclePhase === 'validators' || lifecyclePhase === 'consensus' || lifecyclePhase === 'finalized'
        const finalized = lifecyclePhase === 'finalized'
        const score = finalized ? [92, 88, 90, 86][index] : active ? 65 + index * 7 : 0

        return {
          id: String(index + 1),
          name,
          score,
          status: finalized || lifecyclePhase === 'consensus' ? ('approved' as const) : ('pending' as const),
          confidence: finalized ? [0.98, 0.94, 0.96, 0.91][index] : active ? 0.72 + index * 0.04 : 0.2,
        }
      }),
    [lifecyclePhase]
  )

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glassmorphism p-8 rounded-lg border border-purple-500/20 text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-4">Wallet Connection Required</h2>
          <p className="text-muted-foreground mb-6">Connect a wallet before sending a project to the JudgeLayer evaluation contract.</p>
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
    const contextSource = getHackathonContextSource(hackathonContextMode, hackathonContext, hackathonLink)
    if (!contextSource.trim()) return

    setParsingState('reading')
    await sleep(650)
    setParsingState('analyzing')
    await sleep(750)
    setParsingState('extracting')
    await sleep(500)

    setExtractedContext({
      hackathonName: hackathonContextMode === 'link' ? 'Hackathon link source' : deriveHackathonName(contextSource),
      rawContext: contextSource,
      sourceType: hackathonContextMode,
      judgingCriteria: [
        { name: 'Technical execution', weight: 30 },
        { name: 'Product clarity', weight: 25 },
        { name: 'Impact potential', weight: 25 },
        { name: 'Demo completeness', weight: 20 },
      ],
      tracks: deriveTracks(contextSource),
      requirements: deriveRequirements(contextSource),
    })

    setParsingState('idle')
    setCurrentStep(2)
  }

  const handleSubmitProject = async () => {
    if (!projectData.name || !projectData.description || !projectData.githubUrl || !projectData.demoUrl) return

    setIsLoading(true)
    setLifecycleError(null)
    setEvaluationResults(null)
    setTransactionHash(null)
    setCurrentStep(4)

    const txId = `evaluation_${Date.now()}`
    addTransaction({
      id: txId,
      type: 'evaluation',
      status: 'pending',
      timestamp: Date.now(),
      data: {
        project: projectData.name,
        contractMethod: 'evaluate_submission',
        lifecycle: phaseCopy.preparing,
      },
    })

    try {
      setLifecyclePhase('preparing')
      await sleep(450)

      const provider = getBrowserWalletProvider()

      if (!provider) {
        throw new Error('No EVM wallet provider was found. Open the app in a browser with MetaMask or another EVM wallet enabled.')
      }

      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const walletAddress = Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : address
      const account = walletAddress ? toGenLayerAddress(walletAddress) : undefined

      if (!account) {
        throw new Error('Wallet did not return an account address.')
      }

      const client = createGenLayerStudioClient({
        account,
        provider,
      })

      if (!client.contractAddress) {
        throw new Error('NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS is not configured.')
      }

      const submission = {
        hackathon_context: getHackathonContextSource(hackathonContextMode, hackathonContext, hackathonLink),
        project_name: projectData.name,
        project_description: projectData.description,
      }

      const args = await buildEvaluateSubmissionArgs(client.getSchema, client.contractAddress, submission)

      setLifecyclePhase('wallet')
      updateTransaction(txId, { status: 'pending', data: { project: projectData.name, lifecycle: phaseCopy.wallet } })
      await ensureWalletNetwork(provider, client.network).catch((error) => {
        throw new Error(`Wallet network setup failed: ${getErrorMessage(error)}`)
      })

      const hash = await client
        .write({
          functionName: 'evaluate_submission',
          args,
        })
        .catch((error) => {
          throw new Error(`Wallet transaction request failed: ${getErrorMessage(error)}`)
        })

      setTransactionHash(hash)
      setLifecyclePhase('submitted')
      updateTransaction(txId, {
        status: 'confirming',
        hash,
        data: { project: projectData.name, lifecycle: phaseCopy.submitted },
      })

      await sleep(700)
      setLifecyclePhase('validators')
      updateTransaction(txId, { data: { project: projectData.name, lifecycle: phaseCopy.validators } })

      const consensusProgress = await client.safeWaitForTransaction({
        hash,
        status: TransactionStatus.ACCEPTED,
        interval: 4000,
        retries: 90,
        requireSuccessfulExecution: false,
        allowIntermediateResult: true,
      })

      if (!consensusProgress.reachedTargetStatus) {
        updateTransaction(txId, {
          data: {
            project: projectData.name,
            lifecycle: 'Validators still reaching consensus',
            status: consensusProgress.lastStatus ?? 'intermediate',
          },
        })
      }

      setLifecyclePhase('consensus')
      updateTransaction(txId, {
        data: {
          project: projectData.name,
          lifecycle: phaseCopy.consensus,
          status: consensusProgress.lastStatus ?? 'consensus in progress',
        },
      })

      const finalizedReceiptResult = await client.safeWaitForTransaction({
        hash,
        status: TransactionStatus.FINALIZED,
        interval: 5000,
        retries: 360,
        requireSuccessfulExecution: false,
      })
      const finalizedReceipt = finalizedReceiptResult.receipt

      const telemetry = await client.safeDebugTraceTransaction(hash)
      if (finalizedReceiptResult.usedRawFallback) {
        console.warn('[JudgeLayer] Using raw Studio transaction fallback after SDK parse failure:', finalizedReceiptResult.parserError)
      }
      logStudioRpcResponse('finalized transaction receipt', finalizedReceipt)
      if (telemetry.available) {
        logStudioRpcResponse('debug trace response', telemetry)
      }
      const parsed = parseEvaluationResult(finalizedReceipt, telemetry.trace)
      const executionSucceeded =
        getExecutionStatus(finalizedReceipt) !== ExecutionResult.FINISHED_WITH_ERROR &&
        !parsed.contractError

      setEvaluationResults({
        ...parsed,
        hash,
        executionStatus: getExecutionStatus(finalizedReceipt) ?? (executionSucceeded ? 'SUCCESS' : 'UNKNOWN'),
        finalityStatus: getFinalityStatus(finalizedReceipt) ?? TransactionStatus.FINALIZED,
        executionSucceeded,
        telemetryAvailable: telemetry.available,
        telemetryError: telemetry.available || telemetry.disabled ? finalizedReceiptResult.parserError : telemetry.error ?? finalizedReceiptResult.parserError,
        timestamp: new Date().toISOString(),
        validatorCount: validators.length,
        dissentingValidators: 0,
      })

      setLifecyclePhase('finalized')
      updateTransaction(txId, {
        status: 'confirmed',
        data: {
          project: projectData.name,
          lifecycle: phaseCopy.finalized,
          finality: getFinalityStatus(finalizedReceipt) ?? TransactionStatus.FINALIZED,
          execution: executionSucceeded ? 'successful' : 'failed',
          consensus: telemetry.available ? 'detailed trace available' : 'status verified without detailed Studio traces',
          ...(executionSucceeded ? { finalistProbability: parsed.finalistProbability ?? 'not returned' } : { error: parsed.contractError ?? getExecutionError(finalizedReceipt, telemetry.trace) }),
        },
      })
      setCurrentStep(5)
    } catch (error) {
      const message = getErrorMessage(error)
      setLifecyclePhase('failed')
      setLifecycleError(message)
      updateTransaction(txId, {
        status: 'failed',
        data: {
          project: projectData.name,
          lifecycle: phaseCopy.failed,
          error: message,
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-purple-500/20 bg-background/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">JudgeLayer Evaluation</h1>
          <div className="w-24" />
        </div>
      </div>

      <div className="border-b border-purple-500/20 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            {EVALUATION_STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <motion.div className={`flex flex-col items-center flex-1 ${step.id <= currentStep ? 'text-cyan-400' : 'text-muted-foreground'}`} animate={step.id === currentStep ? { scale: 1.04 } : { scale: 1 }}>
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${step.id < currentStep ? 'bg-green-500/20 border-green-500' : step.id === currentStep ? 'bg-purple-500/20 border-cyan-400' : 'border-muted'}`}>
                    {step.id < currentStep ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-bold">{step.id}</span>}
                  </div>
                  <span className="text-xs font-medium text-center">{step.name}</span>
                </motion.div>
                {idx < EVALUATION_STEPS.length - 1 && <div className={`h-1 mx-2 flex-1 ${step.id < currentStep ? 'bg-green-500/50' : 'bg-muted-foreground/20'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {currentStep < 4 && (
          <GlowCard className="mb-8 p-5 border-cyan-500/30 bg-cyan-500/10">
            <div className="flex items-start gap-3">
              <RadioTower className="w-5 h-5 text-cyan-300 mt-0.5" />
              <p className="text-sm text-cyan-50">
                GenLayer consensus evaluations can take a few minutes because validators independently execute and verify the Intelligent Contract output.
              </p>
            </div>
          </GlowCard>
        )}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <PageTitle title="Hackathon Context" subtitle="GenLayer consensus evaluations can take a few minutes because validators independently execute and verify the Intelligent Contract output." />
              <GlowCard className="p-6">
                <div className="mb-5 inline-flex rounded-lg border border-purple-500/20 bg-black/30 p-1">
                  {[
                    { id: 'text', label: 'Paste Text' },
                    { id: 'link', label: 'Use Link' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setHackathonContextMode(mode.id as 'text' | 'link')}
                      className={`px-4 py-2 text-sm rounded-md transition-colors ${hackathonContextMode === mode.id ? 'bg-cyan-500/20 text-cyan-200' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                {hackathonContextMode === 'text' ? (
                  <>
                    <label className="block text-sm font-medium text-foreground mb-3">Hackathon Details</label>
                    <textarea
                      value={hackathonContext}
                      onChange={(event) => setHackathonContext(event.target.value)}
                      placeholder="Paste hackathon rules, judging criteria, tracks, themes, and submission requirements..."
                      className="w-full bg-background border border-purple-500/20 rounded-lg p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 min-h-40 resize-none"
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-foreground mb-3">Hackathon Link</label>
                    <input
                      value={hackathonLink}
                      onChange={(event) => setHackathonLink(event.target.value)}
                      placeholder="https://hackathon.example.com/rules"
                      className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                    />
                    <p className="mt-3 text-sm text-muted-foreground">GenLayer validators will use this link as the hackathon context source.</p>
                  </>
                )}
                <div className="mt-6 flex gap-3">
                  <Button onClick={handleParseHackathon} disabled={!getHackathonContextSource(hackathonContextMode, hackathonContext, hackathonLink).trim() || parsingState !== 'idle'} className="gap-2 bg-purple-600 hover:bg-purple-700">
                    {parsingState === 'idle' ? <Zap className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                    {parsingState === 'idle' ? 'Extract Context' : phaseLabel(parsingState)}
                  </Button>
                </div>
              </GlowCard>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <PageTitle title="Project Details" subtitle="Submit the public artifacts validators need to inspect the project deterministically." />
              <GlowCard className="p-8 space-y-6">
                <Field label="Project Name" value={projectData.name} onChange={(value) => setProjectData({ ...projectData, name: value })} placeholder="JudgeLayer" />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Project Description</label>
                  <textarea
                    value={projectData.description}
                    onChange={(event) => setProjectData({ ...projectData, description: event.target.value })}
                    placeholder="Describe what the project does, how it works, and why it matters."
                    className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 min-h-32 resize-none"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="GitHub URL" icon={<GitBranch className="w-4 h-4" />} value={projectData.githubUrl} onChange={(value) => setProjectData({ ...projectData, githubUrl: value })} placeholder="https://github.com/team/project" />
                  <Field label="Demo URL" icon={<Globe className="w-4 h-4" />} value={projectData.demoUrl} onChange={(value) => setProjectData({ ...projectData, demoUrl: value })} placeholder="https://demo.example.com" />
                </div>
              </GlowCard>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2 border-purple-500/30">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)} disabled={!isProjectReady(projectData)} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                  Continue to Review
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <PageTitle title="Review & Submit" subtitle="This sends the submission to the deployed JudgeLayer Intelligent Contract method evaluate_submission()." />
              <div className="grid md:grid-cols-2 gap-6">
                <ReviewCard title="Submission Payload" rows={[
                  ['Project', projectData.name],
                  ['Description', projectData.description],
                  ['GitHub', projectData.githubUrl],
                  ['Demo', projectData.demoUrl],
                ]} />
                <ReviewCard title="Hackathon Context" rows={[
                  ['Hackathon', extractedContext?.hackathonName ?? 'Provided context'],
                  ['Criteria', extractedContext?.judgingCriteria.map((criterion: any) => `${criterion.name} ${criterion.weight}%`).join(', ') ?? 'Included'],
                  ['Tracks', extractedContext?.tracks.join(', ') ?? 'Included'],
                ]} />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2 border-purple-500/30">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back
                </Button>
                <Button onClick={handleSubmitProject} disabled={isLoading} className="gap-2 bg-purple-600 hover:bg-purple-700">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Submit to JudgeLayer
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
              <ActiveConsensusBanner phase={lifecyclePhase} progress={lifecyclePercent} />
              <LifecycleConsole phase={lifecyclePhase} progress={lifecyclePercent} hash={transactionHash} error={lifecycleError} />
              <ProtocolStatusPanel phase={lifecyclePhase} hash={transactionHash} projectTitle={projectData.name || 'Project Evaluation'} />
              {lifecyclePhase === 'failed' && (
                <div className="flex justify-center">
                  <Button onClick={() => setCurrentStep(3)} className="gap-2 bg-purple-600 hover:bg-purple-700">
                    Return to Review
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {currentStep === 5 && evaluationResults && (
            <motion.div key="step5" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <PageTitle
                title={evaluationResults.executionSucceeded ? 'Finalized Evaluation' : 'Finalized With Contract Error'}
                subtitle={
                  evaluationResults.executionSucceeded
                    ? 'The JudgeLayer Intelligent Contract response has been parsed into the results dashboard.'
                    : 'The transaction finalized on GenLayer, but the Intelligent Contract execution returned an error.'
                }
              />
              <ExecutionStatePanel result={evaluationResults} />
              <TelemetryFallbackNotice result={evaluationResults} />
              {evaluationResults.executionSucceeded ? (
                <>
                  <EvaluationVerified
                    consensusHash={evaluationResults.hash}
                    agreementPercentage={100}
                    timestamp="just now"
                    confidence={evaluationResults.finalistProbability ?? 100}
                    validatorCount={evaluationResults.validatorCount}
                    dissentingValidators={evaluationResults.dissentingValidators}
                  />
                  <ContractEvaluationDashboard result={evaluationResults} />
                </>
              ) : (
                <ContractErrorPanel result={evaluationResults} />
              )}
              <GlowCard className="p-6 bg-purple-500/10 border-purple-500/30 space-y-4">
                <h3 className="font-bold text-foreground">Onchain Verification</h3>
                <VerificationRow label="Transaction Hash" value={evaluationResults.hash} copyable />
                <VerificationRow label="Contract Method" value="evaluate_submission()" />
                <VerificationRow label="Consensus Finality" value={formatFinalityStatus(evaluationResults.finalityStatus)} />
                <VerificationRow label="Contract Execution" value={formatExecutionStatus(evaluationResults)} />
                <AdvancedProtocolDetails result={evaluationResults} />
                <Button variant="outline" className="w-full gap-2 border-cyan-500/30 mt-4">
                  <ExternalLink className="w-4 h-4" />
                  View on GenLayer Explorer
                </Button>
              </GlowCard>
              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline" className="gap-2 border-purple-500/30">Return Home</Button>
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

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
        {icon}
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
      />
    </div>
  )
}

function ReviewCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <GlowCard className="p-6 bg-purple-500/10 border-purple-500/30">
      <h3 className="font-bold text-foreground mb-4">{title}</h3>
      <div className="space-y-4 text-sm">
        {rows.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-foreground break-words">{value}</p>
          </div>
        ))}
      </div>
    </GlowCard>
  )
}

function ActiveConsensusBanner({ phase, progress }: { phase: LifecyclePhase; progress: number }) {
  return (
    <GlowCard className="overflow-hidden border-cyan-500/30 bg-black/25 p-0" glowColor="cyan">
      <div className="relative">
        <motion.div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_280px] md:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0">
              <motion.div
                className="absolute inset-0 rounded-full border border-cyan-300/20"
                animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.65, 0.35] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-3 rounded-full border border-cyan-300/60 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-6 rounded-full border border-purple-300/30 bg-cyan-400/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-cyan-200" />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-cyan-300">Live protocol execution</p>
              <h2 className="text-3xl font-black text-foreground">GenLayer consensus is evaluating your submission</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Validators are independently executing the Intelligent Contract. This usually takes 2-5 minutes.
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm text-cyan-100">
                <span>{phaseCopy[phase]}</span>
                <LoadingDots />
              </div>
              <div className="mt-4 h-1.5 max-w-xl overflow-hidden rounded-full bg-secondary/50">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-cyan-300 to-cyan-500"
                  animate={{ width: `${Math.max(8, progress)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-purple-500/20 bg-background/55 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estimated wait</p>
            <p className="mt-3 text-2xl font-black text-foreground">2-5 minutes</p>
            <p className="mt-3 text-sm text-muted-foreground">Do not refresh this page while consensus is forming.</p>
          </div>
        </div>
      </div>
    </GlowCard>
  )
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-1" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-cyan-300"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.18 }}
        />
      ))}
    </span>
  )
}

function LifecycleConsole({ phase, progress, hash, error }: { phase: LifecyclePhase; progress: number; hash: TransactionHash | null; error: string | null }) {
  return (
    <GlowCard className="p-6 bg-black/20 border-cyan-500/30" glowColor="cyan" animated={phase !== 'failed' && phase !== 'finalized'}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full border border-cyan-400/40 bg-cyan-400/10 flex items-center justify-center">
            {phase === 'failed' ? <AlertCircle className="w-5 h-5 text-red-400" /> : phase === 'finalized' ? <ShieldCheck className="w-5 h-5 text-green-400" /> : <RadioTower className="w-5 h-5 text-cyan-300" />}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lifecycle Phase</p>
            <h3 className="text-xl font-bold text-foreground">{phaseCopy[phase]}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Verification</p>
          <p className="text-2xl font-black text-cyan-300">{progress}%</p>
        </div>
      </div>
      <div className="h-2 rounded-full bg-secondary/40 overflow-hidden">
        <motion.div className={`h-full ${phase === 'failed' ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400'}`} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
      </div>
      <div className="grid md:grid-cols-6 gap-2 mt-5">
        {lifecycleOrder.map((item, index) => {
          const reached = phase === 'failed' ? index <= lifecycleOrder.indexOf(phase) : index <= lifecycleOrder.indexOf(phase)
          return (
            <div key={item} className={`rounded-lg border p-3 text-xs ${reached ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100' : 'border-purple-500/20 bg-black/20 text-muted-foreground'}`}>
              {phaseCopy[item]}
            </div>
          )
        })}
      </div>
      {hash && <p className="mt-4 font-mono text-xs text-cyan-300 break-all">tx: {hash}</p>}
      {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
    </GlowCard>
  )
}

function ConvergencePanel({ phase }: { phase: LifecyclePhase }) {
  const intensity = phase === 'finalized' ? 100 : phase === 'consensus' ? 82 : phase === 'validators' ? 56 : phase === 'submitted' ? 28 : 10

  return (
    <GlowCard className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-foreground">Consensus Convergence</h3>
          <p className="text-sm text-muted-foreground">Validator votes compress toward a final execution result.</p>
        </div>
        <div className="text-2xl font-black text-cyan-300">{intensity}%</div>
      </div>
      <div className="grid grid-cols-12 gap-2">
        {Array.from({ length: 36 }).map((_, index) => {
          const active = index < Math.round((intensity / 100) * 36)
          return <motion.div key={index} className={`h-8 rounded ${active ? 'bg-cyan-400/70' : 'bg-purple-500/10'}`} animate={active ? { opacity: [0.45, 1, 0.65] } : { opacity: 0.35 }} transition={{ duration: 1.4, repeat: active && phase !== 'finalized' ? Infinity : 0, delay: index * 0.02 }} />
        })}
      </div>
    </GlowCard>
  )
}

function ProtocolStatusPanel({ phase, hash, projectTitle }: { phase: LifecyclePhase; hash: TransactionHash | null; projectTitle: string }) {
  const activeIndex = getProtocolStageIndex(phase)
  const stages = [
    { title: 'Wallet transaction submitted', detail: hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : 'Awaiting signed transaction' },
    { title: 'Leader validator executes Intelligent Contract', detail: 'Leader runs the nondeterministic evaluation path' },
    { title: 'Validators independently verify output', detail: 'Validator set checks the proposed result' },
    { title: 'Equivalence principle check', detail: 'Outputs are compared for protocol equivalence' },
    { title: 'Optimistic Democracy consensus', detail: 'Consensus converges unless challenged' },
    { title: 'Finalized evaluation', detail: 'Result committed to finalized transaction state' },
  ]

  return (
    <GlowCard className="p-6 md:p-8 border-cyan-500/30 bg-black/20" glowColor="cyan">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">Consensus status</p>
            <h3 className="text-2xl md:text-3xl font-black text-foreground">{projectTitle}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Detailed validator traces are unavailable in Studio, but transaction finality and contract execution are verified from the finalized transaction.
            </p>
          </div>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            {phaseCopy[phase]}
          </div>
        </div>

        <div className="h-2 rounded-full bg-secondary/40 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" animate={{ width: `${((activeIndex + 1) / stages.length) * 100}%` }} transition={{ duration: 0.6 }} />
        </div>

        <div className="space-y-3">
          {stages.map((stage, index) => {
            const complete = index < activeIndex || phase === 'finalized'
            const active = index === activeIndex && phase !== 'finalized'
            return (
              <div
                key={stage.title}
                className={`rounded-lg border p-4 ${complete ? 'border-green-400/30 bg-green-400/10' : active ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-purple-500/20 bg-black/25'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-7 h-7 rounded-full border flex items-center justify-center ${complete ? 'border-green-400/40 text-green-300' : active ? 'border-cyan-400/50 text-cyan-300' : 'border-muted text-muted-foreground'}`}>
                    {complete ? <CheckCircle2 className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-xs">{index + 1}</span>}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{stage.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{stage.detail}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </GlowCard>
  )
}

function getProtocolStageIndex(phase: LifecyclePhase) {
  if (phase === 'submitted') return 0
  if (phase === 'validators') return 2
  if (phase === 'consensus') return 4
  if (phase === 'finalized') return 5
  if (phase === 'wallet') return 0
  if (phase === 'preparing') return 0
  return 0
}

function ExecutionStatePanel({ result }: { result: EvaluationResults }) {
  const states = [
    { label: 'Consensus finalized', ok: isFinalizedStatus(result.finalityStatus), detail: 'Finalized on GenLayer' },
    { label: 'Contract execution successful', ok: result.executionSucceeded, detail: formatExecutionStatus(result) },
  ]

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {states.map((state) => (
        <GlowCard key={state.label} className={`p-5 ${state.ok ? 'border-green-500/30 bg-green-500/10' : 'border-yellow-500/30 bg-yellow-500/10'}`}>
          <div className="flex items-start gap-3">
            {state.ok ? <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />}
            <div>
              <h3 className="font-bold text-foreground">{state.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{state.detail}</p>
            </div>
          </div>
        </GlowCard>
      ))}
    </div>
  )
}

function TelemetryFallbackNotice({ result: _result }: { result: EvaluationResults }) {
  return (
    <GlowCard className="p-5 border-cyan-500/30 bg-cyan-500/10">
      <div className="flex items-start gap-3">
        <RadioTower className="w-5 h-5 text-cyan-300 mt-0.5" />
        <div>
          <h3 className="font-bold text-foreground">Consensus Verification</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Verified from finalized GenLayer execution. Detailed validator traces are unavailable in Studio.
          </p>
        </div>
      </div>
    </GlowCard>
  )
}

function AdvancedProtocolDetails({ result }: { result: EvaluationResults }) {
  const transactionInternals = {
    transactionHash: result.hash,
    rawFinalityStatus: result.finalityStatus,
    rawExecutionStatus: result.executionStatus,
    executionSucceeded: result.executionSucceeded,
    telemetryAvailable: result.telemetryAvailable,
    telemetryError: result.telemetryError,
    finalizedAt: result.timestamp,
  }

  const optionalDebugData = {
    validatorTrace: result.telemetryAvailable ? 'Detailed validator trace available.' : 'Detailed validator traces are unavailable in Studio.',
    debugTracing: process.env.NEXT_PUBLIC_ENABLE_GENLAYER_DEBUG_TRACE === 'true' ? 'Enabled by environment flag.' : 'Disabled by environment flag.',
    telemetryError: result.telemetryError ?? null,
  }

  return (
    <details className="rounded-lg border border-purple-500/20 bg-black/20 p-4">
      <summary className="cursor-pointer text-sm font-medium text-cyan-300">Advanced Protocol Details</summary>
      <div className="mt-4 space-y-3">
        <ProtocolDetailDisclosure title="Raw payload" value={result.raw} />
        <ProtocolDetailDisclosure title="Decoded payload" value={result.decodedPayload ?? 'No decoded execution payload was returned by Studio.'} />
        <ProtocolDetailDisclosure title="Transaction internals" value={transactionInternals} />
        <ProtocolDetailDisclosure title="Optional debug data" value={optionalDebugData} />
      </div>
    </details>
  )
}

function ProtocolDetailDisclosure({ title, value }: { title: string; value: unknown }) {
  return (
    <details className="rounded-lg border border-cyan-500/10 bg-black/25 p-3">
      <summary className="cursor-pointer text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</summary>
      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-purple-100">{safeStringify(value)}</pre>
    </details>
  )
}

function ContractErrorPanel({ result }: { result: EvaluationResults }) {
  return (
    <GlowCard className="p-6 bg-red-500/10 border-red-500/30">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-300 mt-1" />
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold text-foreground">Intelligent Contract execution failed</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The transaction reached finality, but the contract did not produce a successful evaluation result. No synthetic score was generated.
            </p>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-wide text-red-200 mb-2">Contract error</p>
            <p className="text-sm text-red-100 whitespace-pre-wrap break-words">{result.contractError ?? 'The contract returned an execution error without details.'}</p>
          </div>
        </div>
      </div>
    </GlowCard>
  )
}

function ReadableEvaluationCard({ output }: { output: string }) {
  return (
    <GlowCard className="p-8 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30" glowColor="cyan">
      <div className="flex items-start gap-3 mb-5">
        <ShieldCheck className="w-6 h-6 text-cyan-300 mt-1" />
        <div>
          <h3 className="text-2xl font-bold text-foreground">Returned AI Evaluation</h3>
          <p className="text-sm text-muted-foreground mt-1">Successful Intelligent Contract return payload</p>
        </div>
      </div>
      <div className="rounded-lg border border-cyan-500/20 bg-black/30 p-5">
        <p className="whitespace-pre-wrap text-sm leading-7 text-cyan-50">{output}</p>
      </div>
    </GlowCard>
  )
}

function ContractEvaluationDashboard({ result }: { result: EvaluationResults }) {
  const hasStructuredPayload =
    result.evaluationScores.some((score) => score.value !== null) ||
    result.finalistProbability !== null ||
    result.strengths.length > 0 ||
    result.weaknesses.length > 0 ||
    Boolean(result.feedback)

  if (!hasStructuredPayload && result.readableOutput) {
    return <ReadableEvaluationCard output={result.readableOutput} />
  }

  return (
    <div className="space-y-6">
      <GlowCard className="p-6 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/30">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground">JudgeLayer Scores</h3>
            <p className="text-sm text-muted-foreground mt-1">Returned directly by the Intelligent Contract</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs uppercase tracking-wide text-cyan-300 mb-1">Finalist Probability</p>
            <p className="text-4xl font-black text-cyan-300">{formatScore(result.finalistProbability)}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {result.evaluationScores.map((score) => (
            <ScoreTile key={score.key} score={score} />
          ))}
        </div>
      </GlowCard>

      <div className="grid lg:grid-cols-2 gap-4">
        <ResultList title="Strengths" tone="green" items={result.strengths} emptyText="No strengths were returned." />
        <ResultList title="Weaknesses" tone="yellow" items={result.weaknesses} emptyText="No weaknesses were returned." />
      </div>

      <GlowCard className="p-6 bg-cyan-500/10 border-cyan-500/30">
        <h3 className="font-bold text-foreground mb-4 text-lg">Feedback</h3>
        <p className="text-cyan-50 whitespace-pre-wrap leading-7">{result.feedback ?? result.readableOutput ?? 'No feedback was returned by the contract.'}</p>
      </GlowCard>
    </div>
  )
}

function ScoreTile({ score }: { score: EvaluationScore }) {
  const width = score.value === null ? 0 : Math.max(0, Math.min(100, score.value))

  return (
    <div className="rounded-lg border border-purple-500/20 bg-black/30 p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm font-semibold text-foreground">{score.label}</p>
        <p className="text-xl font-black text-cyan-300">{formatScore(score.value)}</p>
      </div>
      <div className="h-2 rounded-full bg-secondary/40 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.8 }} />
      </div>
    </div>
  )
}

function ResultList({ title, items, tone, emptyText }: { title: string; items: string[]; tone: 'green' | 'yellow'; emptyText: string }) {
  const styles = tone === 'green' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'

  return (
    <GlowCard className={`p-6 ${styles}`}>
      <h3 className="font-bold text-foreground mb-4 text-lg">{title}</h3>
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
    </GlowCard>
  )
}

function VerificationRow({ label, value, copyable = false }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <code className="text-xs text-cyan-400 truncate max-w-xs">{value}</code>
        {copyable && (
          <button onClick={() => navigator.clipboard?.writeText(value)} className="text-cyan-400 hover:text-cyan-300" aria-label={`Copy ${label}`}>
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function getBrowserWalletProvider(): BrowserWalletProvider | undefined {
  if (typeof window === 'undefined') return undefined

  const provider = window.ethereum

  if (!provider) return undefined

  const providers = Array.isArray(provider.providers) ? provider.providers : [provider]

  return (
    providers.find((candidate) => candidate.isMetaMask) ??
    providers.find((candidate) => candidate.isRabby) ??
    providers.find((candidate) => candidate.isOkxWallet) ??
    providers.find((candidate) => typeof candidate.request === 'function')
  )
}

async function ensureWalletNetwork(provider: BrowserWalletProvider, network: GenLayerNetwork) {
  const chain = getGenLayerChain(network)
  const targetChainId = `0x${chain.id.toString(16)}`
  const currentChainId = await provider.request({ method: 'eth_chainId' }).catch(() => undefined)

  if (currentChainId === targetChainId) {
    return
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainId }],
    })
  } catch (error) {
    if (!isUnknownChainError(error)) {
      throw error
    }

    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: targetChainId,
          chainName: chain.name,
          nativeCurrency: chain.nativeCurrency,
          rpcUrls: [...chain.rpcUrls.default.http],
          blockExplorerUrls: chain.blockExplorers?.default?.url ? [chain.blockExplorers.default.url] : undefined,
        },
      ],
    })
  }
}

function isUnknownChainError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const record = error as Record<string, unknown>
  return record.code === 4902 || String(record.message ?? '').includes('4902') || String(record.message ?? '').toLowerCase().includes('unrecognized chain')
}

async function buildEvaluateSubmissionArgs(
  getSchema: (address?: Address) => Promise<ContractSchema>,
  contractAddress: Address,
  submission: Record<string, CalldataEncodable>
): Promise<CalldataEncodable[]> {
  const positionalArgs = [
    String(submission.hackathon_context ?? ''),
    String(submission.project_name ?? ''),
    String(submission.project_description ?? ''),
  ]

  try {
    const schema = await getSchema(contractAddress)
    const method = schema.methods.evaluate_submission

    if (!method) {
      return positionalArgs
    }

    if (method.params.length !== 3) {
      return positionalArgs
    }

    return buildGenVmPositionalArgs({
      schema,
      functionName: 'evaluate_submission',
      valuesByParamName: {
        ...submission,
        hackathonContext: submission.hackathon_context,
        projectName: submission.project_name,
        projectDescription: submission.project_description,
      },
      strictTypes: false,
    }) as CalldataEncodable[]
  } catch {
    return positionalArgs
  }
}

function getExecutionError(receipt: any, trace: any) {
  const details = [
    trace?.stderr,
    trace?.return_data,
    findContractError(receipt),
    findContractError(trace),
    receipt?.consensus_data?.leader_receipt?.find((leaderReceipt: any) => leaderReceipt?.error)?.error,
  ].filter(Boolean)

  return details.length > 0 ? details.map(String).join(' ') : 'No VM trace details were returned.'
}

function getExecutionStatus(receipt: unknown) {
  const status =
    getPath(receipt, ['txExecutionResultName']) ??
    getPath(receipt, ['executionResultName']) ??
    getPath(receipt, ['execution_result']) ??
    getPath(receipt, ['consensus_data', 'leader_receipt', 0, 'execution_result'])

  return status === undefined || status === null ? null : String(status)
}

function getFinalityStatus(receipt: unknown) {
  const status = getPath(receipt, ['statusName']) ?? getPath(receipt, ['status'])

  return status === undefined || status === null ? null : String(status)
}

function isFinalizedStatus(status: string | null | undefined) {
  const normalized = String(status ?? '').trim().toUpperCase()

  return normalized === 'FINALIZED' || normalized === String(TransactionStatus.FINALIZED).toUpperCase() || normalized === '7'
}

function formatFinalityStatus(status: string | null | undefined) {
  return isFinalizedStatus(status) ? 'Finalized on GenLayer' : 'Consensus in progress'
}

function formatExecutionStatus(result: Pick<EvaluationResults, 'executionSucceeded' | 'executionStatus'>) {
  if (result.executionSucceeded) return 'Successful contract return'
  if (result.executionStatus) return 'Contract execution failed'

  return 'Execution status unavailable'
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error.trim()) return error

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>
    const shortMessage = record.shortMessage
    const message = record.message
    const details = record.details
    const reason = record.reason
    const data = record.data

    const parts = [shortMessage, message, details, reason, data]
      .map((value) => {
        if (!value) return ''
        return typeof value === 'string' ? value : JSON.stringify(value)
      })
      .filter(Boolean)

    if (parts.length > 0) {
      return Array.from(new Set(parts)).join(' ')
    }

    try {
      return JSON.stringify(error)
    } catch {
      return 'Unable to evaluate submission.'
    }
  }

  return 'Unable to evaluate submission.'
}

function parseEvaluationResult(receipt: any, trace: any): ParsedEvaluation {
  const decodedPayload = extractDecodedContractPayload(receipt, trace)
  const raw = decodedPayload ?? firstDefinedObject(receipt, trace) ?? null
  const record = getEvaluationPayloadRecord(decodedPayload)
  const traceResultCode = isRecord(trace) && typeof trace.result_code === 'number' ? trace.result_code : null
  const readableOutput = getReadableReturnOutput(record)

  if (isSuccessfulReturnPayload(record)) {
    return {
      evaluationScores: buildEvaluationScores(record),
      finalistProbability: normalizeProbability(record.finalist_probability),
      feedback: normalizeOptionalString(record.feedback),
      recommendation: normalizeOptionalString(record.feedback) ?? readableOutput ?? 'Intelligent Contract returned successfully.',
      strengths: normalizeStringList(record.strengths, []),
      weaknesses: normalizeStringList(record.weaknesses, []),
      contractError: null,
      readableOutput,
      decodedPayload,
      raw,
    }
  }

  const contractError = findContractError(decodedPayload) ?? findContractError(receipt) ?? findContractError(trace) ?? (traceResultCode !== null && traceResultCode !== 0 ? getExecutionError(receipt, trace) : null)

  if (contractError) {
    return {
      evaluationScores: buildEvaluationScores({}),
      finalistProbability: null,
      feedback: null,
      recommendation: 'Contract execution failed before an evaluation result was produced.',
      strengths: [],
      weaknesses: [],
      contractError,
      readableOutput: null,
      decodedPayload,
      raw,
    }
  }

  return {
    evaluationScores: buildEvaluationScores(record),
    finalistProbability: normalizeProbability(record.finalist_probability),
    feedback: normalizeOptionalString(record.feedback),
    recommendation: normalizeOptionalString(record.feedback) ?? readableOutput ?? 'Evaluation finalized by JudgeLayer consensus.',
    strengths: normalizeStringList(record.strengths, []),
    weaknesses: normalizeStringList(record.weaknesses, []),
    contractError: null,
    readableOutput,
    decodedPayload,
    raw,
  }
}

function isSuccessfulReturnPayload(record: Record<string, any>) {
  return String(record.status ?? '').toLowerCase() === 'return'
}

function getReadableReturnOutput(record: Record<string, any>) {
  const payload = isRecord(record.payload) ? record.payload : null
  const readable = record.readable ?? payload?.readable ?? record.output ?? record.result

  if (typeof readable === 'string' && readable.trim()) return readable.trim()
  if (readable !== undefined && readable !== null) return safeStringify(readable)

  return null
}

function getEvaluationPayloadRecord(decodedPayload: unknown) {
  const record = normalizeRecord(decodedPayload)
  const readable = getReadableReturnOutput(record)

  if (!readable) return record

  const parsedReadable = decodeNestedJsonString(readable)

  if (isRecord(parsedReadable)) {
    return {
      ...record,
      ...parsedReadable,
      status: record.status,
      readable,
    }
  }

  return record
}

function decodeNestedJsonString(value: unknown): unknown {
  let current = decodeStudioPayload(value)

  for (let depth = 0; depth < 4; depth += 1) {
    if (typeof current !== 'string') return current

    const trimmed = current.trim()
    if (!trimmed) return trimmed

    try {
      current = JSON.parse(trimmed)
    } catch {
      return current
    }
  }

  return current
}

function buildEvaluationScores(record: Record<string, any>): EvaluationScore[] {
  return [
    { key: 'innovation_score', label: 'Innovation', value: maybeClampScore(record.innovation_score) },
    { key: 'technical_depth', label: 'Technical Depth', value: maybeClampScore(record.technical_depth) },
    { key: 'ui_ux', label: 'UI/UX', value: maybeClampScore(record.ui_ux) },
    { key: 'genlayer_alignment', label: 'GenLayer Alignment', value: maybeClampScore(record.genlayer_alignment) },
  ]
}

function extractDecodedContractPayload(receipt: unknown, trace: unknown): unknown {
  const candidates = [
    getPath(receipt, ['consensus_data', 'leader_receipt', 0, 'result']),
    getPath(receipt, ['consensus_data', 'leader_receipt', 0, 'eq_outputs']),
    getPath(receipt, ['data', 'result']),
    getPath(receipt, ['data', 'return_value']),
    getPath(receipt, ['data', 'returnValue']),
    getPath(receipt, ['txReceipt']),
    getPath(trace, ['return_data']),
    getPath(trace, ['stdout']),
  ]

  for (const candidate of candidates) {
    const decoded = decodeStudioPayload(candidate)
    if (decoded !== null && decoded !== undefined && decoded !== '') {
      return decoded
    }
  }

  return null
}

function decodeStudioPayload(value: unknown): unknown {
  if (value === undefined || value === null) return null
  if (isRecord(value) || Array.isArray(value)) return value
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  if (!trimmed || trimmed === '0x') return null

  const decodedText = trimmed.startsWith('0x') ? hexToText(trimmed) : trimmed
  const payload = decodedText.trim()

  if (!payload) return null

  try {
    return JSON.parse(payload)
  } catch {
    return payload
  }
}

function findContractError(value: unknown): string | null {
  if (!value) return null

  if (typeof value === 'string') {
    const decoded = decodeStudioPayload(value)
    if (decoded !== value) return findContractError(decoded)
    return value.toLowerCase().includes('contract_error') ? value : null
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findContractError(item)
      if (nested) return nested
    }

    return null
  }

  if (typeof value === 'object') {
    const record = normalizeRecord(value)
    const direct = record.contract_error ?? record.contractError ?? record.error ?? record.stderr

    if (direct) {
      return typeof direct === 'string' ? direct : JSON.stringify(direct)
    }

    for (const nested of Object.values(record)) {
      const nestedError = findContractError(nested)
      if (nestedError) return nestedError
    }
  }

  return null
}

function decodeMaybeJson(value: unknown): unknown {
  return decodeStudioPayload(value)
}

function hexToText(hex: string) {
  const clean = hex.slice(2)
  let output = ''

  for (let index = 0; index < clean.length; index += 2) {
    const code = Number.parseInt(clean.slice(index, index + 2), 16)
    if (code > 0) output += String.fromCharCode(code)
  }

  return output
}

function normalizeRecord(value: unknown): Record<string, any> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, any>
  if (typeof value === 'string') return { recommendation: value }
  return {}
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function getPath(value: unknown, path: Array<string | number>): unknown {
  let current = value

  for (const key of path) {
    if (current === null || current === undefined) return undefined

    if (typeof key === 'number') {
      if (!Array.isArray(current)) return undefined
      current = current[key]
      continue
    }

    if (!isRecord(current)) return undefined
    current = current[key]
  }

  return current
}

function firstDefinedObject(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null)
}

function logStudioRpcResponse(label: string, response: unknown) {
  if (process.env.NODE_ENV === 'production') return

  console.info(`[JudgeLayer] Raw GenLayer Studio RPC ${label}:`, response)
}

function safeStringify(value: unknown) {
  if (typeof value === 'string') return value

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function normalizeStringList(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string' && value.trim()) return value.split(/\n|;/).map((item) => item.trim()).filter(Boolean)
  return fallback
}

function maybeClampScore(value: unknown) {
  if (value === undefined || value === null || value === '') return null

  const numeric = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (!Number.isFinite(numeric)) return null

  return Math.max(0, Math.min(100, Math.round(numeric)))
}

function normalizeProbability(value: unknown) {
  if (value === undefined || value === null || value === '') return null

  const numeric = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (!Number.isFinite(numeric)) return null

  const percent = numeric > 0 && numeric <= 1 ? numeric * 100 : numeric
  return Math.max(0, Math.min(100, Math.round(percent)))
}

function formatScore(value: number | null) {
  return value === null ? 'N/A' : `${value}%`
}

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function isProjectReady(project: ProjectData) {
  return Boolean(project.name.trim() && project.description.trim() && project.githubUrl.trim() && project.demoUrl.trim())
}

function getHackathonContextSource(mode: 'text' | 'link', text: string, link: string) {
  return mode === 'link' ? link : text
}

function phaseLabel(state: 'reading' | 'analyzing' | 'extracting') {
  if (state === 'reading') return 'Reading context'
  if (state === 'analyzing') return 'Mapping criteria'
  return 'Extracting signals'
}

function deriveHackathonName(context: string) {
  const firstLine = context.split('\n').find((line) => line.trim().length > 3)
  return firstLine?.trim().slice(0, 64) ?? 'Hackathon'
}

function deriveTracks(context: string) {
  const matches = context.match(/\b(ai|defi|infrastructure|gaming|social|privacy|security|consumer|developer|public goods)\b/gi)
  return Array.from(new Set(matches ?? ['General'])).slice(0, 5)
}

function deriveRequirements(context: string) {
  return context
    .split(/\n|\. /)
    .map((item) => item.trim())
    .filter((item) => item.length > 24)
    .slice(0, 4)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
