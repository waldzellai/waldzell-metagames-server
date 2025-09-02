# Idea-to-Spec Synthesis Protocol

**Transform a single ideas document into a curated folder of per-idea specifications with time-boxed phases, decision gates, and minimal-deviation discipline.**

## Overview

This protocol turns a source markdown containing multiple project ideas (e.g., `project-ideas-list.md`) into a subfolder under `specs/` containing one specification `.md` per idea. It blends the discipline of time-boxed phases and gates (Ulysses), the restraint of minimal deviation (Virgil 3% Rule), and pragmatic batching economics (Refactoring Game) while preserving familiar conventions already used in this repo.

## Key Features

- **Deterministic extraction**: Robust parsing rules for headings and enumerated lists
- **Time-boxed phases & gates**: Prevent scope creep and endless iteration
- **Minimal deviation**: Change only what’s necessary from existing patterns
- **Atomic outputs**: One folder per batch, one file per idea, index included
- **Idempotent & resumable**: Skips existing files; writes only missing specs

## Usage

```bash
/idea-to-specs "[source_path]" [output_dir] [batch_name] [template_path] [iteration_limit] [budget]
```

### Arguments

- `source_path` (required): Path to ideas markdown, e.g., `./project-ideas-list.md`
- `output_dir` (optional): Base output directory. Default: `./specs`
- `batch_name` (optional): Subfolder name under `output_dir`. Default: auto timestamp `ideas-YYYYMMDD-HHMM`
- `template_path` (optional): Path to custom spec template. Default: built-in template in this protocol
- `iteration_limit` (optional): Max implementation passes. Default: `2`
- `budget` (optional): Energy units for batching decisions. Default: `100`

## Protocol Structure

### Phase 1: Reconnaissance (25% of budget)
**Objective**: Understand the source document structure and enumerate ideas deterministically.

**Activities**:
- Read `source_path` and extract idea candidates via the following precedence:
  1. Markdown headings starting with `####` or `###` that clearly title an idea
  2. Numbered/bolded list items matching `^\s*(\d+)\.` or `^\s*\*\*\d+\.` patterns
  3. Fallback: Lines starting with a number and a period followed by a capitalized title
- Normalize each idea title and compute a slug: lowercased, hyphenated, remove quotes and non-alphanumerics
- Detect already-existing spec files in the target batch to preserve idempotency

**Gate Criteria**:
- [ ] `ideas.json` prepared in-memory with `{ index, title, slug }` entries
- [ ] At least one idea discovered
- [ ] No parsing ambiguities unresolved (or they are listed for human review)

### Phase 2: Strategic Planning (15% of budget)
**Objective**: Plan file layout, select template, and apply minimal-deviation design.

**Activities**:
- Choose `batch_name` and create `output_dir/batch_name/`
- Select spec template: `template_path` if provided; else use Built-in Template below
- Determine naming: `NN-slug.md` where `NN` is zero-padded by discovery index
- Apply Virgil 3% Rule:
  - Necessary changes only (naming, paths, required sections)
  - Preserve familiarity (sections, tone, formatting)
- Plan commits: one atomic commit for the batch (plus follow-ups if needed)

**Gate Criteria**:
- [ ] Folder exists: `output_dir/batch_name`
- [ ] Naming and template confirmed
- [ ] Idempotency strategy set (skip/overwrite policy defined; default: skip existing)

### Phase 3: Controlled Implementation (45% of budget)
**Objective**: Generate one spec per idea with continuous validation.

For each idea (parallelizable within budget constraints):
- Render the template with:
  - Title, short summary (from source context), rationale, problem statement
  - Requirements and non-goals
  - Architecture sketch and interfaces
  - Risks, dependencies, success metrics
  - Minimal-deviation register (what changed vs. existing patterns and why)
- Write to `output_dir/batch_name/NN-slug.md`
- Update `index.md` with links and one-line summaries

