# Debugging Hypothesis → Spec Game

Game-theoretic debugging workflow that converts a concrete PROBLEM_STATEMENT into ranked hypotheses (via Clear Thought MCP), selects a primary fix approach under quality gates, and synthesizes a production-grade implementation spec under `specs/`.

References and alignment:
- Ulysses discipline and gates: [.kilocode/workflows/ulysses-protocol.md](.kilocode/workflows/ulysses-protocol.md)
- Sandbox testing stage-gates: [.kilocode/workflows/sandbox-testing-mechanism.md](.kilocode/workflows/sandbox-testing-mechanism.md)
- Shipping discipline: [.kilocode/workflows/feature-implementation-game.md](.kilocode/workflows/feature-implementation-game.md)
- Command style and report artifacts: [.claude/commands/games/docs-improvement-game.md](.claude/commands/games/docs-improvement-game.md)

## Command

```bash
/debugging-hypothesis-to-spec-game "$PROBLEM_STATEMENT" \
  [--STAKES=<low|medium|high|critical>] \
  [--BUDGET_HOURS=<int, default:4>] \
  [--CONFIDENCE_THRESHOLD=<0..1, default:0.75>] \
  [--ITERATION_LIMIT=<int, default:3>] \
  [--SPEC_PATH=<path, default: specs>] \
  [--TAGS=<csv>] \
  [--COMMENTS="<free text>"]
```

- PROBLEM_STATEMENT: A precise, high-signal description of the error, ideally with observed output snippets, logs, or failing test output.

## Variables

- PROBLEM_STATEMENT: $ARGUMENTS
- STAKES: low|medium|high|critical (default: medium)
- BUDGET_HOURS: integer (default: 4)
- CONFIDENCE_THRESHOLD: float 0..1 (default: 0.75)
- ITERATION_LIMIT: integer (default: 3)
- SPEC_PATH: path to write the resulting spec (default: `specs/`)
- TAGS: comma-separated tags (e.g., runtime,node,api)
- COMMENTS: free-form contextual notes

## Required Environment (no secrets hardcoded)

- Clear Thought MCP available (dispatcher tool):
  - Tool name: `clear_thought`
  - Operations: `debugging_approach`, `scientific_method`, `sequential_thinking`, etc. See server docs: clear-thought://operations
- Optional: E2B sandbox tools if you enable Phase 4 (see sandbox-testing-mechanism workflow)
- Ensure MCP config (keys, endpoints) come from env/config files managed by your agent runtime

## Artifacts

- `.debugging-hypothesis-game/state.json`: session state, budgets, gates
- `.debugging-hypothesis-game/logs/*.log`: reasoning outputs (sanitized)
- `.debugging-hypothesis-game/artifacts/*.json`: hypothesis sets, ranking, anti-pattern report
- `specs/<generated-name>.md`: the implementation spec

---

## Phase 0 — Initialize (Time-boxed: 5–10% of budget)

```bash
mkdir -p .debugging-hypothesis-game/{logs,artifacts}
cat > .debugging-hypothesis-game/state.json << EOF
{
  "problem_statement": "$PROBLEM_STATEMENT",
  "stakes": "${STAKES:-medium}",
  "budget_hours": ${BUDGET_HOURS:-4},
  "confidence_threshold": ${CONFIDENCE_THRESHOLD:-0.75},
  "iteration_limit": ${ITERATION_LIMIT:-3},
  "spec_path": "${SPEC_PATH:-specs}",
  "tags": "${TAGS:-""}",
  "comments": "${COMMENTS:-""}",
  "phase": 0,
  "created": "$(date -Iseconds)"
}
EOF

echo "🎮 Debugging Hypothesis → Spec Game initialized"
```

Gate 0: proceed if PROBLEM_STATEMENT is specific (has clear symptoms or repro steps). If vague, enrich in COMMENTS and re-run.

---

## Phase 1 — Reconnaissance (25% of budget)

Objectives:
- Normalize the problem statement
- Capture evidence (stack traces, logs, failing test output)
- Define success criteria and regression guardrails

```bash
# Persist a normalized brief
cat > .debugging-hypothesis-game/artifacts/recon.md << 'EOF'
# Recon
- Symptoms: <paste copy-paste friendly snippets>
- Affected area: <service/module>
- Repro path: <precise steps/inputs>
- Impact/Risk: <user-facing / SLO>

## Success Criteria
- [ ] Failing test(s) pass
- [ ] Error rate Δ < threshold
- [ ] No perf regressions (p95 within budget)
- [ ] New telemetry confirms expected behavior
EOF
```

