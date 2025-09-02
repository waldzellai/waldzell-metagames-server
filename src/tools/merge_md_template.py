import re
import json

TEMPLATE_CONTENT = """# <Metagame Title>

**One-line purpose statement summarizing what this metagame does and the core problem it prevents.**

## Overview

Brief paragraph explaining the philosophy, when to use it, and how it changes default behavior. Keep it scannable and explicit about outcomes.

## Key Features

- **Feature name**: short description of what this mechanism provides
- **Feature name**: short description
- - **Feature name**: short description

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
"""

def parse_markdown_sections(markdown_content):
    sections = {}
    lines = markdown_content.splitlines()
    current_section_title = None
    current_section_content = []

    # Regex to capture H1, H2, H3 headings
    # H1 is special: it's typically the title. We'll handle the one-liner after it.
    heading_pattern = re.compile(r"^(#+)\s*(.*)$")

    # Handle the initial H1 and the one-line purpose statement
    if lines:
        match = heading_pattern.match(lines[0])
        if match and match.group(1) == '#':
            sections['# <Metagame Title>'] = [lines[0]]
            # Check for the one-line description right after H1
            if len(lines) > 1 and lines[1].strip().startswith('**') and lines[1].strip().endswith('**'):
                sections['<One-line purpose statement>'] = [lines[1]]
                start_line_idx = 2
            else:
                sections['<One-line purpose statement>'] = [] # Implicitly missing or empty
                start_line_idx = 1
        else:
            start_line_idx = 0

    for i in range(start_line_idx, len(lines)):
        line = lines[i]
        match = heading_pattern.match(line)

        if match:
            level = len(match.group(1))
            title = match.group(2).strip()
            
            # Flush previous section
            if current_section_title:
                sections[current_section_title] = current_section_content
            
            # Start new section
            current_section_title = "#" * level + " " + title
            current_section_content = [line]
        elif current_section_title:
            current_section_content.append(line)
        # If no heading yet, and not the H1/one-liner already processed, treat as part of a general "intro" or "overview" if it fits before the first H2
        else:
            pass # These lines would be before any H2, and not the H1/one-liner. They are implicitly part of the section they belong to.

    # Flush the last section
    if current_section_title:
        sections[current_section_title] = current_section_content
    
    # Post-process for "Overview" and "Key Features" which may lack explicit H2
    # This assumes "Overview" is implicitly after the one-line purpose and before "Key Features"
    # And "Key Features" might be a list without a direct H2 header if the parser missed it initially, 
    # but the template implies an H2.
    
    return {k: "\n".join(v) for k, v in sections.items()}

def merge_markdown_with_template(current_content):
    template_sections = parse_markdown_sections(TEMPLATE_CONTENT)
    current_sections = parse_markdown_sections(current_content)

    merged_content_lines = []
    
    # Handle the title and one-line purpose statement specially
    current_title = current_sections.get('# <Metagame Title>')
    current_purpose = current_sections.get('<One-line purpose statement>')

    if current_title:
        merged_content_lines.append(current_title)
    else:
        # If the current file doesn't have an H1, try to infer or use placeholder
        first_line = current_content.splitlines()[0] if current_content else ""
        if first_line.startswith('# '):
            merged_content_lines.append(first_line)
        else:
            merged_content_lines.append(template_sections['# <Metagame Title>'])
    
    if current_purpose:
        merged_content_lines.append(current_purpose)
    else:
        # if no purpose found, insert template's placeholder
        merged_content_lines.append(template_sections['<One-line purpose statement>'])
    
    # Iterate through template sections to ensure order and presence
    # Skip the H1 and one-line purpose as they were handled
    template_section_titles_ordered = [
        title for title in template_sections.keys() 
        if title != '# <Metagame Title>' and title != '<One-line purpose statement>'
    ]

    for template_title in template_section_titles_ordered:
        # Use template's full title for comparison, e.g., "## Overview"
        # Find the corresponding section in the current content
        found_existing_section = False
        for current_full_title, current_section_text in current_sections.items():
            if current_full_title.startswith(template_title.split(' ')[0] + ' '): # Match heading level and start of title
                if template_title.split(' ')[1] in current_full_title: # Check if key part of title exists
                    # Keep existing content, ensuring it starts with the correct heading
                    merged_content_lines.append(current_section_text.strip())
                    found_existing_section = True
                    break
        
        if not found_existing_section:
            # If not found, append the template section.
            # However, if the template section is just a placeholder, don't add it.
            # For simplicity for now, just append the template. Further refinement can be done here.
            normalized_template_content = template_sections[template_title].strip()
            if not normalized_template_content.startswith(template_title): # Avoid adding heading twice if it's in the content
                 merged_content_lines.append(template_title)
            
            merged_content_lines.append(normalized_template_content)

    return "\n\n".join(merged_content_lines).strip()

if __name__ == "__main__":
    import sys
    file_path = sys.argv[1]
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    merged_content = merge_markdown_with_template(content)
    print(merged_content)