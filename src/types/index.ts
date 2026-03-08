export interface Project {
  slug: string;
  title: string;
  summary: string;
  coverImage: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
}

export interface TechItem {
  id: string;
  name: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string; // usually an icon name or component
}

export interface NavItem {
  title: string;
  path: string;
}
