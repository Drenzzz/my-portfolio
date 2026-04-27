import { glob } from "astro/loaders"
import { defineCollection, z } from "astro:content"

const projectsCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/projects",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    tags: z.array(z.string()).default([]),
    link: z.string().url().optional(),
    github: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number().int().positive().default(999),
  }),
})

export const collections = {
  projects: projectsCollection,
}