Gate 1: Is the problem well-formed?
- [ ] Specific symptoms captured
- [ ] Expected vs actual clarified
- [ ] Minimal repro path stated
- [ ] Success criteria declared

If false, loop once to tighten the statement; else proceed.

---

## Phase 2 — Hypothesis Generation with Clear Thought MCP (30% of budget)

Use Clear Thought MCP to propose, expand, and rank hypotheses, then decide a primary approach.

```bash
# 2.1 Generate candidate hypotheses (debugging_approach)
clear_thought '{
  "operation":"debugging_approach",
  "prompt":"${PROBLEM_STATEMENT}",
  "context":"Stakes: ${STAKES}. Budget hours: ${BUDGET_HOURS}. Comments: ${COMMENTS}",
  "advanced":{"autoProgress":true,"generateNextSteps":true,"saveToSession":false}
}' | tee .debugging-hypothesis-game/logs/hypotheses.jsonl

# 2.2 Cross-check with scientific_method
clear_thought '{
  "operation":"scientific_method",
  "prompt":"Formulate falsifiable hypotheses for: ${PROBLEM_STATEMENT}",
  "context":"List instrumentation and disambiguating tests. Rank by explanatory power and test cost.",
  "advanced":{"autoProgress":true,"saveToSession":false}
}' | tee -a .debugging-hypothesis-game/logs/hypotheses.jsonl

# 2.3 Synthesize and rank (sequential_thinking)
clear_thought '{
  "operation":"sequential_thinking",
  "prompt":"Aggregate and rank the hypotheses above. Return top 3 with rationale, risks, and a minimal test for each.",
  "context":"Confidence threshold: ${CONFIDENCE_THRESHOLD}",
  "advanced":{"autoProgress":true,"saveToSession":false}
}' | tee .debugging-hypothesis-game/artifacts/ranked_hypotheses.json
```

Expected schema (illustrative):
```json
{
  "hypotheses": [
    {
      "id": "H1",
      "statement": "...",
      "confidence": 0.82,
      "primary_mechanism": "...",
      "minimal_test": "describe minimal targeted test ..",
      "risks": ["..."],
      "telemetry": ["counter:...", "trace:..."]
    }
  ]
}
```

Gate 2: Choose primary hypothesis
- [ ] Primary confidence ≥ CONFIDENCE_THRESHOLD
- [ ] Two backups enumerated with pivot tests
- [ ] Minimal test for H1 is practical in scope

If failed: refine with another short loop (≤ ITERATION_LIMIT).

---

## Phase 3 — Spec Synthesis (25% of budget)

Create an implementation spec under `SPEC_PATH`. Filename uses a stable slug from the statement and date.

```bash
SPEC_DIR="$(jq -r .spec_path .debugging-hypothesis-game/state.json)"
DATE="$(date +%Y-%m-%d)"
SLUG="$(echo "$PROBLEM_STATEMENT" | tr -dc '[:alnum:][:space:]-_' | awk '{print tolower($0)}' | tr ' ' '-' | cut -c1-60)"
OUT="$SPEC_DIR/debug-${DATE}-${SLUG}.md"
mkdir -p "$SPEC_DIR"

cat > "$OUT" << 'EOF'
# Debug Fix Spec

## Problem Statement
<verbatim from session>

## Hypothesis (H1)
- Statement:
- Confidence:
- Primary mechanism:
- Minimal targeted test:

## Alternative Hypotheses (H2, H3)
- H2: <summary> (why less likely, pivot test)
- H3: <summary> (why less likely, pivot test)

## Scope and Non-Goals
- In scope:
- Out of scope:

## Proposed Change
- Core change(s):
- Touchpoints (files/modules):
- Data/Schema/Migrations:
- Compatibility and Rollback:

## Tests
- Unit:
- Integration:
- Regression guard:
- Repro test for reported scenario:

## Telemetry & Observability
- Metrics:
- Events:
- Traces:
- Dashboards/alerts to review:

## Risks & Mitigations
- Risk 1: …
- Risk 2: …

## Rollback Plan
- How to revert quickly:
- Data implications:

## Success Criteria (Gate)
- [ ] All tests passing
- [ ] Error rate Δ within budget
- [ ] Performance p95 within budget
- [ ] Telemetry confirms fix
- [ ] No critical regressions

## Appendix
- Evidence snippets
- Links to dashboards
- Reasoning extracts (sanitized)
EOF

echo "📝 Spec drafted at: $OUT"
```

