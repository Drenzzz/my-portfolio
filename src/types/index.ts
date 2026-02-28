export interface Project {
  slug: string;
  title: string;
  summary: string;
  description?: string;
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
  icon: string;
}

export interface NavItem {
  title: string;
  path: string;
}

export interface Activity {
  name: string;
  type: number;
  state?: string;
  details?: string;
  application_id?: string;
  sync_id?: string;
  timestamps?: { start?: number; end?: number };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

export interface SpotifyData {
  track_id: string;
  song: string;
  artist: string;
  album_art_url: string;
  album: string;
  timestamps: { start: number; end: number } | null;
}

export interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
  };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: Activity[];
  spotify: SpotifyData | null;
  active_on_discord_mobile: boolean;
  active_on_discord_desktop: boolean;
  active_on_discord_web: boolean;
}

export interface GithubStats {
  stars: number;
  commits: number;
  prs: number;
  issues: number;
  topLanguages: { name: string; color: string; percentage: number }[];
}

