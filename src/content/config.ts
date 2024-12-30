import { defineCollection, z } from 'astro:content';

const profiles = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    permalink: z.string(),
    bio: z.string(),
  }),
});

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    permalink: z.string(),
    profile: z.string(),
    publishDate: z.date(),
  }),
});

export const collections = {
  profiles,
  posts,
};