Spec completeness Gate:
- [ ] Tests section includes minimal repro and regression guard
- [ ] Telemetry planned (at least 1 metric + 1 event or trace)
- [ ] Rollback defined

---

## Phase 4 — Optional Sandbox Validation (≤ 15% of budget)

If feasible, validate a minimal test or repro using sandbox-testing workflow (see [.kilocode/workflows/sandbox-testing-mechanism.md](.kilocode/workflows/sandbox-testing-mechanism.md)).

```bash
# Example (optional):
/sandbox-testing-game "<repo-or-path>" "" "" "run the minimal test H1 recommends" 600000
```

Gate 4 (optional): If sandbox run contradicts H1, pivot to H2 and update spec.

---

## Phase 5 — Anti-Pattern Detection (5% of budget)

```bash
ISSUES=()

grep -qi "## tests" "$OUT" || ISSUES+=("missing_tests_section")
grep -qi "## telemetry" "$OUT" || ISSUES+=("missing_telemetry")
grep -qi "## rollback" "$OUT" || ISSUES+=("missing_rollback")
grep -qi "## risks" "$OUT" || ISSUES+=("missing_risks")
grep -qi "## hypothesis (h1)" "$OUT" || ISSUES+=("missing_primary_hypothesis")

jq -n --argjson list "$(printf '%s\n' "${ISSUES[@]}" | jq -R . | jq -s .)" \
  '{anti_patterns: $list, file: "'"$OUT"'"}' \
  > .debugging-hypothesis-game/artifacts/anti_patterns.json

echo "🚨 Anti-patterns: ${ISSUES[*]:-(none)}"
```

---

## Phase 6 — Final Summary

```bash
echo "\n📊 DEBUGGING HYPOTHESIS → SPEC GAME COMPLETE\n==========================================="
echo "📝 Spec: $OUT"
echo "📂 State: .debugging-hypothesis-game/state.json"
echo "🔍 Hypotheses: .debugging-hypothesis-game/artifacts/ranked_hypotheses.json"
echo "⚠️ Anti-patterns: $(jq -r '.anti_patterns|length' .debugging-hypothesis-game/artifacts/anti_patterns.json 2>/dev/null || echo 0)"
```

---

## Clear Thought MCP Integration (Details)

- Dispatcher tool: `clear_thought(operation, prompt, context?, sessionId?, parameters?, advanced?)`
- Recommended operations for this game:
  - `debugging_approach` — propose fault models, checks, and tests
  - `scientific_method` — form falsifiable hypotheses and experiments
  - `sequential_thinking` — synthesize a ranked plan with milestones

Example calls (the orchestrator should adapt to its MCP client API):

```json
{
  "server": "clear-thought",
  "tool": "clear_thought",
  "args": {
    "operation": "debugging_approach",
    "prompt": "Stack trace shows XYZ when calling ABC. Service S fails with 500. Logs: ...",
    "context": "Stakes: high; Budget: 4h; Expect top 3 hypotheses with confidence and tests.",
    "advanced": { "autoProgress": true, "generateNextSteps": true, "saveToSession": false }
  }
}
```

If the server advertises resource URIs, include links (e.g., `clear-thought://operations#debugging_approach`) in your session notes for traceability.

---

## Quality Gates (Ulysses-Aligned)

Continue if:
- Clear progress toward hypothesis discrimination
- Inside iteration/time budget
- Learning captured (summaries, tests added)

Stop/Escalate if:
- No progress after 2 iterations
- Risk exceeds acceptable threshold
- Scope ballooning beyond budget

Accept Partial Solution if:
- Core regression is resolved
- Further iteration has diminishing returns

---

## Output Spec Checklist (for reviewers)

- [ ] Hypothesis H1 states mechanism and failure mode
- [ ] Tests include minimal repro and regression guard
- [ ] Telemetry plan includes at least one metric + one event/trace
- [ ] Risks and rollback are actionable
- [ ] Touchpoints and migration impacts listed
- [ ] Success criteria measurable and verifiable

