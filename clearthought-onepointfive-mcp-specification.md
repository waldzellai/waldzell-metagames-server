# Clear Thought 1.5 MCP Server Resource Specification

**Version:** 0.1.5  
**Server Name:** @waldzellai/clear-thought-onepointfive  
**MCP Version:** 1.17.0+  
**Generated:** 2025-08-17  

## Overview

This specification describes how the Clear Thought 1.5 MCP server serves resources to clients. The server provides a unified reasoning tool with 30+ cognitive operations, interactive notebook capabilities, and comprehensive documentation resources.

## Server Architecture

### Transport Modes
- **STDIO Transport**: Direct process communication via stdin/stdout
- **HTTP Transport**: RESTful API via Smithery SDK (stateful sessions)

### Session Management
- **Stateful**: Each client connection maintains session state
- **Session ID**: Auto-generated or client-provided session identifiers
- **Isolation**: Sessions are isolated from each other
- **Persistence**: Optional cross-session persistence via configuration

## Configuration Schema

```typescript
interface ServerConfig {
  // Logging & Debug
  debug: boolean                    // Default: false
  enableMetrics: boolean           // Default: false
  
  // Session Management  
  maxThoughtsPerSession: number    // Default: 100, Range: 1-1000
  sessionTimeout: number           // Default: 3600000ms (1 hour)
  
  // Persistence
  persistenceEnabled: boolean      // Default: false
  persistenceDir: string          // Default: ".ct-data"
  knowledgeGraphFile: string      // Default: "knowledge-graph.json"
  
  // External Integrations
  researchProvider: "none" | "exa" | "serpapi"  // Default: "none"
  researchApiKeyEnv: string       // Environment variable name
  
  // Code Execution
  allowCodeExecution: boolean      // Default: false
  pythonCommand: string           // Default: "python3"
  executionTimeoutMs: number      // Default: 10000, Min: 1000
}
```

## Tool Interface

### Unified Tool: `clear_thought`

The server exposes a single tool that provides access to all reasoning operations:

```typescript
interface ClearThoughtRequest {
  operation: OperationType;        // Required: Operation to perform
  prompt: string;                 // Required: Problem/question/task
  context?: string;               // Optional: Additional context
  sessionId?: string;             // Optional: Session continuity
  parameters?: Record<string, unknown>;  // Operation-specific parameters
  advanced?: {                    // Optional: Advanced options
    autoProgress?: boolean;
    saveToSession?: boolean;      // Default: true
    generateNextSteps?: boolean;  // Default: true
  };
}
```

### Operation Types (30+ Available)

#### Core Thinking Operations
- `sequential_thinking` - Chain-of-thought with pattern selection
- `mental_model` - Apply mental models (first_principles, pareto, etc.)
- `debugging_approach` - Structured debugging methodologies
- `creative_thinking` - Idea generation and exploration
- `visual_reasoning` - Diagram-based reasoning
- `metacognitive_monitoring` - Self-awareness of reasoning process

#### Analysis Operations
- `systems_thinking` - Component relationship analysis
- `causal_analysis` - Causal graph construction and intervention
- `statistical_reasoning` - Bayesian, hypothesis testing, Monte Carlo
- `analogical_reasoning` - Domain mapping and transfer
- `ethical_analysis` - Framework-based ethical evaluation

#### Collaboration Operations  
- `collaborative_reasoning` - Multi-persona discussions
- `decision_framework` - Multi-criteria and expected utility
- `socratic_method` - Question-driven argumentation
- `structured_argumentation` - Formal logical arguments

#### Advanced Operations
- `simulation` - Discrete-time state modeling
- `optimization` - Hill climbing and grid search
- `scientific_method` - Hypothesis-driven inquiry
- `research` - Research intent structuring
- `code_execution` - Python code execution (when enabled)

#### Pattern-Specific Operations
- `tree_of_thought` - Branching exploration
- `beam_search` - Candidate ranking
- `mcts` - Monte Carlo tree search
- `graph_of_thought` - Graph-based reasoning

#### Meta Operations
- `ooda_loop` - Observe-Orient-Decide-Act cycles
- `ulysses_protocol` - High-stakes debugging framework
- `orchestration_suggest` - Tool sequence recommendations

#### Session Operations
- `session_info` - Current session statistics
- `session_export` - Export session data
- `session_import` - Import session data

#### Notebook Operations
- `notebook_create` - Create interactive notebooks
- `notebook_add_cell` - Add cells to notebooks
- `notebook_run_cell` - Execute notebook cells
- `notebook_export` - Export to Srcbook format

### Response Format

All operations return structured JSON responses:

