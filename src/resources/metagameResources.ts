import { readdir, readFile } from 'fs/promises';
import { basename, extname, join } from 'path';

const METAGAMES_PATH = process.env.WALDZELL_METAGAMES_PATH ?? join(process.cwd(), 'metagames');

export async function listResources() {
  const entries = await readdir(METAGAMES_PATH, { withFileTypes: true });
  const resources = entries
    .filter(e => e.isFile() && extname(e.name).toLowerCase() === '.md')
    .map(e => {
      const name = basename(e.name, '.md');
      return {
        uri: `metagame://${name}`,
        name,
        description: `Metagame: ${name}`,
        mimeType: "text/markdown"
      };
    });
  return { resources };
}

export async function readResource(uri: string) {
  if (!uri.startsWith('metagame://')) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }
  const name = uri.slice('metagame://'.length);
  try {
    const filePath = join(METAGAMES_PATH, `${name}.md`);
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