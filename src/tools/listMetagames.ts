import { readdir } from 'fs/promises';
import { basename, extname, join } from 'path';
import { ListMetagamesSchema, MetagameMetadata } from '../types.js';

const METAGAMES_PATH = process.env.WALDZELL_METAGAMES_PATH ?? join(process.cwd(), 'metagames');

async function discoverMetagames(): Promise<MetagameMetadata[]> {
  const entries = await readdir(METAGAMES_PATH, { withFileTypes: true });
  const metagames: MetagameMetadata[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (extname(entry.name).toLowerCase() !== '.md') continue;
    const name = basename(entry.name, '.md');
    metagames.push({
      name,
      uri: `metagame://${name}`,
      description: `Metagame: ${name}`
    });
  }
  return metagames;
}

export async function listMetagames(args: any) {
  ListMetagamesSchema.parse(args);
  const metagames = await discoverMetagames();
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(metagames, null, 2)
    }]
  };
}