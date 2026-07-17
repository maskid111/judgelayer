# JudgeLayer

JudgeLayer is a GenLayer-powered hackathon evaluation app. It lets a builder submit hackathon context plus project artifacts, sends the submission to a deployed GenLayer Intelligent Contract, and renders the finalized evaluation returned by GenLayer consensus.

Live app: [https://judgelayer.vercel.app/](https://judgelayer.vercel.app/)

## What It Does

- Collects hackathon context, either as pasted text or a hackathon link.
- Collects project name, description, GitHub URL, and demo URL.
- Connects an EVM wallet and guides the user onto the GenLayer Studio Network.
- Calls the deployed Intelligent Contract method:

```ts
evaluate_submission(
  hackathon_context,
  project_name,
  project_description,
  github_url,
  demo_url
)
```

- Tracks the transaction lifecycle through wallet signing, validator execution, consensus, and finalization.
- Parses and displays the contract result:
  - `innovation_score`
  - `technical_depth`
  - `ui_ux`
  - `hackathon_fit`
  - `finalist_probability`
  - `verification`
- Preserves wallet connection across navigation and refresh until the user disconnects.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- `genlayer-js`
- Vercel

## GenLayer Integration

The reusable GenLayer client utility lives in:

```txt
lib/genlayer.ts
```

The evaluation flow and response parsing live in:

```txt
app/evaluate/page.tsx
```

The app uses GenLayer Studio by default and supports defensive transaction waiting for longer-running Intelligent Contract executions.

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_GENLAYER_NETWORK=studionet
NEXT_PUBLIC_GENLAYER_RPC_URL=
NEXT_PUBLIC_GENLAYER_CHAIN_NAME=
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=
NEXT_PUBLIC_ENABLE_GENLAYER_DEBUG_TRACE=false
```

Only `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS` is required if the default Studio network config is sufficient.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Build

```bash
npm run build
```

## Notes

- The contract address is configured through environment variables.
- The frontend does not mock evaluation results.
- Detailed validator debug traces are optional and disabled unless `NEXT_PUBLIC_ENABLE_GENLAYER_DEBUG_TRACE=true`.
- Contract execution, payload parsing, and final result rendering are handled client-side through the GenLayer Studio RPC flow.
