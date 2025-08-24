import { readFile } from 'fs/promises';
import { join } from 'path';

const METAGAMES_PATH = process.env.WALDZELL_METAGAMES_PATH || './metagames';

const METAGAME_RESOURCES = [
  { name: "ulysses-protocol", uri: "metagame://ulysses-protocol" },
  { name: "refactoring-game", uri: "metagame://refactoring-game" },
  { name: "mcp-server-implementation-game", uri: "metagame://mcp-server-implementation-game" }
];

export async function listResources() {
  return {
    resources: METAGAME_RESOURCES.map(r => ({
      uri: r.uri,
      name: r.name,
      description: `Metagame: ${r.name}`,
      mimeType: "text/markdown"
    }))
  };
}

export async function readResource(uri: string) {
  const metagame = METAGAME_RESOURCES.find(r => r.uri === uri);
  
  if (!metagame) {
    throw new Error(`Resource not found: ${uri}`);
  }

  try {
    const filePath = join(METAGAMES_PATH, `${metagame.name}.md`);
    const content = await readFile(filePath, 'utf-8');
    
    return {
      contents: [{
        uri: uri,
        mimeType: "text/markdown",
        text: content
      }]
    };
  } catch (error) {
    throw new Error(`Failed to read resource: ${uri}`);
  }
}