import { defineCollection, z } from 'astro:content';

const doors = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date().optional(),
    meta: z.array(z.string()).optional(),
  }),
});

export const collections = { doors };
