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
      "Tailwind",
      "Convex",
      "TipTap",
      "AI",
      "OpenAI",
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
    year: "2023 2022",
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
      src: "/projects/thales-airspace-concept.jpg",
      fullSrc: "/projects/thales-airspace-concept-full.png",
      alt: "Concept airspace defence interface with alerts, communications, aircraft tracks, and contextual details",
      width: 1672,
      height: 941,
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
      src: "/projects/university-of-kent-haptic-gloves.webp",
      alt: "Concept visual showing wireless haptic gloves beside calibration and sign-language recognition software",
      width: 1600,
      height: 900,
    },
    liveUrl: "https://www.youtube.com/watch?v=LHGellNWDiQ",
    embeddable: false,
  },
];
