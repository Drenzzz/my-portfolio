import type { Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "just-weather",
    title: "Just Weather",
    summary: "A minimal weather dashboard with neobrutalism design.",
    coverImage: "/projects/just-weather.png", // Ensure you have this cover fallback
    tags: ["React", "Astro", "Tailwind"],
    githubUrl: "https://github.com/drenzzz",
    liveUrl: "https://drenzzz.dev",
    featured: true,
  },
  {
    slug: "minecraft-manager",
    title: "Minecraft Manager",
    summary: "Server manager dashboard for Minecraft networks.",
    coverImage: "/projects/minecraft-manager.png",
    tags: ["Go", "React"],
    githubUrl: "https://github.com/drenzzz",
    featured: true,
  }
];
