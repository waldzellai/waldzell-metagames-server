import { z } from 'zod';

export const GetMetagameSchema = z.object({
  name: z.string().min(1).describe("Name of the metagame to retrieve")
});

export const ListMetagamesSchema = z.object({
  category: z.string().optional().describe("Filter by category"),
  subcategory: z.string().optional().describe("Filter by subcategory"),
  complexity: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional().describe("Filter by complexity level"),
  tags: z.array(z.string()).optional().describe("Filter by tags"),
  format: z.enum(['list', 'tree', 'detailed']).optional().default('list').describe("Output format")
});

export interface MetagameMetadata {
  name: string;
  uri: string;
  description: string;
  category?: string;
  subcategory?: string;
  complexity?: string;
  type?: string;
  tags?: string[];
}