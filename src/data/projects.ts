import type { Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "just-weather",
    title: "Just Weather",
    summary: "A minimal weather dashboard with neobrutalism design, real-time data, and responsive UI.",
    coverImage: "/projects/just-weather.png",
    tags: ["React", "Astro", "Tailwind", "API"],
    githubUrl: "https://github.com/drenzzz",
    liveUrl: "https://drenzzz.dev",
    featured: true,
  },
  {
    slug: "minecraft-manager",
    title: "Minecraft Manager",
    summary: "Server manager dashboard for Minecraft networks with real-time monitoring and admin controls.",
    coverImage: "/projects/minecraft-manager.png",
    tags: ["Go", "React", "WebSocket"],
    githubUrl: "https://github.com/drenzzz",
    featured: true,
  },
  {
    slug: "drenzzz-portfolio",
    title: "Portfolio v2",
    summary: "This very portfolio — rebuilt from Next.js to Astro with neobrutalism design system.",
    coverImage: "/projects/portfolio-v2.png",
    tags: ["Astro", "React", "RetroUI", "Tailwind"],
    githubUrl: "https://github.com/drenzzz",
    liveUrl: "https://drenzzz.dev",
    featured: true,
  },
];

