import { readFile } from 'fs/promises';
import { join } from 'path';
import { GetMetagameSchema } from '../types.js';

const METAGAMES_PATH = process.cwd() + '/metagames';

export async function getMetagame(args: any) {
  const parsedArgs = GetMetagameSchema.parse(args);
  
  try {
    const filePath = join(METAGAMES_PATH, `${parsedArgs.name}.md`);
    const content = await readFile(filePath, 'utf-8');
    
    return {
      content: [{
        type: 'text',
        text: content
      }]
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw {
        code: -32602,
        message: `Invalid metagame name: ${parsedArgs.name}`
      };
    }
    throw {
      code: -32603,
      message: 'File read error'
    };
  }
}