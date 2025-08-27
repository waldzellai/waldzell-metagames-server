# <Metagame Title>

**One-line purpose statement summarizing what this metagame does and the core problem it prevents.**

## Overview

Brief paragraph explaining the philosophy, when to use it, and how it changes default behavior. Keep it scannable and explicit about outcomes.

## Key Features

- **Feature name**: short description of what this mechanism provides
- **Feature name**: short description
- **Feature name**: short description

## Usage

```bash
/<command-name> [required_or_freeform_arg] [--OPTION_1=<value>] [--OPTION_2=<value>] [...]
```

### Arguments

- `required_or_freeform_arg` (required): one-line description of the required input
- `OPTION_1` (optional): description with defaults and valid values
- `OPTION_2` (optional): description with defaults and valid values

## Variables

List important variables that the game reads or sets; prefer uppercase names and show defaults or expected forms.

- VARIABLE_A: $ARGUMENTS | explicit type/default
- VARIABLE_B: derived | where it comes from
- VARIABLE_C: boolean or enum | default and purpose

## Protocol / Phases

Structure the workflow into clearly named, time-boxed phases. Each phase should include Objective, Activities (or Steps), and a Gate with crisp criteria. Use checkboxes for gates.

### Phase 0: Initialize
**Objective**: Prepare state, directories, and constraints.

```bash
# Create working state
mkdir -p .<game-id>/{state,logs,artifacts}
cat > .<game-id>/state.json << 'EOF'
{
  "phase": 0,
  "created": "$(date -Iseconds)",
  "budgets": {
    "time": "<hours-or-mins>",
    "risk": "<low|medium|high>"
  },
  "players": {
    "perfectionist": { "weight": 0.8 },
    "shipper": { "weight": 0.9 },
    "maintainer": { "weight": 0.7 },
    "user": { "weight": 1.0 }
  }
}
EOF
```

Gate 0:
- [ ] Inputs are specific and measurable
- [ ] Budgets and stakes set

### Phase 1: Discovery / Analysis
**Objective**: Collect inputs, map the surface area, and define success.

Activities:
- Identify scope and artifacts to inspect or generate
- Extract inventory relevant to the goal (APIs, docs, tests, modules)
- Define success criteria and constraints

Gate 1:
- [ ] Success criteria written
- [ ] Scope and assumptions explicit
- [ ] Initial plan or candidate list prepared

### Phase 2: Strategy / Planning
**Objective**: Choose the approach; configure anti-spiral mechanisms.

Activities:
- Generate 2–3 options and evaluate against constraints
- Select primary approach and backup
- Configure commitment devices (time boxes, scope locks)

Gate 2:
- [ ] Primary approach selected with rationale
- [ ] Backup identified with pivot condition
- [ ] Validation and rollback strategy defined

### Phase 3: Execution Loop
**Objective**: Implement the smallest testable steps with continuous validation.

Activities:
- Implement minimal increments toward the goal
- Validate against success criteria and budgets
- Capture artifacts and update state

Gate 3 (per iteration):
- [ ] Progress toward objective
- [ ] No critical regressions
- [ ] Within budgets and constraints
- [ ] Learning captured

### Phase 4: Validation & Reporting
**Objective**: Verify outcomes and produce actionable artifacts.

Activities:
- Run final validation checks (tests, builds, link checks, etc.)
- Aggregate results into a concise report
- List discrepancies, risks, and recommended actions

Gate 4:
- [ ] All critical validations pass
- [ ] Report generated and stored
- [ ] Rollback plan verified (or not needed)

## Decision Framework

Define when to continue, stop/escalate, or accept a partial outcome.

**Continue if**: clear progress, no critical damage, within budget, learning captured.

**Stop and escalate if**: no progress after N iterations, risk rising, scope ballooning.

**Accept partial solution if**: core objective achieved, diminishing returns, time constraints bind.

## Anti-Patterns Prevented

List the specific failure modes this game guards against and how.

- **Anti-pattern name**: symptoms and the mechanism that prevents it
- **Anti-pattern name**: symptoms and prevention

## Example Usage

```bash
/<command-name> "<primary input>" --option_1=value --option_2=value
```

## Integration Points

List systems and tools this metagame commonly integrates with (CI, Git, MCP tools, telemetry, docs, SDKs). Include brief notes on what each integration is used for.

## Success Metrics

- **Quality**: measurable quality indicators improved or maintained
- **Process**: time-box adherence, spiral detections avoided
- **Business**: shipping readiness, reduced debt, improved velocity

## Meta-Learning

Explain how runs create feedback loops: what artifacts are stored, how patterns are recognized, and how defaults evolve.

## Related Workflows

- Link to adjacent metagames in `metagames/` that complement or precede this one.

---

Tip: Keep the tone directive and the structure scannable. Prefer short, actionable sections, explicit gates, and minimal but sufficient ceremony. Avoid placeholders at runtime; ensure commands are runnable or clearly marked as pseudocode when environment-specific.