---

## Examples

```bash
# Standard run (medium stakes)
/debugging-hypothesis-to-spec-game \
  "Service returns 500 when payload includes null items; logs show TypeError in transform()" \
  --STAKES=high --BUDGET_HOURS=4 --CONFIDENCE_THRESHOLD=0.8 --TAGS=api,node,transform
```

```bash
# Critical, tight budget, custom spec path
/debugging-hypothesis-to-spec-game \
  "Batch job stalls at 75% with spike in DB CPU; slow query logs match join on unindexed column" \
  --STAKES=critical --BUDGET_HOURS=2 --CONFIDENCE_THRESHOLD=0.7 --SPEC_PATH=specs
```

---

## Notes & Constraints

- Never hardcode secrets; MCP credentials and endpoints must come from environment/config.
- Keep all generated files < 500 lines each and modular for maintainability.
- If Clear Thought MCP is unavailable, record fallback reasoning manually in `.debugging-hypothesis-game/logs/` and proceed with gates explicitly.

---

## Clear Thought MCP Quick Reference

The game integrates Clear Thought as a single-dispatch MCP tool:
- Tool: `clear_thought(operation, prompt, context?, sessionId?, parameters?, advanced?)`
- Pattern: one tool, many operations selected by the `operation` enum
- Results are structured per operation; session state is supported

This section is derived from live calls in this session plus the server’s exported operations list (source: registerTools + executeClearThoughtOperation). It supersedes any earlier subset you may have seen.

### Supported Operations (full list, one-line)

Core thinking:
- sequential_thinking — stepwise plans with milestones and checks
- mental_model — internal model of the system/problem with reasoning
- debugging_approach — candidate faults, probes, and isolation steps
- creative_thinking — divergent idea generation under constraints
- visual_reasoning — create/update diagrams (textual form)
- metacognitive_monitoring — self-assessment of progress/confidence
- scientific_method — falsifiable hypotheses and experiments

Collaborative and decisions:
- collaborative_reasoning — personas, contributions, and stages
- decision_framework — options, criteria, constraints, recommendation
- socratic_method — clarify premises, targeted questions/claims
- structured_argumentation — arguments with premises, strengths/weaknesses

Systems and session ops:
- systems_thinking — components, relationships, loops, leverage points
- session_info — current session stats/metadata
- session_export — export session state
- session_import — import session state

New modules:
- research — basic research scaffolding (query, findings, citations)
- analogical_reasoning — source/target domain mapping with inferred insights
- causal_analysis — graph + intervention + predicted/counterfactual effects
- statistical_reasoning — summary|bayes|test|montecarlo analytical modes
- simulation — steps, trajectory, final state
- optimization — best vector/objective, iterations, constraintsSatisfied
- ethical_analysis — framework, findings, risks, mitigations, score?
- visual_dashboard — aggregate diagrams/reasoning/decisions/graph
- custom_framework — register/update an ad-hoc framework payload
- code_execution — run code (python-only, guarded by server config)
- orchestration_suggest — suggested next operations

### Dispatcher Input Schema (authoritative)

```json
{
  "type": "object",
  "properties": {
    "operation": {
      "type": "string",
      "enum": [
        "sequential_thinking","mental_model","debugging_approach","creative_thinking",
        "visual_reasoning","metacognitive_monitoring","scientific_method",
        "collaborative_reasoning","decision_framework","socratic_method","structured_argumentation",
        "systems_thinking","session_info","session_export","session_import",
        "research","analogical_reasoning","causal_analysis","statistical_reasoning",
        "simulation","optimization","ethical_analysis","visual_dashboard",
        "custom_framework","code_execution","orchestration_suggest"
      ]
    },
    "prompt": { "type": "string", "description": "Primary question or problem" },
    "context": { "type": "string" },
    "sessionId": { "type": "string" },
    "parameters": { "type": "object", "additionalProperties": true },
    "advanced": {
      "type": "object",
      "properties": {
        "autoProgress": { "type": "boolean" },
        "saveToSession": { "type": "boolean", "default": true },
        "generateNextSteps": { "type": "boolean", "default": true }
      }
    }
  },
  "required": ["operation", "prompt"]
}
```

Notes
- `parameters` is operation-specific and permissive (record of unknowns); examples for each operation below.
- Advanced defaults: `saveToSession=true`, `generateNextSteps=true` (opt out if you prefer stateless/quiet behavior).

