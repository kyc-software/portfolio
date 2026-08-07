export type Project = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  year: number | string;
  tags: string[];
  cover: {
    src: string;
    fullSrc?: string;
    alt: string;
    width: number;
    height: number;
  };
  liveUrl: string;
  embeddable?: boolean;
  concept?: boolean;
  confidentialityNote?: string;
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
  {
    slug: "pixlr",
    title: "Pixlr",
    summary:
      "Streaming multimodal creation across image, video, audio, design, logo, and slide workflows.",
    role: "Full-stack engineering · Engineering lead",
    year: 2025,
    tags: [
      "React",
      "TypeScript",
      "Next.js",
      "Hono",
      "Python",
      "FastAPI",
      "Prisma",
      "MySQL",
      "Valkey",
      "SSE",
      "AI",
    ],
    cover: {
      src: "/projects/pixlr.webp",
      alt: "Pixlr AI photo editor and image generator interface",
      width: 1600,
      height: 900,
    },
    liveUrl: "https://pixlr.com/",
    embeddable: false,
  },
  {
    slug: "carrefour",
    title: "Carrefour",
    summary:
      "Supported teams delivering software that plans and coordinates item promotions across Carrefour stores.",
    role: "Agile Coach · Consultant",
    year: "2023 2024",
    tags: [],
    cover: {
      src: "/projects/carrefour-promotion-concept.jpg",
      fullSrc: "/projects/carrefour-promotion-concept-full.png",
      alt: "Concept dashboard for managing Carrefour product promotions across stores",
      width: 1672,
      height: 941,
    },
    liveUrl: "https://www.carrefour.com/",
    concept: true,
    confidentialityNote:
      "Concept visual — real internal software cannot be shown due to confidentiality obligations.",
  },
  {
    slug: "ras-interim-zol",
    title: "RAS × ZOL",
    summary:
      "Aligned R.A.S Intérim and ZOL teams delivering software for short-term missions, worker availability, assignments, and time tracking.",
    role: "Agile Coach · Consultant",
    year: "2022 2023",
    tags: [],
    cover: {
      src: "/projects/ras-interim-zol-concept.jpg",
      fullSrc: "/projects/ras-interim-zol-concept-full.png",
      alt: "Concept dashboard for coordinating R.A.S Intérim missions and worker assignments",
      width: 1672,
      height: 941,
    },
    liveUrl: "https://www.ras-interim.fr/",
    concept: true,
    confidentialityNote:
      "Concept visual — real internal software cannot be shown due to confidentiality obligations.",
  },
];
