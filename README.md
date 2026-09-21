# DARLEK CAAN: Autonomous Architectural Synthesizer & Verification Engine

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-red.svg)](LICENSE)
[![Purpose](https://img.shields.io/badge/Purpose-Non--Profit%20%7C%20Academic%20%7C%20Research-blue.svg)](LICENSE)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js%2022%20%7C%20Next.js%20App%20Router%20%7C%20Express-green.svg)](#technology-stack)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://www.typescriptlang.org/)

An autonomous code refactoring, AST verification engine, and cognitive synthesizer designed for empirical resilience, multi-agent consensus validation, and verifiable software evolution.

> **NON-PROFIT DECLARATION**  
> This project is published under an open **Non-Profit, Non-Commercial License** ([CC BY-NC-SA 4.0](LICENSE)). It is dedicated exclusively to academic research, open scientific inquiry, and educational exploration of autonomous code synthesizer architectures. Commercial exploitation, sale, or paid proprietary SaaS provisioning is strictly prohibited without explicit written consent from the author.

---

## Table of Contents

- [1. Overview & Vision](#1-overview--vision)
- [2. Architectural Pipeline](#2-architectural-pipeline)
- [3. Key Subsystems](#3-key-subsystems)
  - [3.1 Debate Chamber & Consensus Gate](#31-debate-chamber--consensus-gate)
  - [3.2 Deterministic AST Diff Gate & Structural Sanity Guard](#32-deterministic-ast-diff-gate--structural-sanity-guard)
  - [3.3 Historical Commit Archaeology](#33-historical-commit-archaeology)
  - [3.4 Cryptographic Helpers & Security](#34-cryptographic-helpers--security)
  - [3.5 Multi-Tier Generative AI Integration](#35-multi-tier-generative-ai-integration)
- [4. Project Structure](#4-project-structure)
- [5. Getting Started](#5-getting-started)
  - [5.1 Prerequisites](#51-prerequisites)
  - [5.2 Installation](#52-installation)
  - [5.3 Environment Configuration](#53-environment-configuration)
  - [5.4 Running the Application](#54-running-the-application)
- [6. API Endpoints](#6-api-endpoints)
- [7. Non-Profit License & Citation](#7-non-profit-license--citation)

---

## 1. Overview & Vision

Stochastic Large Language Models (LLMs) often suffer from structural drift: hallucinating absent imports, truncating function bodies to satisfy token constraints, deleting failing functions ("function scrubbing"), or introducing security regressions.

**DARLEK CAAN** counters these failure modes through an automated, deterministic verification loop:
1. **Multi-Perspective Review:** Mutations are vetted across five autonomous review personas (Execution Optimizer, Security Boundary, AST Logic, Backward Compatibility, Operator Safety).
2. **Deterministic AST Invariants:** Zero-LLM syntax guards verify symbol tables and dependency trees before code can execute.
3. **Historical Commit Intelligence:** Ingests paired historical bug-fix pairs (`Archaeology-Engine`) to ground the engine in real-world error resolutions.
4. **Resilient Full-Stack Runtime:** Built on modern Next.js App Router patterns, Express, React, and Tailwind CSS.

---

## 2. Architectural Pipeline

```
                     ┌──────────────────────────────────────────────┐
                     │          Git Archaeology History             │
                     │    (craighckby-stack/Archaeology-Engine)     │
                     └──────────────────────┬───────────────────────┘
                                            │ Live Ingestion
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │      Firestore & Local Cache Memory Store    │
                     └──────────────────────┬───────────────────────┘
                                            │ Context Vector
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    MULTI-AGENT DEBATE & CONSENSUS CHAMBER                               │
│                                                                                         │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌───────────────────────────┐  │
│  │ Execution Opt  │ │ Security Guard │ │ AST Validator  │ │ Compatibility & Operator  │  │
│  └────────┬───────┘ └────────┬───────┘ └────────┬───────┘ └─────────────┬─────────────┘  │
│           └──────────────────┴─────────┬────────┴───────────────────────┘               │
│                                        ▼                                                │
│                              Coherence Evaluation Gate                                  │
└────────────────────────────────────────┬────────────────────────────────────────────────┘
                                         │ Passed Candidate Mutation
                                         ▼
                     ┌──────────────────────────────────────────────┐
                     │         Deterministic AST Diff Gate          │
                     │       & Structural Sanity Verification       │
                     └──────────────────────┬───────────────────────┘
                                         │ Zero-Fault Approved
                                         ▼
                     ┌──────────────────────────────────────────────┐
                     │    Hotswap Module Registry / Git Committer   │
                     └──────────────────────────────────────────────┘
```

---

## 3. Key Subsystems

### 3.1 Debate Chamber & Consensus Gate
Located in `src/app/api/evolution/debate/route.ts` and `src/components/DebateChamber.tsx`, this subsystem processes proposals through specialized evaluator personas. A concurrency limiter (`runWithConcurrencyLimit(2)`) protects against API rate limits while calculating a unified consensus score ($0.0 - 1.0$) with hard veto rights on critical security or structural flaws.

### 3.2 Deterministic AST Diff Gate & Structural Sanity Guard
- **`src/lib/structural-sanity-guard.ts`**: Verifies that declared function signatures and exported classes are not deleted, hollowed out, or replaced with empty stubs.
- **`src/lib/ast-diff-gate.ts`**: Analyzes TypeScript ASTs without model inference, enforcing strict limits on structural churn and verifying imports against a whitelist.

### 3.3 Historical Commit Archaeology
- **`src/lib/archaeology-live-sync.ts`**: Connects directly to GitHub to parse unified diff records, separating broken commits from verified patches to build a grounded post-mortem memory.

### 3.4 Cryptographic Helpers & Security
- **`src/lib/darlek/crypto.ts`**: Cryptographic module featuring SHA-256 digests, HMAC-SHA256 signing, constant-time comparisons (`timingSafeEqual`), cryptographically random tokens, and secret masking.
- **`src/lib/binaryShield.ts`**: Web Crypto API AES-GCM secure storage pipeline.

### 3.5 Multi-Tier Generative AI Integration
- Powered by both the official `@google/generative-ai` SDK (`src/lib/darlek/ai.ts`) and `@google/genai` (`src/lib/gemini.ts`), featuring automated fallback cascades (`gemini-2.5-flash` $\rightarrow$ `gemini-1.5-flash` $\rightarrow$ deterministic offline templates).

---

## 4. Project Structure

```
├── .env.example                         # Environment configuration template
├── LICENSE                              # Non-Profit CC BY-NC-SA 4.0 License
├── README.md                            # Comprehensive technical documentation
├── package.json                         # Dependencies and build scripts
├── server.ts                            # Full-stack Express server + Vite middleware
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── evolution/               # Evolution engine routes (debate, propose, health, lock)
│   │   ├── globals.css                  # Global Tailwind styles
│   │   ├── layout.tsx                   # Root HTML layout and typography
│   │   └── page.tsx                     # Main page entrypoint
│   ├── components/
│   │   ├── AgentOrchestra.tsx           # Multi-agent visual orchestrator
│   │   ├── DebateChamber.tsx            # Live debate review interface
│   │   ├── DosConsoleModal.tsx          # Diagnostic CLI console
│   │   ├── LicenseModal.tsx             # Interactive Non-Profit license viewer
│   │   ├── MainPage.tsx                 # Core UI container
│   │   └── SaturationMetrics.tsx        # System saturation telemetry
│   ├── lib/
│   │   ├── darlek/
│   │   │   ├── ai.ts                    # Google AI Studio SDK integration
│   │   │   ├── crypto.ts                # Cryptographic helper module
│   │   │   └── index.ts                 # Darlek library export index
│   │   ├── archaeology-live-sync.ts     # Git archaeology dataset fetcher
│   │   ├── ast-diff-gate.ts             # Deterministic AST validation
│   │   ├── evolutionLock.ts             # Atomic distributed mutex lock
│   │   ├── gemini.ts                    # AI client with fallback cascade
│   │   └── structural-sanity-guard.ts   # Anti-scrubbing sanity guardian
│   └── types.ts                         # Shared TypeScript interfaces
```

---

## 5. Getting Started

### 5.1 Prerequisites
- **Node.js** 20+ or 22+ (LTS)
- A **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))
- (Optional) GitHub Personal Access Token for remote repository sync

### 5.2 Installation

```bash
# Clone the repository
git clone https://github.com/craighckby-stack/DARLEK-CAAN.git
cd DARLEK-CAAN

# Install dependencies
npm install
```

### 5.3 Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your configuration values:

```env
# Google AI Studio Gemini API Key (Server-side)
GEMINI_API_KEY=your_gemini_api_key_here

# App settings
NODE_ENV=development
PORT=3000
```

### 5.4 Running the Application

```bash
# Start the local development server (runs Express + Vite on port 3000)
npm run dev

# Run static linting
npm run lint

# Compile production bundle
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET / POST` | `/api/evolution/health` | Diagnostic health check and system saturation metrics |
| `POST` | `/api/evolution/propose` | Generates candidate mutation proposals for target code |
| `POST` | `/api/evolution/debate` | Multi-agent consensus debate on proposed mutations |
| `POST` | `/api/evolution/coherence-gate`| Evaluates coherence score and veto conditions |
| `POST` | `/api/evolution/lock` | Acquires or releases distributed atomic mutex |
| `GET / POST` | `/api/brain` | Inspects and queries current RAG memory state |

---

## 7. Non-Profit License & Citation

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)** with an explicit **Non-Profit Research Covenant**.

### Permitted
- Educational exploration and study
- Academic research and scientific benchmarking
- Non-monetized personal and non-profit usage
- Modifications shared under identical non-commercial terms

### Prohibited
- Commercial sale, re-licensing, or packaging
- Paid SaaS services or gated subscription access
- Closed-source proprietary redistribution

For citation in academic papers or non-profit research:

```bibtex
@misc{darlek_caan_2026,
  author = {Craighckby},
  title = {DARLEK CAAN: Autonomous Architectural Synthesizer and Verification Engine},
  year = {2026},
  publisher = {GitHub},
  howpublished = {\url{https://github.com/craighckby-stack/DARLEK-CAAN}},
  note = {Non-Profit Research License (CC BY-NC-SA 4.0)}
}
```