**Iteration Gate** (each pass):
- [ ] New files compile to valid markdown
- [ ] No duplicate slugs
- [ ] No overwrites unless explicitly allowed
- [ ] Learning captured (edge cases recorded)

### Phase 4: Validation & Documentation (15% of budget)
**Objective**: Ensure outputs are robust, discoverable, and documented.

**Activities**:
- Sanity checks: existing links, required sections present
- Generate/refresh `index.md` with table of contents and metadata
- Run the repo’s Post-Edit Workflow (review, stage, commit, memory record)

**Gate Criteria**:
- [ ] All specs created or intentionally skipped
- [ ] Index updated
- [ ] Atomic commit created with descriptive message
- [ ] Memory recorded (what, why, impact)

## Decision Framework

**Continue if:**
- Clear progress toward completing the batch
- Within iteration and time budget
- No regressions or unintended overwrites

**Stop or Pause if:**
- Parsing ambiguities require human judgment
- Scope creep (new categories/large rewrites) emerges
- Budget exhausted without material progress

**Accept Partial Batch if:**
- Majority of specs are generated cleanly
- Remaining items are blocked on human input

## Safety Rails (from Metagames)

- **Virgil 3% Rule**: Change only what must change for this repo; preserve structure and tone
- **Ulysses Gates**: Enforce per-phase checklists; abort when gates fail
- **Refactoring Game Budgeting**: Keep batch size within `budget`; prioritize low-risk ideas first

## Naming and Paths

- Output folder: `output_dir/batch_name/` (e.g., `./specs/ideas-20241220-1700/`)
- Per-spec file: `NN-slug.md` (e.g., `01-safety-officer-middleware-proxy.md`)
- Index: `index.md` inside the batch folder

## Built-in Spec Template

```markdown
# {TITLE}

## Summary
One-paragraph overview of the project idea and the value proposition.

## Problem Statement
The specific problem this project solves.

## Rationale
Why this matters in the MCP ecosystem; prior art and context.

## Requirements
- Functional requirements
- Non-functional requirements

## Non-Goals
Explicitly out-of-scope aspects.

## Architecture
- High-level design and key components
- Interfaces, tools, and resources

## Implementation Plan
- Milestones and deliverables
- Dependencies and sequencing

## Risks & Mitigations
Known risks and strategies to mitigate them.

## Success Metrics
Measurable outcomes to determine success.

## Minimal-Deviation Register (Virgil 3%)
- Changes made vs. existing patterns and why they are necessary or valuable

## References
Links to related specs, issues, or prior art.
```

## Implementation Checklist (Claude Code)

1. Parse ideas
   - Extract idea titles from `source_path` using the precedence rules above
   - Produce an in-memory list of `{ index, title, slug }`
2. Prepare output
   - Determine `batch_name`; create `output_dir/batch_name/`
   - If `index.md` exists, back it up or regenerate intentionally
3. Generate specs (parallel where safe)
   - For each idea, render the template and write `NN-slug.md`
   - Add an anchor entry to `index.md` with title and summary
4. Validate
   - Ensure required sections exist in each spec
   - Confirm no filename collisions or overwrites (unless allowed)
5. Post-Edit Workflow
   - Review changes (`git status`, `git diff`)
   - Stage and commit with a descriptive message
   - Create a memory record summarizing the batch

## Example Invocation

```bash
/idea-to-specs "./project-ideas-list.md" ./specs ideas-2024-12-20 ./metagames/spec-template.md 2 120
```

## Notes on `project-ideas-list.md`

- This repo’s example uses top-level `###` sections with bold-numbered entries. If numbered items are used (e.g., `**1. Title**`), apply the numbered/bold pattern to extract ideas.
- For safety, prefer explicit headings (e.g., `#### The "Safety Officer" Middleware Proxy`) when editing the source document going forward.

---

This protocol preserves familiarity with existing metagame workflows while providing a deterministic, low-friction path from ideation to actionable specifications.


