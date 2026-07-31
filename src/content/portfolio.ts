export type Project = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  year: number;
  tags: string[];
  cover: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  liveUrl: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type SiteConfig = {
  name: string;
  role: string;
  introduction: string;
  email: string;
  socialLinks: SocialLink[];
};

export const siteConfig: SiteConfig = {
  name: "Anthony Abramo",
  role: "Senior product engineer",
  introduction:
    "I work with you from defining the need through sketches, development, and launch.",
  email: "anthony.abramo.pro@gmail.com",
  socialLinks: [
    { label: "GitHub", href: "https://github.com/kyc-software/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/anthony-abramo/" },
  ],
};

export const projects: Project[] = [
  {
    slug: "bragi-notes",
    title: "Bragi Notes",
    summary: "Collaborative, local-first notes built for fast, structured thinking.",
    role: "Product design · Full-stack engineering",
    year: 2026,
    tags: ["React", "TypeScript", "TanStack Start", "Convex", "TipTap", "AI", "OpenAI"],
    cover: {
      src: "/projects/bragi-notes.webp",
      alt: "Bragi Notes collaborative editor interface",
      width: 1600,
      height: 900,
    },
    liveUrl: "https://bragi-notes.vercel.app/",
  },
  {
    slug: "tingshuo",
    title: "Tingshuo",
    summary: "A focused Mandarin product that turns everyday discoveries into learning.",
    role: "Product design · Full-stack engineering",
    year: 2026,
    tags: ["React", "TypeScript", "Convex", "Clerk", "AI", "OpenAI", "Zod"],
    cover: {
      src: "/projects/tingshuo.webp",
      alt: "Tingshuo Mandarin learning application",
      width: 1600,
      height: 900,
    },
    liveUrl: "https://tingshuo.vercel.app",
  },
  {
    slug: "loany",
    title: "Loany",
    summary: "Nine financial simulators that turn life goals into clear next steps.",
    role: "Product design · Full-stack engineering",
    year: 2026,
    tags: [
      "React",
      "TypeScript",
      "TanStack Start",
      "Convex",
      "Financial modelling",
      "AI",
      "Zod",
    ],
    cover: {
      src: "/projects/loany.webp",
      alt: "Loany financial simulator landing interface",
      width: 1600,
      height: 900,
    },
    liveUrl: "https://loany-simulateur.vercel.app",
  },
  {
    slug: "bisonflow",
    title: "Bisonflow",
    summary: "Voice-first project operations built to keep teams moving.",
    role: "Founder · Product design · Full-stack engineering",
    year: 2026,
    tags: [
      "React",
      "TypeScript",
      "Next.js",
      "Convex",
      "TipTap",
      "AI",
      "OpenAI",
      "ElevenLabs",
      "Prisma",
      "Realtime",
      "Zod",
    ],
    cover: {
      src: "/projects/bisonflow.webp",
      alt: "Bisonflow voice-first project operations website",
      width: 1600,
      height: 900,
    },
    liveUrl: "https://bisonflow.com/en",
  },
];