### Typical Output Envelopes (minimal examples)

Common envelope includes `toolOperation`, operation-specific fields, and optional `sessionContext`.

- session_info
```json
{
  "toolOperation": "session_info",
  "sessionId": "uuid",
  "stats": {
    "sessionId": "uuid",
    "createdAt": "ISO-8601",
    "lastAccessedAt": "ISO-8601",
    "thoughtCount": 0,
    "toolsUsed": [],
    "totalOperations": 0,
    "isActive": true,
    "remainingThoughts": 1000,
    "stores": {}
  }
}
```

- socratic_method
```json
{
  "toolOperation": "socratic_method",
  "question": "original prompt",
  "claim": "",
  "premises": [],
  "conclusion": "",
  "argumentType": "deductive",
  "confidence": 0.5,
  "stage": "clarification",
  "sessionId": "socratic-<ts>",
  "iteration": 1
}
```

- decision_framework
```json
{
  "toolOperation": "decision_framework",
  "decisionStatement": "text",
  "options": [],
  "criteria": [],
  "stakeholders": [],
  "constraints": [],
  "timeHorizon": "",
  "riskTolerance": "risk-neutral",
  "analysisType": "expected-utility",
  "stage": "problem-definition",
  "decisionId": "decision-<ts>",
  "iteration": 1
}
```

New modules (selected):
- research
```json
{ "toolOperation": "research", "query": "text", "findings": [], "citations": [] }
```
- analogical_reasoning
```json
{ "toolOperation": "analogical_reasoning", "sourceDomain": "", "targetDomain": "", "mappings": [], "inferredInsights": [], "sessionId": "analogy-<ts>" }
```
- causal_analysis
```json
{ "toolOperation": "causal_analysis", "graph": { "nodes": [], "edges": [] }, "intervention": {}, "predictedEffects": {}, "counterfactual": {}, "notes": {} }
```
- statistical_reasoning (modes)
  - summary
  ```json
  { "toolOperation": "statistical_reasoning", "stats": { "mean": 0, "variance": 0, "stddev": 0, "min": 0, "max": 0, "n": 0 } }
  ```
  - bayes
  ```json
  { "toolOperation": "statistical_reasoning", "bayes": { "prior": {}, "likelihood": {}, "posterior": {}, "evidence": 1 } }
  ```
  - test
  ```json
  { "toolOperation": "statistical_reasoning", "test": { "test": "z", "statistic": 0, "pValue": 1, "dof": null, "effectSize": null } }
  ```
  - montecarlo
  ```json
  { "toolOperation": "statistical_reasoning", "montecarlo": { "samples": 0, "mean": 0, "stddev": 0, "percentile": {} } }
  ```
- simulation
```json
{ "toolOperation": "simulation", "steps": 0, "trajectory": [], "finalState": {} }
```
- optimization
```json
{ "toolOperation": "optimization", "bestDecisionVector": [], "bestObjective": 0, "iterations": 0, "constraintsSatisfied": false }
```
- ethical_analysis
```json
{ "toolOperation": "ethical_analysis", "framework": "utilitarian", "findings": [], "risks": [], "mitigations": [], "score": 0 }
```
- visual_dashboard
```json
{ "toolOperation": "visual_dashboard", "dashboard": { "diagrams": [], "reasoning": [], "arguments": [], "decisions": [], "causal": [], "knowledgeGraph": {} } }
```
- custom_framework
```json
{ "toolOperation": "custom_framework", "result": "Framework registered or updated", "framework": { } }
```
- code_execution (python-only)
```json
{ "toolOperation": "code_execution", "request": { "language": "python", "preview": "first 120 chars" } }
// or, when disallowed:
// { "toolOperation": "code_execution", "error": "Code execution is disabled by configuration" }
```
- orchestration_suggest
```json
{ "toolOperation": "orchestration_suggest", "prompt": "text", "suggestions": ["..."] }
```

### Operation-Specific Parameters (examples)

