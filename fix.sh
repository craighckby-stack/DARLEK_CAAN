/* DARLEK CAAN RAG SYNTHESIS - Autonomous Generation G-39 [2026-09-20T05:18:56.513Z] */
#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

TARGET_FILE="src/app/api/evolution/debate/route.ts"

if [ -f "$TARGET_FILE" ]; then
  sed -i 's/stance"}`;          const systemPrompt/stance"}`;\n          const systemPrompt/g' "$TARGET_FILE"
  sed -i 's/}`;`;/}`;/g' "$TARGET_FILE"
else
  sed -i 's/stance"}`;          const systemPrompt/stance"}`;\n          const systemPrompt/g' src/app/api/evolution/debate/route.ts 2>/dev/null || true
  sed -i 's/}`;`;/}`;/g' src/app/api/evolution/debate/route.ts 2>/dev/null || true
fi