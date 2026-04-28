export interface UseItem {
  name: string
  description: string
  link?: string
  badge?: string
}

export interface UseCategory {
  category: string
  description: string
  items: UseItem[]
}

export const uses: UseCategory[] = [
  {
    category: "Hardware",
    description:
      "Main physical devices for development, Android testing, and daily work.",
    items: [
      {
        name: "Acer Nitro V16",
        description:
          "Main development laptop with Intel Core i5-14450HX, RTX 4050, 16GB DDR5 RAM, and 1.5TB NVMe SSD.",
        link: "https://store.acer.com/en-id/nitro-v-16-anv16-71-nh-qtnsn-002",
      },
      {
        name: "Xiaomi POCO F6",
        description:
          "Daily driver and primary Android test device for customization, ROM, and kernel-related workflows.",
        link: "https://www.po.co/global/product/poco-f6/",
      },
      {
        name: "Fantech Crypto II Wireless WG7V2",
        description:
          "Budget wireless mouse with a precise sensor and low-latency feel for daily use.",
        link: "https://fantechworld.com",
      },
      {
        name: "Gamesir Nova 2 Lite",
        description:
          "Wireless gamepad for casual gaming, controller testing, and device pairing workflows.",
        link: "https://www.gamesir.hk/products/gamesir-nova-lite",
      },
      {
        name: "dbE GM210 7.1",
        description:
          "Virtual surround headset with clear microphone quality for calls, Discord, and focused sessions.",
        link: "https://dbe-id.com/products/dbe-gm210-7-1-virtual-surround-gaming-headphone-bass-headset",
      },
      {
        name: "Logitech C270/C720",
        description:
          "Reliable webcam for meetings, quick recording, and lightweight streaming needs.",
        link: "https://www.logitech.com/id-id/shop/p/c270-hd-webcam",
      },
      {
        name: "MEMO FL08",
        description:
          "External cooling fan used to keep laptop temperatures stable during heavy builds and gaming.",
      },
    ],
  },
  {
    category: "Operating System & Shell",
    description:
      "Daily operating systems and shell environment for local development.",
    items: [
      {
        name: "EndeavourOS",
        description:
          "Primary Linux distribution for daily desktop workflow and development.",
        link: "https://endeavouros.com/",
      },
      {
        name: "WSL2 Ubuntu",
        description:
          "Linux environment inside Windows for backend work, CLI tooling, and Android kernel builds.",
        link: "https://ubuntu.com/wsl",
      },
      {
        name: "Bash",
        description:
          "Daily shell for terminal workflows, scripts, and development commands.",
        link: "https://www.gnu.org/software/bash/",
      },
    ],
  },
  {
    category: "Development Environment",
    description: "Editors, IDEs, and core tooling used to build projects.",
    items: [
      {
        name: "VS Code",
        description:
          "Main editor for web development, scripting, documentation, and quick project work.",
        link: "https://code.visualstudio.com/",
      },
      {
        name: "Android Studio",
        description:
          "Primary IDE for Android native development, emulator workflows, and device debugging.",
        link: "https://developer.android.com/studio",
      },
      {
        name: "Git",
        description:
          "Version control tool for project history, collaboration, branching, and release workflows.",
        link: "https://git-scm.com/",
      },
      {
        name: "Docker",
        description:
          "Container tooling for local services, isolated environments, and backend experiments.",
        link: "https://www.docker.com/",
      },
    ],
  },
  {
    category: "Apps & Workflow",
    description:
      "Supporting apps for design, communication, recording, virtualization, and Android tooling.",
    items: [
      {
        name: "Figma",
        description:
          "Design tool for UI exploration, wireframes, and visual references before implementation.",
        link: "https://www.figma.com/",
      },
      {
        name: "Discord",
        description:
          "Community, team communication, and virtual hangout app for daily coordination.",
        link: "https://discord.com/",
      },
      {
        name: "OBS Studio",
        description:
          "Recording and streaming software for screen capture, demos, and technical content.",
        link: "https://obsproject.com/",
      },
      {
        name: "VirtualBox",
        description:
          "Virtualization app for testing operating systems and isolated development environments.",
        link: "https://www.virtualbox.org/",
      },
      {
        name: "ADBKit",
        description:
          "A desktop Android management tool I built to simplify ADB and Fastboot workflows through a GUI.",
        link: "/project/adb-kit",
        badge: "Built by me",
      },
    ],
  },
  {
    category: "Services & Infrastructure",
    description:
      "Deployment, domain, and hosting platforms used for personal projects.",
    items: [
      {
        name: "Vercel",
        description:
          "Primary deployment platform for portfolio, frontend, and serverless web projects.",
        link: "https://vercel.com/",
      },
      {
        name: "Cloudflare",
        description:
          "DNS, domain management, and edge services for personal domains and deployments.",
        link: "https://www.cloudflare.com/",
      },
      {
        name: "Netlify",
        description:
          "Static hosting and deployment platform used for quick frontend experiments.",
        link: "https://www.netlify.com/",
      },
    ],
  },
]
