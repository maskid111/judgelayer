import { createClient } from 'genlayer-js';
import { localnet, studionet, testnetAsimov, testnetBradbury } from 'genlayer-js/chains';
import {
  ExecutionResult,
  TransactionStatus,
  type CalldataEncodable,
  type TransactionHash,
} from 'genlayer-js/types';
import { isAddress, type Address } from 'viem';

export type GenLayerNetwork = 'localnet' | 'studionet' | 'testnetAsimov' | 'testnetBradbury';

export type GenLayerClientConfig = NonNullable<Parameters<typeof createClient>[0]>;
type GenLayerStudioClient = ReturnType<typeof createClient>;

export interface GenLayerStudioConfig {
  network?: GenLayerNetwork;
  endpoint?: string;
  contractAddress?: Address;
  account?: GenLayerClientConfig['account'];
  provider?: GenLayerClientConfig['provider'];
}

export interface GenLayerWalletChainConfig {
  chainId: `0x${string}`;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

export interface IntelligentContractCall<TResult = CalldataEncodable> {
  address?: Address;
  functionName: string;
  args?: CalldataEncodable[];
  kwargs?: Record<string, CalldataEncodable> | Map<string, CalldataEncodable>;
  rawReturn?: boolean;
  jsonSafeReturn?: boolean;
  transactionHashVariant?: Parameters<GenLayerStudioClient['readContract']>[0]['transactionHashVariant'];
  transform?: (result: CalldataEncodable | `0x${string}`) => TResult;
}

export interface IntelligentContractWrite {
  address?: Address;
  functionName: string;
  args?: CalldataEncodable[];
  kwargs?: Record<string, CalldataEncodable> | Map<string, CalldataEncodable>;
  value?: bigint;
  leaderOnly?: boolean;
  consensusMaxRotations?: number;
  account?: Parameters<GenLayerStudioClient['writeContract']>[0]['account'];
}

export interface WaitForIntelligentContractTransaction {
  hash: TransactionHash;
  status?: TransactionStatus;
  interval?: number;
  retries?: number;
  requireSuccessfulExecution?: boolean;
  allowIntermediateResult?: boolean;
}

export type GenLayerSafeReceiptResult = {
  receipt: Record<string, unknown>;
  usedRawFallback: boolean;
  reachedTargetStatus: boolean;
  timedOut: boolean;
  lastStatus?: string;
  parserError?: string;
};

export type GenLayerDebugTraceResult =
  | {
      available: true;
      trace: Awaited<ReturnType<GenLayerStudioClient['debugTraceTransaction']>>;
      error?: undefined;
      disabled?: false;
    }
  | {
      available: false;
      trace: null;
      error?: string;
      disabled?: boolean;
    };

const GENLAYER_CHAINS = {
  localnet,
  studionet,
  testnetAsimov,
  testnetBradbury,
} as const;

export const DEFAULT_GENLAYER_NETWORK: GenLayerNetwork = 'studionet';

export function getConfiguredGenLayerNetwork(): GenLayerNetwork {
  const configured = process.env.NEXT_PUBLIC_GENLAYER_NETWORK;

  if (isGenLayerNetwork(configured)) {
    return configured;
  }

  return DEFAULT_GENLAYER_NETWORK;
}

export function getConfiguredIntelligentContractAddress(): Address | undefined {
  const address = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS;

  if (!address) {
    return undefined;
  }

  return toGenLayerAddress(address, 'NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS');
}

export function getGenLayerChain(network: GenLayerNetwork = getConfiguredGenLayerNetwork()) {
  return GENLAYER_CHAINS[network];
}

export function getGenLayerWalletChainConfig(network: GenLayerNetwork = getConfiguredGenLayerNetwork()): GenLayerWalletChainConfig {
  const chain = getGenLayerChain(network);
  const configuredRpcUrl = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL;
  const configuredChainName = process.env.NEXT_PUBLIC_GENLAYER_CHAIN_NAME;
  const configuredExplorerUrl = process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL;
  const explorerUrl = configuredExplorerUrl ?? chain.blockExplorers?.default?.url;

  return {
    chainId: `0x${chain.id.toString(16)}`,
    chainName: configuredChainName ?? chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: configuredRpcUrl ? [configuredRpcUrl] : [...chain.rpcUrls.default.http],
    blockExplorerUrls: explorerUrl ? [explorerUrl] : undefined,
  };
}

export function createGenLayerStudioClient(config: GenLayerStudioConfig = {}) {
  const network = config.network ?? getConfiguredGenLayerNetwork();
  const contractAddress = config.contractAddress ?? getConfiguredIntelligentContractAddress();
  const client = createClient({
    chain: getGenLayerChain(network),
    endpoint: config.endpoint ?? process.env.NEXT_PUBLIC_GENLAYER_RPC_URL,
    account: config.account,
    provider: config.provider,
  });

  const resolveContractAddress = (address?: Address) => {
    const resolvedAddress = address ?? contractAddress;

    if (!resolvedAddress) {
      throw new Error('GenLayer contract address is required. Pass address or set NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS.');
    }

    return resolvedAddress;
  };

  return {
    client,
    network,
    contractAddress,

    connect: () => client.connect(network),

    getSchema: (address?: Address) => client.getContractSchema(resolveContractAddress(address)),

    getCode: (address?: Address) => client.getContractCode(resolveContractAddress(address)),

    read: async <TResult = CalldataEncodable>(call: IntelligentContractCall<TResult>) => {
      const result = await client.readContract({
        address: resolveContractAddress(call.address),
        functionName: call.functionName,
        args: call.args ?? [],
        kwargs: call.kwargs,
        rawReturn: call.rawReturn,
        jsonSafeReturn: call.jsonSafeReturn,
        transactionHashVariant: call.transactionHashVariant,
      });

      return call.transform ? call.transform(result) : (result as TResult);
    },

    simulate: async <TResult = CalldataEncodable>(call: IntelligentContractCall<TResult>) => {
      const result = await client.simulateWriteContract({
        address: resolveContractAddress(call.address),
        functionName: call.functionName,
        args: call.args ?? [],
        kwargs: call.kwargs,
        rawReturn: call.rawReturn,
        transactionHashVariant: call.transactionHashVariant,
      });

      return call.transform ? call.transform(result) : (result as TResult);
    },

    write: (call: IntelligentContractWrite) =>
      client.writeContract({
        account: call.account,
        address: resolveContractAddress(call.address),
        functionName: call.functionName,
        args: call.args ?? [],
        kwargs: call.kwargs,
        value: call.value ?? BigInt(0),
        leaderOnly: call.leaderOnly,
        consensusMaxRotations: call.consensusMaxRotations,
      }) as Promise<TransactionHash>,

    waitForTransaction: async ({
      hash,
      status = TransactionStatus.FINALIZED,
      interval,
      retries,
      requireSuccessfulExecution = true,
    }: WaitForIntelligentContractTransaction) => {
      const receipt = await client.waitForTransactionReceipt({
        hash,
        status,
        interval,
        retries,
      });

      if (requireSuccessfulExecution && receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
        throw new Error(`GenLayer transaction ${hash} finalized with a contract execution error.`);
      }

      return receipt;
    },

    safeWaitForTransaction: async ({
      hash,
      status = TransactionStatus.FINALIZED,
      interval,
      retries,
      requireSuccessfulExecution = true,
      allowIntermediateResult = false,
    }: WaitForIntelligentContractTransaction): Promise<GenLayerSafeReceiptResult> => {
      try {
        const receipt = await client.waitForTransactionReceipt({
          hash,
          status,
          interval: interval ?? getDefaultWaitInterval(status),
          retries: retries ?? getDefaultWaitRetries(status),
        });

        if (requireSuccessfulExecution && receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
          throw new Error(`GenLayer transaction ${hash} finalized with a contract execution error.`);
        }

        return {
          receipt: receipt as Record<string, unknown>,
          usedRawFallback: false,
          reachedTargetStatus: true,
          timedOut: false,
          lastStatus: getRawStatusLabel(receipt),
        };
      } catch (error) {
        const parserError = getGenLayerErrorMessage(error);
        const timedOut = looksLikeWaitTimeout(parserError);

        if (!looksLikeStudioParsingIssue(parserError) && !timedOut) {
          throw error;
        }

        const receipt = await waitForRawStudioTransaction({
          request: client.request,
          hash,
          status,
          interval: interval ?? getDefaultWaitInterval(status),
          retries: timedOut ? 0 : retries ?? getDefaultWaitRetries(status),
          allowIntermediateResult: allowIntermediateResult || (timedOut && status !== TransactionStatus.FINALIZED),
        });

        return {
          receipt: receipt.receipt,
          usedRawFallback: true,
          reachedTargetStatus: receipt.reachedTargetStatus,
          timedOut: receipt.timedOut,
          lastStatus: receipt.lastStatus,
          parserError,
        };
      }
    },

    getTransaction: (hash: TransactionHash) => client.getTransaction({ hash }),

    getTriggeredTransactionIds: (hash: TransactionHash) => client.getTriggeredTransactionIds({ hash }),

    debugTraceTransaction: (hash: TransactionHash, round?: number) => client.debugTraceTransaction({ hash, round }),

    safeDebugTraceTransaction: async (hash: TransactionHash, round?: number): Promise<GenLayerDebugTraceResult> => {
      if (!isDebugTraceEnabled()) {
        return {
          available: false,
          trace: null,
          disabled: true,
        };
      }

      try {
        return {
          available: true,
          trace: await client.debugTraceTransaction({ hash, round }),
          disabled: false,
        };
      } catch (error) {
        return {
          available: false,
          trace: null,
          error: getGenLayerErrorMessage(error),
        };
      }
    },
  };
}

export function toGenLayerAddress(address: string, label = 'address'): Address {
  if (!isAddress(address)) {
    throw new Error(`Invalid GenLayer ${label}: ${address}`);
  }

  return address;
}

function isGenLayerNetwork(network: string | undefined): network is GenLayerNetwork {
  return typeof network === 'string' && network in GENLAYER_CHAINS;
}

function isDebugTraceEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_GENLAYER_DEBUG_TRACE === 'true';
}

function getGenLayerErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;

  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return 'Debug trace unavailable.';
    }
  }

  return 'Debug trace unavailable.';
}

function looksLikeStudioParsingIssue(message: string) {
  const normalized = message.toLowerCase();

  return normalized.includes('type') || normalized.includes('decode') || normalized.includes('undefined');
}

function looksLikeWaitTimeout(message: string) {
  return message.toLowerCase().includes('timed out waiting for transaction');
}

async function waitForRawStudioTransaction({
  request,
  hash,
  status,
  interval = 3000,
  retries = 120,
  allowIntermediateResult = false,
}: {
  request: GenLayerStudioClient['request'];
  hash: TransactionHash;
  status: TransactionStatus;
  interval?: number;
  retries?: number;
  allowIntermediateResult?: boolean;
}) {
  let remaining = retries;
  let latest: Record<string, unknown> | null = null;
  let latestStatus: string | undefined;

  while (remaining >= 0) {
    const raw = await request({
      method: 'eth_getTransactionByHash',
      params: [hash],
    } as never) as Record<string, unknown> | null;

    console.info('[JudgeLayer] Raw GenLayer Studio transaction response before parsing:', raw);

    if (!raw) {
      throw new Error(`Transaction not found: ${hash}`);
    }

    latest = raw;
    latestStatus = getRawStatusLabel(raw);

    if (hasReachedStatus(raw, status)) {
      return {
        receipt: raw,
        reachedTargetStatus: true,
        timedOut: false,
        lastStatus: latestStatus,
      };
    }

    if (remaining === 0) {
      if (allowIntermediateResult && latest) {
        return {
          receipt: latest,
          reachedTargetStatus: false,
          timedOut: true,
          lastStatus: latestStatus,
        };
      }

      throw new Error(`Timed out waiting for transaction ${hash} to reach status "${status}" (current status: ${latestStatus ?? 'unknown'}).`);
    }

    remaining -= 1;
    await sleep(interval);
  }

  throw new Error(`Timed out waiting for transaction ${hash} to reach status "${status}".`);
}