- debugging_approach: `{ approach?: "binary_search"|string, steps?: string[], findings?: string, resolution?: string }`
- scientific_method: `{ stage?: "hypothesis"|"experiment"|"analysis"|"question"|"observation"|"iteration"|"conclusion", iteration?: number, nextStageNeeded?: boolean }`
- decision_framework: `{ options?: any[], criteria?: any[], stakeholders?: any[], constraints?: any[], riskTolerance?: "risk-neutral"|"risk-averse"|"risk-seeking", analysisType?: "expected-utility"|"multi-criteria", stage?: string }`
- statistical_reasoning: `{ mode: "summary"|"bayes"|"test"|"montecarlo", data?: number[], prior?: any, likelihood?: any, posterior?: any, evidence?: number, test?: "z"|"t"|string, statistic?: number, pValue?: number, dof?: number, samples?: number, mean?: number, stddev?: number }`
- causal_analysis: `{ graph?: {nodes: any[], edges: any[]}, intervention?: any, predictedEffects?: any, counterfactual?: any, notes?: any }`
- code_execution: `{ language?: "python", code: string }` (python-only; see constraints below)

### Advanced Flags (defaults and effects)

- autoProgress (optional): enables multi-stage flows internally without separate calls
- saveToSession (default true): persists reasoning artifacts to server state
- generateNextSteps (default true): returns recommended next steps in results

For this game, prefer `saveToSession=false` to keep artifacts in `.debugging-hypothesis-game/` unless you want server-side continuity across multiple invocations.

### Session & Memory

- session_info reports counters and timestamps; session_export/session_import persist/restore the internal store.
- The server exposes “remainingThoughts” and per-domain stores internally; practical limits are server-configured.

### Debugging Flow (enhanced)

1) Generate candidates — debugging_approach
   - Ask for top 3 hypotheses with confidence, minimal tests, and probes.
2) Falsify/confirm — scientific_method
   - Convert candidates into falsifiable hypotheses and experiments (include pivot tests).
3) Rank & decide — decision_framework or sequential_thinking
   - Rank by explanatory power, test cost, rollback risk; recommend a primary and backups.
4) Optional deepening:
   - causal_analysis to model likely interventions and predicted effects
   - statistical_reasoning(test) to evaluate evidence (p-values/effect sizes)
   - code_execution (python) to run a minimal reproducer if the server config allows

### Example Payloads (ready to use)

- Hypothesis generation
```json
{
  "operation": "debugging_approach",
  "prompt": "Service 500 when payload has null items; TypeError in transform().",
  "context": "Stakes: high; Budget: 4h; Need top 3 hypotheses with confidence and minimal tests.",
  "advanced": { "autoProgress": true, "generateNextSteps": true, "saveToSession": false }
}
```

- Falsifiable experiments
```json
{
  "operation": "scientific_method",
  "prompt": "Turn these candidate mechanisms into falsifiable hypotheses and experiments.",
  "parameters": { "stage": "hypothesis", "iteration": 1 },
  "advanced": { "autoProgress": true, "saveToSession": false }
}
```

- Ranking / decision
```json
{
  "operation": "decision_framework",
  "prompt": "Rank hypotheses by explanatory power, test cost, rollback risk; recommend a primary and two backups.",
  "parameters": { "riskTolerance": "risk-neutral", "analysisType": "expected-utility" },
  "advanced": { "saveToSession": false }
}
```

- Optional code execution (python-only)
```json
{
  "operation": "code_execution",
  "prompt": "Execute minimal Python reproducer for the suspected null coalesce bug.",
  "parameters": { "language": "python", "code": "print('repro start')\\n# ... your minimal repro ..." }
}
```

### Operational Constraints & Best Practices

- Code execution: python-only; requires server config `allowCodeExecution=true`. A timeout (`executionTimeoutMs`) is enforced server-side. When disallowed, you receive an error preview instead of execution.
- Payload size: Large logs should be summarized first; chunk prompts and store raw evidence as files.
- Idempotence: Provide a stable `sessionId` if you want server-side continuity; otherwise set `saveToSession=false` and persist artifacts locally.
- Discovery: Some deployments may not expose resources/list; rely on the dispatcher’s enum and probe operations directly.

---

## Quick Reference

- Initialize: `.debugging-hypothesis-game/state.json`
- Reason: `clear_thought` with debugging_approach/scientific_method/sequential_thinking
- Decide: Gate on confidence ≥ threshold, backups present
- Spec: Write to `specs/debug-YYYY-MM-DD-<slug>.md`
- Optional sandbox: `/sandbox-testing-game` for smoke validation
- Anti-patterns: `.debugging-hypothesis-game/artifacts/anti_patterns.json`