```typescript
interface ClearThoughtResponse {
  toolOperation: string;          // Operation name
  [key: string]: unknown;         // Operation-specific fields
  sessionContext?: {              // Session information
    sessionId: string;
    stats: SessionStats;
    // Additional context...
  };
  initialThought?: any;           // Auto-seeded thinking step (most operations)
}
```

## Resource System

The server provides four categories of resources to clients:

### 1. Guide Resources (guide:// scheme)

Comprehensive documentation resources for understanding and using the server:

| Resource URI | Description | MIME Type |
|--------------|-------------|-----------|
| `guide://clear-thought-operations` | Complete operations documentation | text/markdown |
| `guide://notebook-interaction` | Srcbook notebook usage guide | text/markdown |

**Access Pattern**: Direct URI requests via MCP `resources/read`

### 2. Example Resources (examples:// scheme)

Parameter structure examples for each operation type:

| Resource URI | Description | MIME Type |
|--------------|-------------|-----------|
| `examples://systems-thinking` | Systems analysis parameter examples | text/markdown |
| `examples://decision-framework` | Decision analysis examples | text/markdown |
| `examples://causal-analysis` | Causal graph examples | text/markdown |
| `examples://creative-thinking` | SCAMPER technique examples | text/markdown |
| `examples://scientific-method` | Hypothesis testing examples | text/markdown |
| `examples://simulation` | Discrete-time simulation examples | text/markdown |
| `examples://optimization` | Resource allocation examples | text/markdown |
| `examples://ethical-analysis` | Ethical framework examples | text/markdown |

**Access Pattern**: Direct URI requests with automatic path resolution across multiple directories:
- `dist/resources/examples/` (production)
- `src/resources/examples/` (development)  
- `resources/examples/` (fallback)

### 3. Notebook Resources (notebook:// scheme)

Interactive Srcbook notebooks for educational and execution purposes:

**Static Notebooks**: Discovered from `../srcbook-examples/` directory
- Format: `.src.md` files (Srcbook markdown format)
- Content: TypeScript/JavaScript code cells with documentation
- Execution: Via `notebook_run_cell` operation

**Dynamic Notebooks**: Created via `notebook_create` operation
- Session-bound: Associated with specific client sessions
- Templates: Pre-filled with reasoning pattern presets
- Ephemeral: Stored in memory, not persisted

**Access Pattern**: 
- List via MCP `resources/list`
- Read via URI pattern: `notebook:///{name}`
- Cell access: `notebook:///{name}#cell-{index}`

### 4. Resource Templates

Dynamic resource access patterns for scalable content discovery:

```typescript
interface ResourceTemplate {
  uriTemplate: string;
  name: string;
  title: string;
  description: string;
  mimeType: string;
}
```

**Available Templates**:

| URI Template | Description | Purpose |
|--------------|-------------|---------|
| `notebook:///{name}` | Access notebooks by name | Interactive learning |
| `notebook:///{name}#cell-{index}` | Access specific cells | Granular content access |

**Parameter Resolution**:
- `{name}`: Notebook identifier or filename (without .src.md)
- `{index}`: Zero-based cell index within notebook

## Client Interaction Patterns

### 1. Tool Invocation

```typescript
// Standard operation call
const response = await mcp.callTool("clear_thought", {
  operation: "systems_thinking",
  prompt: "Analyze the healthcare system",
  parameters: {
    components: ["patients", "doctors", "hospitals"],
    relationships: [
      { from: "patients", to: "doctors", type: "dependency" }
    ]
  }
});
```

### 2. Resource Discovery

```typescript
// List available resources
const resources = await mcp.listResources();

// Read specific guide
const guide = await mcp.readResource("guide://clear-thought-operations");

// Access notebook
const notebook = await mcp.readResource("notebook:///typescript-basics");
```

### 3. Session Continuity

```typescript
// Maintain session across calls
const sessionId = "my-analysis-session";

const step1 = await mcp.callTool("clear_thought", {
  operation: "sequential_thinking",
  prompt: "Plan the analysis approach",
  sessionId
});

const step2 = await mcp.callTool("clear_thought", {
  operation: "systems_thinking", 
  prompt: "Apply systems thinking to the problem",
  sessionId
});

// Export session for persistence
const session = await mcp.callTool("clear_thought", {
  operation: "session_export",
  sessionId
});
```

### 4. Interactive Notebook Usage

```typescript
// Create notebook
const notebook = await mcp.callTool("clear_thought", {
  operation: "notebook_create",
  prompt: "Create learning notebook",
  parameters: { pattern: "tree_of_thought" }
});

// Add code cell  
await mcp.callTool("clear_thought", {
  operation: "notebook_add_cell",
  parameters: {
    notebookId: notebook.notebookId,
    cellType: "code",
    source: "console.log('Hello from notebook!');"
  }
});

// Execute cell
const result = await mcp.callTool("clear_thought", {
  operation: "notebook_run_cell", 
  parameters: {
    notebookId: notebook.notebookId,
    cellId: "cell-0"
  }
});
```