function hasReachedStatus(raw: Record<string, unknown>, requestedStatus: TransactionStatus) {
  const normalized = normalizeRawStatus(raw);

  if (normalized === requestedStatus) return true;

  if (requestedStatus === TransactionStatus.ACCEPTED) {
    return hasFinalizedExecutionPayload(raw) || ['ACCEPTED', 'FINALIZED', 'UNDETERMINED', 'CANCELED', 'VALIDATORS_TIMEOUT', 'LEADER_TIMEOUT'].includes(normalized);
  }

  if (requestedStatus === TransactionStatus.FINALIZED && hasFinalizedExecutionPayload(raw)) {
    return true;
  }

  return false;
}

function normalizeRawStatus(raw: Record<string, unknown>) {
  const rawStatus = raw.statusName ?? raw.status;

  if (typeof rawStatus === 'number') return statusNumberToName(rawStatus);
  if (typeof rawStatus === 'bigint') return statusNumberToName(Number(rawStatus));

  const normalized = String(rawStatus ?? '').toUpperCase();
  const numeric = Number(normalized);

  if (Number.isFinite(numeric)) return statusNumberToName(numeric);

  if (normalized === 'ACTIVATED') return TransactionStatus.PENDING;

  return normalized;
}

function statusNumberToName(status: number) {
  const statuses: Record<number, TransactionStatus> = {
    0: TransactionStatus.UNINITIALIZED,
    1: TransactionStatus.PENDING,
    2: TransactionStatus.PROPOSING,
    3: TransactionStatus.COMMITTING,
    4: TransactionStatus.REVEALING,
    5: TransactionStatus.ACCEPTED,
    6: TransactionStatus.UNDETERMINED,
    7: TransactionStatus.FINALIZED,
    8: TransactionStatus.CANCELED,
    9: TransactionStatus.APPEAL_REVEALING,
    10: TransactionStatus.APPEAL_COMMITTING,
    11: TransactionStatus.READY_TO_FINALIZE,
    12: TransactionStatus.VALIDATORS_TIMEOUT,
    13: TransactionStatus.LEADER_TIMEOUT,
  };

  return statuses[status] ?? String(status);
}

function hasFinalizedExecutionPayload(raw: Record<string, unknown>) {
  return [
    raw.txExecutionResultName,
    raw.txExecutionResult,
    raw.txReceipt,
    getNested(raw, ['consensus_data', 'leader_receipt']),
    getNested(raw, ['data', 'result']),
    getNested(raw, ['data', 'return_value']),
    getNested(raw, ['data', 'returnValue']),
  ].some((value) => value !== undefined && value !== null && value !== '');
}

function getRawStatusLabel(raw: unknown) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  return normalizeRawStatus(raw as Record<string, unknown>);
}

function getNested(value: unknown, path: string[]) {
  let current = value;

  for (const key of path) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function getDefaultWaitInterval(status: TransactionStatus) {
  return status === TransactionStatus.FINALIZED ? 5000 : 4000;
}

function getDefaultWaitRetries(status: TransactionStatus) {
  return status === TransactionStatus.FINALIZED ? 360 : 90;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
