export type Project = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  year: number | string;
  tags: string[];
  cover: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  liveUrl?: string;
  embedOrigins?: readonly string[];
  before?: {
    image: `/${string}`;
    mobileImage: `/${string}`;
    alt: string;
    siteUrl: `https://${string}`;
  };
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
  portfolioUrl: string;
  socialLinks: SocialLink[];
};

export const siteConfig: SiteConfig = {
  name: "Anthony Abramo",
  role: "Senior product engineer",
  introduction:
    "I work with you from defining the need through sketches, development, and launch.",
  email: "anthony.abramo.pro@gmail.com",
  portfolioUrl: "https://anthonyabramo.com/",
  socialLinks: [
    { label: "GitHub", href: "https://github.com/kyc-software/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/anthony-abramo/" },
  ],
};

export const projects: Project[] = [
  {
    slug: "profil-plus",
    title: "Profil Plus",
    summary:
      "Designed and built a B2B redesign prototype for Profil Plus. It covers tire selection, quotes, bookings, and fleet management, with a UX walkthrough and a client workshop.",
    role: "Client project · UX/UI design · Full-stack engineering",
    year: 2026,
    tags: [
      "React",
      "TypeScript",
      "TanStack Start",
      "Tailwind CSS",
      "Base UI",
      "Convex",
      "React Flow",
    ],
    cover: {
      src: "/projects/profil-plus.webp",
      alt: "Profil Plus B2B redesign with vehicles for transport, agriculture, and construction",
      width: 1600,
      height: 900,
    },
    liveUrl: "https://profil-plus-concept.vercel.app/",
    embedOrigins: ["https://anthonyabramo.com", "https://www.anthonyabramo.com"],
    before: {
      image: "/projects/profil-plus-before-desktop.webp",
      mobileImage: "/projects/profil-plus-before-mobile.webp",
      alt: "Original Profil Plus homepage, with tire promotions, tire and service search, featured products, loyalty offers, and driving advice.",
      siteUrl: "https://www.profilplus.fr/",
    },
  },
  {
    slug: "bisonflow",
    title: "Bisonflow",
    summary:
      "Project management for teams and AI agents, with shared tasks, roadmaps, timelines, docs, and budgets. Teams can work from the app or connect their AI tools through MCP.",
    role: "Founder · Product design · Full-stack engineering",
    year: 2026,
    tags: [
      "React",
      "TypeScript",
      "TanStack Start",
      "Tailwind CSS",
      "Convex",
      "Clerk",
      "Stripe",
      "Tiptap",
      "OpenAI",
      "MCP",
    ],
    cover: {
      src: "/projects/bisonflow-2026-11.webp",
      alt: "Bisonflow homepage with a preview of the workspace dashboard",
      width: 1600,
      height: 900,
    },
    liveUrl: "https://bisonflow.com/",
  },
  {
    slug: "bragi-notes",
    title: "Bragi Notes",
    summary: "Collaborative, local-first notes built for fast, structured thinking.",
    role: "Product design · Full-stack engineering",
    year: 2026,
    tags: [
      "React",
      "TypeScript",
      "TanStack Start",
      "Tailwind",
      "Convex",
      "TipTap",
      "AI",
      "OpenAI",
    ],
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
    tags: ["React", "TypeScript", "Tailwind", "Convex", "Clerk", "AI", "OpenAI", "Zod"],
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
      "Tailwind",
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
    liveUrl: "https://www.loany.fr/",
    embedOrigins: ["https://anthonyabramo.com"],
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
      "Tailwind",
      "Hono",
      "Python",
      "FastAPI",
      "Prisma",
      "MySQL",
      "AI",
      "ElevenLabs",
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
    year: "2024 2023",
    tags: [],
    cover: {
      src: "/projects/carrefour-concept.webp",
      alt: "Concept dashboard for managing Carrefour product promotions across stores",
      width: 1248,
      height: 720,
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
    year: "2023 2022",
    tags: [],
    cover: {
      src: "/projects/ras-interim-zol-concept.webp",
      alt: "Concept dashboard for coordinating R.A.S Intérim missions and worker assignments",
      width: 1248,
      height: 720,
    },
    liveUrl: "https://www.ras-interim.fr/",
    concept: true,
    confidentialityNote:
      "Concept visual — real internal software cannot be shown due to confidentiality obligations.",
  },
  {
    slug: "vivlio",
    title: "Vivlio",
    summary:
      "Coached three teams delivering Vivlio’s digital reading ecosystem across web, mobile, and e-readers.",
    role: "Scrum Master",
    year: "2022 2021",
    tags: ["React", "TypeScript", "React Native", "Tailwind", "Storybook"],
    cover: {
      src: "/projects/vivlio.webp",
      alt: "Vivlio digital reading website featuring a reader using an e-reader",
      width: 1600,
      height: 900,
    },
    liveUrl: "https://www.vivlio.com/en/",
    embeddable: false,
  },
  {
    slug: "thales",
    title: "Thales",
    summary:
      "Built and supported airspace defence software while helping the engineering team adopt Scrum delivery practices.",
    role: "Software Engineer · Scrum Master",
    year: "2021 2019",
    tags: [],
    cover: {
      src: "/projects/thales-concept.webp",
      alt: "Concept airspace defence interface with alerts, communications, aircraft tracks, and contextual details",
      width: 1248,
      height: 720,
    },
    liveUrl: "https://www.thalesgroup.com/en",
    concept: true,
    confidentialityNote:
      "Concept visual — real internal software cannot be shown due to confidentiality obligations.",
  },
  {
    slug: "university-of-kent",
    title: "Thesis",
    summary:
      "Worked on a three-person research project translating sign language in real time through wireless haptic gloves.",
    role: "University of Kent · Developer",
    year: 2018,
    tags: ["React", "Python", "Haptic Gloves", "Sign Language"],
    cover: {
      src: "/projects/thesis-concept.webp",
      alt: "Interactive concept showing wireless haptic gloves beside calibration and sign-language recognition software",
      width: 1248,
      height: 720,
    },
    concept: true,
  },
];
