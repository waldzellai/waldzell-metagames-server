import { z } from 'zod';

export const GetMetagameSchema = z.object({
  name: z.string().min(1).describe("Name of the metagame to retrieve")
});

export const ListMetagamesSchema = z.object({});

export interface MetagameMetadata {
  name: string;
  uri: string;
  description: string;
}