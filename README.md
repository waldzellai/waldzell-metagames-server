# Waldzell Metagames MCP Server

A Model Context Protocol (MCP) server providing access to a comprehensive library of game-theoretic workflows and problem-solving frameworks. These metagames help prevent common pitfalls like analysis paralysis, perfectionism spirals, and scope creep while delivering systematic approaches to software development, project management, and operations research challenges.

## Overview

The Waldzell Metagames server exposes 27+ structured problem-solving frameworks organized into 6 main categories, each designed to transform open-ended challenges into systematic, time-boxed workflows with clear decision gates and termination conditions.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/waldzell-metagames-server.git
cd waldzell-metagames-server

# Install dependencies
npm install

# Build the server
npm run build
```

## Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "waldzell-metagames": {
      "command": "node",
      "args": ["/path/to/waldzell-metagames-server/dist/index.js"]
    }
  }
}
```

For Claude Desktop, add to `~/Library/Application Support/Claude/claude_desktop_config.json`.

## Metagame Categories

### 1. Software Development
**Focus:** Code quality, testing, documentation, and architecture

- **Code Quality**
  - `code-review-game`: Game-theoretic code review preventing bikeshedding
  - `refactoring-game`: Systematic refactoring without perfectionism spirals
  
- **Debugging & Testing**
  - `debugging-hypothesis-to-spec-game`: Convert bugs into ranked hypotheses
  - `sandbox-testing-mechanism`: Test code in isolated E2B sandboxes
  
- **Documentation**
  - `docs-improvement-game`: Discover API gaps and ship production docs
  - `docs-verification-game`: Ensure docs match implementation reality
  
- **Architecture**
  - `complexity-navigator`: Break down and manage system complexity

### 2. Product Development
**Focus:** Feature ideation, implementation, and innovation

- **Ideation**
  - `feature-discovery`: Generate diverse implementations avoiding first-idea trap
  - `idea-to-specs-protocol`: Transform ideas into curated specifications
  
- **Implementation**
  - `feature-implementation-game`: Ship capabilities with OR-inspired risk minimization
  
- **Innovation**
  - `virgil-protocol`: Deliberate innovation using Virgil Abloh's 3% Rule

### 3. Project Management
**Focus:** Planning, resource allocation, and execution

- **Planning**
  - `critical-path-quest`: Uncover tasks controlling delivery time
  - `stage-gate-sentinel`: Phased delivery with Stage-Gate/DMAIC principles
  
- **Resource Allocation**
  - `knapsack-sprint`: Rapid allocation using knapsack optimization
  - `queue-triage`: Balance wait times and service utilization
  
- **Execution**
  - `ooda-loop-sprint`: Rapid iteration combining OODA, PDCA, and Lean Startup

### 4. Operations Research
**Focus:** Optimization, constraints, and uncertainty

- **Constraint Analysis**
  - `bottleneck-blitz`: Throughput optimization via Theory of Constraints
  - `shadow-price-showdown`: Constraint valuation using dual analysis
  
- **Multi-Objective**
  - `pareto-pursuit`: Surface trade-offs along Pareto frontier
  
- **Risk & Uncertainty**
  - `monte-carlo-mandate`: Compare strategies via stochastic simulation
  - `sensitivity-sweep`: Stress-test plan assumptions

### 5. MCP Ecosystem
**Focus:** MCP server development and quality assurance

- **Server Development**
  - `mcp-server-implementation-game`: Implement and validate MCP servers end-to-end
  
- **Quality Assurance**
  - `mcp-dogfood`: Execute full dogfooding pass against MCP servers

### 6. Meta-Learning & Frameworks
**Focus:** Learning systems and knowledge extraction

- **Learning Systems**
  - `learning-accelerator`: Optimize how command systems learn over time
  
- **Knowledge Extraction**
  - `wisdom-distillation`: Extract strategic principles from tactical implementations
  
- **Protocols**
  - `ulysses-protocol`: High-stakes debugging preventing endless iteration
  
- **Templates**
  - `metagame-template`: Standard structure for creating new metagames

## API Usage

### List All Metagames

```javascript
// List all available metagames
await mcp.call('listMetagames', {});

// List as hierarchical tree
await mcp.call('listMetagames', { format: 'tree' });
```

### Filter Metagames

```javascript
// Filter by category
await mcp.call('listMetagames', { 
  category: 'software-development' 
});

// Filter by complexity
await mcp.call('listMetagames', { 
  complexity: 'intermediate' 
});

// Filter by subcategory
await mcp.call('listMetagames', { 
  category: 'project-management',
  subcategory: 'planning' 
});
```

### Get Specific Metagame

```javascript
// Get metagame content
await mcp.call('getMetagame', { 
  name: 'refactoring-game' 
});

// Get with metadata
await mcp.call('getMetagame', { 
  name: 'refactoring-game',
  includeMetadata: true 
});
```

### Access via Resources

```javascript
// List all metagame resources
const resources = await mcp.listResources();

// Read specific metagame resource
const content = await mcp.readResource('metagame://refactoring-game');
```

## Example Usage in Claude

```markdown
# Basic usage
Use the refactoring game to improve the src/ directory

# With parameters
Run the code review game on the latest PR with strict time boxing

# Discovery
What metagames can help with technical debt?

# Specific complexity
Show me beginner-level project management metagames
```

## Metagame Structure

Each metagame follows a consistent structure:

1. **Problem Statement**: What challenge it addresses
2. **Phases**: Time-boxed stages with clear objectives
3. **Decision Gates**: Explicit points for go/no-go decisions
4. **Termination Conditions**: When to stop (preventing spirals)
5. **Success Metrics**: How to measure effectiveness
6. **Anti-Patterns**: Common pitfalls to avoid

## Development

### Adding New Metagames

1. Create markdown file in appropriate category folder
2. Add metadata to subcategory's `metadata.json`
3. Follow the metagame template structure
4. Validate against schema: `npm run validate`

### Directory Structure

```
src/resources/metagames/
├── categories.json              # Category definitions
├── metagame-schema.json        # Validation schema
├── 01-software-development/
│   ├── code-quality/
│   │   ├── *.md               # Metagame files
│   │   └── metadata.json      # Subcategory metadata
│   └── ...
└── ...
```

### Building and Testing

```bash
# Build the server
npm run build

# Run tests
npm test

# Validate metagame schemas
npm run validate

# Development mode
npm run dev
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-metagame`)
3. Add metagame following template structure
4. Update metadata.json with metagame details
5. Submit pull request with description of the problem it solves

## Philosophy

These metagames embody principles from:
- **Game Theory**: Nash equilibria, mechanism design, auction theory
- **Operations Research**: Linear programming, queueing theory, optimization
- **Software Engineering**: Agile, DevOps, test-driven development
- **Systems Thinking**: Feedback loops, constraints, emergence

The goal is to transform unbounded problems into systematic workflows that ship results while avoiding common failure modes.

## License

MIT License - See LICENSE file for details

## Acknowledgments

Named after the Glass Bead Game's Waldzell, where formal games explore infinite possibility spaces within structured constraints.

## Support

- Issues: [GitHub Issues](https://github.com/yourusername/waldzell-metagames-server/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/waldzell-metagames-server/discussions)
- Documentation: [Wiki](https://github.com/yourusername/waldzell-metagames-server/wiki)