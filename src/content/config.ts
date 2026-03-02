import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string().or(z.date()).transform((val) => new Date(val)),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    link: z.string().url().optional(),
    github: z.string().url().optional(),
  }),
});

export const collections = {
  'projects': projectsCollection,
};
