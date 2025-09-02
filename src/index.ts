import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { getMetagame } from './tools/getMetagame.js';
import { listMetagames } from './tools/listMetagames.js';
import { listResources, readResource } from './resources/metagameResources.js';

const server = new Server({
  name: "waldzell-metagames",
  version: "1.17.0"
}, {
  capabilities: {
    tools: {},
    resources: {}
  }
});

// Register tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "getMetagame",
        description: "Returns the content of a specific metagame document",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the metagame to retrieve"
            }
          },
          required: ["name"]
        }
      },
      {
        name: "listMetagames",
        description: "Lists all available metagames with metadata",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'getMetagame':
      return await getMetagame(args);
    case 'listMetagames':
      return await listMetagames(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Register resources handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return await listResources();
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  return await readResource(uri);
});

// Export for Smithery CLI - it handles the transport
export default function() {
  return server;
}