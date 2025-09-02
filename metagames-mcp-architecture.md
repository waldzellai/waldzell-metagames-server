# Waldzell Metagames MCP Server - Architecture Specification

## Current State

The MCP server currently serves metagames through two mechanisms:
1. **Resources**: Dynamic discovery and serving of .md files from `/metagames/` directory
2. **Tools**: Hardcoded enum-based access to specific metagames

## Post-Implementation Architecture

### Overview

After implementation, the `/src/` folder will have an enhanced structure that dynamically serves ALL metagames from both `/metagames/` and `/.claude/commands/games/` as MCP resources, following the pattern established in `.claude/commands/`.

### Directory Structure

```
src/
├── index.ts                      # Enhanced with dynamic discovery
├── types.ts                      # Extended type definitions
├── resources/
│   ├── metagameResources.ts      # Enhanced resource provider
│   └── commandResources.ts       # NEW: Serves .claude/commands as resources
├── tools/
│   ├── getMetagame.ts            # Enhanced to access all sources
│   ├── listMetagames.ts          # Enhanced with categorization
│   └── executeMetagame.ts        # NEW: Execute metagames as prompts
└── utils/
    ├── discovery.ts              # NEW: Unified discovery logic
    └── parser.ts                 # NEW: Markdown parsing utilities
```

### Implementation Patterns

#### Pattern 1: Unified Resource Discovery

**File: `src/utils/discovery.ts`**
```typescript
interface MetagameSource {
  path: string;
  prefix: string;
  category: string;
}

const METAGAME_SOURCES: MetagameSource[] = [
  {
    path: join(process.cwd(), 'metagames'),
    prefix: 'metagame',
    category: 'core'
  },
  {
    path: join(process.cwd(), '.claude/commands/games'),
    prefix: 'command-game',
    category: 'command'
  },
  {
    path: join(process.cwd(), '.claude/commands/glassbead-protocols'),
    prefix: 'protocol',
    category: 'protocol'
  }
];

export async function discoverAllMetagames(): Promise<MetagameMetadata[]> {
  // Recursively discover all .md files from all sources
  // Return unified list with proper URIs and metadata
}
```

#### Pattern 2: Enhanced Resource Provider

**File: `src/resources/metagameResources.ts`**
```typescript
export async function listResources() {
  const metagames = await discoverAllMetagames();
  
  return {
    resources: metagames.map(game => ({
      uri: `${game.category}://${game.name}`,
      name: game.name,
      description: game.description || extractDescription(game.content),
      mimeType: "text/markdown",
      metadata: {
        category: game.category,
        phases: game.phases,
        arguments: game.arguments,
        usage: game.usage
      }
    }))
  };
}
```

#### Pattern 3: Metagame Execution Tool

**File: `src/tools/executeMetagame.ts`**
```typescript
interface ExecuteMetagameArgs {
  name: string;
  arguments?: Record<string, any>;
  mode?: 'prompt' | 'structured' | 'interactive';
}

export async function executeMetagame(args: ExecuteMetagameArgs) {
  const metagame = await loadMetagame(args.name);
  
  switch (args.mode) {
    case 'prompt':
      // Return formatted prompt for LLM consumption
      return formatAsPrompt(metagame, args.arguments);
      
    case 'structured':
      // Return structured phases and decision points
      return parseStructure(metagame);
      
    case 'interactive':
      // Return step-by-step guidance
      return createInteractiveFlow(metagame, args.arguments);
  }
}
```

### Resource URI Schemes

```
metagame://ulysses-protocol          # Core metagames from /metagames/
command-game://refactoring-game      # Command games from /.claude/commands/games/
protocol://idea-to-specs-protocol    # Protocols from /.claude/commands/glassbead-protocols/
workflow://mcp-workflow              # Workflows from /.claude/commands/workflows/
```

### Metadata Extraction

Each metagame resource will include extracted metadata:

```typescript
interface MetagameMetadata {
  name: string;
  uri: string;
  category: 'core' | 'command' | 'protocol' | 'workflow';
  description: string;
  usage?: string;
  arguments?: ArgumentDefinition[];
  phases?: PhaseDefinition[];
  antiPatterns?: string[];
  integrations?: string[];
  examples?: Example[];
}
```

### Tool Enhancements

#### Enhanced `listMetagames` Tool

```typescript
{
  name: "listMetagames",
  description: "Lists all available metagames with filtering and metadata",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: ["all", "core", "command", "protocol", "workflow"],
        description: "Filter by category"
      },
      includeMetadata: {
        type: "boolean",
        description: "Include full metadata in response"
      },
      search: {
        type: "string",
        description: "Search term to filter metagames"
      }
    }
  }
}
```

#### New `executeMetagame` Tool

```typescript
{
  name: "executeMetagame",
  description: "Execute a metagame as a structured prompt or interactive flow",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name or URI of the metagame to execute"
      },
      mode: {
        type: "string",
        enum: ["prompt", "structured", "interactive"],
        description: "Execution mode"
      },
      arguments: {
        type: "object",
        description: "Arguments to pass to the metagame"
      }
    },
    required: ["name"]
  }
}
```

### Integration with Claude Commands

The implementation will recognize and serve `.claude/commands/` content, enabling:

1. **Direct Resource Access**: `metagame://feature-implementation-game`
2. **Command Execution**: Execute as structured prompts
3. **Workflow Composition**: Chain multiple metagames
4. **Context Preservation**: Maintain state across phases

### Dynamic Loading Benefits

1. **No Hardcoding**: Automatically discovers new metagames
2. **Multiple Sources**: Unified access to all game locations
3. **Extensibility**: Easy to add new source directories
4. **Metadata Rich**: Automatic extraction of structure and usage
5. **Version Agnostic**: Works with any metagame format

### Implementation Phases

**Phase 1: Discovery Engine**
- Implement `src/utils/discovery.ts`
- Support recursive directory scanning
- Extract metadata from markdown headers

**Phase 2: Resource Enhancement**
- Extend `metagameResources.ts`
- Add `commandResources.ts`
- Implement URI routing

**Phase 3: Execution Tools**
- Create `executeMetagame.ts`
- Add prompt formatting
- Implement structured parsing

**Phase 4: Integration**
- Update `index.ts` with new handlers
- Add comprehensive typing
- Implement caching layer

### Backwards Compatibility

- Existing `getMetagame` tool continues working
- Resource URIs remain stable
- New features are additive only

### Performance Considerations

1. **Caching**: Cache discovered metagames on startup
2. **Lazy Loading**: Load content only when requested
3. **Indexing**: Build metadata index for fast search
4. **Watch Mode**: Auto-reload on file changes (development)

### Testing Strategy

```typescript
// Test discovery across all sources
test('discovers metagames from all configured paths');

// Test resource serving
test('serves metagames as MCP resources with proper URIs');

// Test execution modes
test('executes metagame as prompt format');
test('parses metagame structure correctly');

// Test metadata extraction
test('extracts phases, arguments, and usage from markdown');
```

## Summary

This architecture transforms the MCP server from a static, enum-based system to a dynamic, discovery-based platform that:

1. **Automatically discovers** all metagames from multiple sources
2. **Serves them as resources** with rich metadata
3. **Enables execution** through multiple modes
4. **Maintains compatibility** while adding new capabilities
5. **Follows established patterns** from `.claude/commands/`

The implementation preserves the simplicity of resource access while adding powerful new capabilities for metagame execution and composition.