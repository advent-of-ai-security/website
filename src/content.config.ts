import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const doors = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/doors' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    meta: z.array(z.string()).optional(),
  }),
});

const doors2026 = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: '../content/2026' }),
  schema: z.object({
    description: z.string().optional(),
  }),
});

export const collections = { doors, doors2026 };
