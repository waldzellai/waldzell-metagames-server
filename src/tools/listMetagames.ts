import { ListMetagamesSchema, MetagameMetadata } from '../types.js';

const METAGAMES: MetagameMetadata[] = [
  {
    name: "ulysses-protocol",
    uri: "metagame://ulysses-protocol",
    description: "High-stakes debugging and problem-solving framework"
  },
  {
    name: "refactoring-game",
    uri: "metagame://refactoring-game",
    description: "Game-theoretic refactoring under budget constraints"
  },
  {
    name: "mcp-server-implementation-game",
    uri: "metagame://mcp-server-implementation-game",
    description: "End-to-end MCP server implementation"
  }
];

export async function listMetagames(args: any) {
  ListMetagamesSchema.parse(args);
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(METAGAMES, null, 2)
    }]
  };
}