import { readdir, readFile } from 'fs/promises';
import { basename, extname, join } from 'path';
import { ListMetagamesSchema, MetagameMetadata } from '../types.js';

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

async function discoverMetagames(category?: string, subcategory?: string, complexity?: string): Promise<MetagameMetadata[]> {
  const metagames: MetagameMetadata[] = [];
  
  async function scanDirectory(dir: string, prefix: string = ''): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subPath = join(dir, entry.name);
        const newPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
        
        if (category && !entry.name.includes(category)) continue;
        
        await scanDirectory(subPath, newPrefix);
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.md') {
        const name = basename(entry.name, '.md');
        const fullPath = prefix ? `${prefix}/${name}` : name;
        
        const metadataPath = join(dir, 'metadata.json');
        let metadata: any = {};
        try {
          const metadataContent = await readFile(metadataPath, 'utf-8');
          const parsed = JSON.parse(metadataContent);
          metadata = parsed.metagames?.find((m: any) => m.id === name) || {};
        } catch {}
        
        if (complexity && metadata.complexity !== complexity) continue;
        if (subcategory && !prefix.includes(subcategory)) continue;
        
        metagames.push({
          name,
          uri: `metagame://${fullPath}`,
          description: metadata.displayName || DESCRIPTIONS[name] || `Metagame workflow: ${name}`,
          category: prefix.split('/')[0],
          subcategory: prefix.split('/')[1],
          complexity: metadata.complexity,
          type: metadata.type,
          tags: metadata.tags
        });
      }
    }
  }
  
  await scanDirectory(METAGAMES_PATH);
  return metagames;
}

export async function listMetagames(args: any) {
  const params = ListMetagamesSchema.parse(args);
  const metagames = await discoverMetagames(
    params.category,
    params.subcategory,
    params.complexity
  );
  
  let output = metagames;
  if (params.format === 'tree') {
    const tree: any = {};
    for (const mg of metagames) {
      const cat = mg.category || 'uncategorized';
      const subcat = mg.subcategory || 'general';
      if (!tree[cat]) tree[cat] = {};
      if (!tree[cat][subcat]) tree[cat][subcat] = [];
      tree[cat][subcat].push(mg.name);
    }
    output = tree;
  }
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(output, null, 2)
    }]
  };
}