## Error Handling

### Tool Errors
- **Invalid Operation**: Unknown operation name returns error with available operations list
- **Parameter Validation**: Zod schema validation with detailed error messages  
- **Resource Not Found**: Clear error messages with attempted paths
- **Code Execution**: Sandboxed execution with timeout and security restrictions

### Resource Errors
- **URI Not Found**: HTTP 404 equivalent with suggested alternatives
- **Access Denied**: When code execution is disabled but requested
- **Template Resolution**: Clear parameter requirement messages

## Security Considerations

### Code Execution
- **Disabled by Default**: `allowCodeExecution: false`
- **Language Restriction**: Python only when enabled
- **Timeout Protection**: Configurable execution timeout
- **Sandboxing**: Process isolation for code execution

### Resource Access
- **Path Traversal Protection**: Restricted to defined resource directories
- **File Type Validation**: Only allowed file extensions (.md, .src.md)
- **Content Filtering**: Safe content serving only

## Performance Characteristics

### Session Management
- **Memory Usage**: Linear with session thought count
- **Timeout Handling**: Automatic session cleanup
- **Concurrency**: Multiple sessions supported

### Resource Serving  
- **Caching**: File-based resources cached in memory
- **Lazy Loading**: Resources loaded on first access
- **Path Resolution**: Efficient multi-directory fallback

### Notebook Execution
- **Ephemeral Storage**: In-memory notebook management
- **Async Execution**: Non-blocking cell execution
- **State Isolation**: Notebook state separation

## Extension Points

### Custom Operations
The server architecture supports adding new operations by:
1. Adding operation name to `ClearThoughtParamsSchema` enum
2. Implementing handler in `executeClearThoughtOperation` 
3. Defining operation-specific types

### Resource Types
New resource schemes can be added by:
1. Registering URI patterns in `ListResourcesRequestSchema` handler
2. Implementing resolution in `ReadResourceRequestSchema` handler
3. Adding resource templates if needed

### Transport Layers
Additional transport methods via MCP SDK:
- WebSocket transport for real-time communication
- TCP transport for network-based clients
- Custom transport implementations

## Usage Examples

### Basic Analysis Workflow
```typescript
// 1. Understand the problem
const decomposition = await mcp.callTool("clear_thought", {
  operation: "sequential_thinking",
  prompt: "Break down this complex business problem",
  parameters: { pattern: "auto" }
});

// 2. Apply appropriate mental model
const framework = await mcp.callTool("clear_thought", {
  operation: "mental_model", 
  prompt: "Apply first principles thinking",
  parameters: { model: "first_principles" }
});

// 3. Perform systems analysis
const systems = await mcp.callTool("clear_thought", {
  operation: "systems_thinking",
  prompt: "Map the business ecosystem"
});
```

### Research and Analysis
```typescript
// Structure research intent
const research = await mcp.callTool("clear_thought", {
  operation: "research",
  prompt: "Investigate market trends in AI"
});

// Perform causal analysis
const causality = await mcp.callTool("clear_thought", {
  operation: "causal_analysis", 
  prompt: "How do economic factors affect AI adoption?",
  parameters: {
    intervention: { variable: "economic_uncertainty", setTo: "high" }
  }
});
```

### Collaborative Decision Making
```typescript
// Multi-persona reasoning
const collaboration = await mcp.callTool("clear_thought", {
  operation: "collaborative_reasoning",
  prompt: "Evaluate this product strategy",
  parameters: {
    personas: [
      { id: "engineer", name: "Senior Engineer", expertise: ["scalability"] },
      { id: "designer", name: "UX Designer", expertise: ["usability"] }
    ]
  }
});

// Decision framework
const decision = await mcp.callTool("clear_thought", {
  operation: "decision_framework",
  prompt: "Choose the best technical approach", 
  parameters: {
    options: [
      { id: "microservices", name: "Microservices Architecture" },
      { id: "monolith", name: "Modular Monolith" }
    ],
    criteria: [
      { name: "scalability", weight: 0.4 },
      { name: "maintainability", weight: 0.6 }
    ],
    analysisType: "multi-criteria"
  }
});
```

## Conclusion

The Clear Thought 1.5 MCP server provides a comprehensive cognitive toolkit through a standardized MCP interface. Its resource system offers documentation, examples, and interactive capabilities that enable clients to effectively leverage advanced reasoning operations.

The server's stateful session management, unified tool interface, and extensible resource system make it suitable for integration into various AI workflows, educational environments, and decision-support systems.

For implementation details, see the source code at `/Users/b.c.nims/waldzell-MASTER/peragus-waldzell-august/clearthought-onepointfive/`.