import { z } from 'zod';

export const MetagameName = z.enum([
  "ulysses-protocol",
  "refactoring-game", 
  "mcp-server-implementation-game"
]);

export const GetMetagameSchema = z.object({
  name: MetagameName.describe("Name of the metagame to retrieve")
});

export const ListMetagamesSchema = z.object({});

export type MetagameName = z.infer<typeof MetagameName>;

export interface MetagameMetadata {
  name: string;
  uri: string;
  description: string;
}