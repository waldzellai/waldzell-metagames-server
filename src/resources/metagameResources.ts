import { readFile, access } from 'fs/promises';
import { join } from 'path';
import { scanDirectory } from '../utils/scanDirectory.js';

const METAGAMES_PATH = process.env.WALDZELL_METAGAMES_PATH ?? join(process.cwd(), 'src/resources/metagames');

const DESCRIPTIONS: Record<string, string> = {
  'bottleneck-blitz': 'Throughput optimization game based on the Theory of Constraints',
  'code-review-game': 'Game-theoretic code review protocol that prevents bikeshedding and analysis paralysis',
  'complexity-navigator': 'Systematic approach to breaking down and managing complexity in large systems',
  'critical-path-quest': 'Schedule-driven project planning game for uncovering tasks that control delivery time',
  'debugging-hypothesis-to-spec-game': 'Game-theoretic debugging workflow converting problems into ranked hypotheses and specs',
  'docs-improvement-game': 'Game-theoretic documentation workflow that discovers API gaps and ships production-ready docs',
  'docs-verification-game': 'Game-theoretic documentation verification ensuring docs match implementation reality',
  'feature-discovery': 'Generate diverse feature implementations using game theory to escape first-idea trap',
  'feature-implementation-game': 'Ship new product capabilities with OR-inspired protocol minimizing risk',
  'idea-to-specs-protocol': 'Transform ideas into curated specifications with time-boxed phases and decision gates',
  'knapsack-sprint': 'Rapid resource allocation game using simplified knapsack optimization',
  'learning-accelerator': 'Meta-learning framework that optimizes how the command system learns over time',
  'mcp-dogfood': 'Enumerate, plan, and execute full dogfooding pass against MCP servers',
  'mcp-server-implementation-game': 'Implement and validate new MCP server end-to-end with instrumentation',
  'metagame-template': 'Template for creating new metagames with standard structure and phases',
  'monte-carlo-mandate': 'Uncertainty exploration game comparing strategies via stochastic simulation',
  'ooda-loop-sprint': 'Rapid iteration workflow combining OODA, PDCA and Lean Startup Build-Measure-Learn',
  'pareto-pursuit': 'Multi-objective optimization game surfacing trade-offs along Pareto frontier',
  'queue-triage': 'Queue management game for balancing wait times and service utilization',
  'refactoring-game': 'Game-theoretic refactoring protocol preventing perfectionism spirals',
  'sandbox-testing-mechanism': 'Test newly generated code inside E2B sandbox by building plausible applications',
  'sensitivity-sweep': 'Parameter robustness game for stress-testing plan assumptions',
  'shadow-price-showdown': 'Constraint valuation game using dual analysis from linear programming',
  'stage-gate-sentinel': 'Phased delivery workflow blending Stage-Gate, DMAIC and Double Diamond principles',
  'ulysses-protocol': 'High-stakes debugging framework preventing endless iteration through systematic phases',
  'virgil-protocol': 'Deliberate innovation framework based on Virgil Abloh 3% Rule - change only what must change',
  'wisdom-distillation': 'Extract strategic principles from tactical implementations through systematic synthesis'
};

export async function listResources() {
  const scanResults = await scanDirectory(METAGAMES_PATH);
  const resources = scanResults.map(result => ({
    uri: `metagame://${result.fullPath}`,
    name: result.name,
    description: DESCRIPTIONS[result.name] || `Metagame workflow: ${result.name}`,
    mimeType: "text/markdown"
  }));
  return { resources };
}

export async function readResource(uri: string) {
  if (!uri.startsWith('metagame://')) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }
  const path = uri.slice('metagame://'.length);
  
  try {
    // Try direct path first (handles nested structure)
    let filePath = join(METAGAMES_PATH, `${path}.md`);
    
    // Check if file exists
    try {
      await access(filePath);
    } catch {
      // If not found, might be a flat name - scan to find it
      const scanResults = await scanDirectory(METAGAMES_PATH);
      const match = scanResults.find(r => r.name === path || r.fullPath === path);
      if (match) {
        filePath = join(METAGAMES_PATH, `${match.fullPath}.md`);
      }
    }
    
    const content = await readFile(filePath, 'utf-8');
    return {
      contents: [{
        uri,
        mimeType: "text/markdown",
        text: content
      }]
    };
  } catch (error) {
    throw new Error(`Failed to read resource: ${uri}`);
  }
}
