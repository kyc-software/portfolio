import {
  INITIAL_GREETING,
  normalizeAssistantQuestion,
  WHO_ARE_YOU_ALIASES,
  WHO_ARE_YOU_ANSWER,
} from "../src/lib/assistant-copy";

export const FAQ_CATALOG_VERSION = "2026-08-04-50-v3";

type PreparedFaq = {
  key: string;
  question: string;
  answer: string;
  aliases?: readonly string[];
  intent: string;
  matchSignals: readonly string[];
};

function prepared({ aliases = [], ...faq }: PreparedFaq): Omit<PreparedFaq, "aliases"> & {
  aliases: string[];
  matchSignals: string[];
} {
  return {
    ...faq,
    aliases: [
      ...new Set(
        [faq.question, ...aliases].map(normalizeAssistantQuestion).filter(Boolean),
      ),
    ],
    matchSignals: faq.matchSignals.map(normalizeAssistantQuestion),
  };
}

export const SEEDED_FAQS = [
  {
    key: "greeting",
    question: "",
    answer: INITIAL_GREETING,
    aliases: [] as string[],
    intent: "",
    matchSignals: [] as string[],
  },
  prepared({
    key: "who-are-you",
    question: "Who are you?",
    answer: WHO_ARE_YOU_ANSWER,
    aliases: WHO_ARE_YOU_ALIASES,
    intent: "The AI assistant identifies itself and explains its role.",
    matchSignals: ["who are you", "identify yourself", "your role", "assistant"],
  }),
  prepared({
    key: "profile-overview",
    question: "What does Anthony do?",
    answer:
      "Anthony is a senior software engineer and product builder with over ten years of experience. He has also worked as an agile coach and engineering leader.",
    aliases: ["Tell me about Anthony", "What is his professional background?"],
    intent: "An overview of Anthony's professional profile and background.",
    matchSignals: ["what does", "profile", "background", "tell me about", "profession"],
  }),
  prepared({
    key: "years-experience",
    question: "How much experience does Anthony have?",
    answer:
      "Anthony has more than ten years of experience spanning software engineering, product development, agile coaching, and technical leadership.",
    aliases: [
      "How many years has Anthony worked?",
      "How senior is Anthony?",
      "How long has Anthony worked in software?",
      "How long has he been in software?",
    ],
    intent: "Anthony's seniority and total years of professional experience.",
    matchSignals: [
      "how much experience",
      "how many years",
      "how long",
      "years in software",
      "seniority",
      "how senior",
    ],
  }),
  prepared({
    key: "current-role",
    question: "What is Anthony doing now?",
    answer:
      "Anthony currently leads KYC SOFTWARE LTD and builds Bisonflow, an AI-assisted project management product, while continuing hands-on product and engineering work.",
    aliases: ["What is Anthony's current role?", "Where does he work now?"],
    intent: "Anthony's current role, company, and present professional focus.",
    matchSignals: ["doing now", "current role", "work now", "currently working"],
  }),
  prepared({
    key: "main-strengths",
    question: "What are Anthony's main strengths?",
    answer:
      "Anthony's main strength is connecting product thinking, software architecture, hands-on delivery, and team coaching without adding unnecessary process.",
    aliases: ["What is Anthony best at?", "What are his core strengths?"],
    intent: "Anthony's strongest professional capabilities and differentiators.",
    matchSignals: ["main strengths", "core strengths", "best at", "strongest"],
  }),
  prepared({
    key: "career-path",
    question: "How has Anthony's career evolved?",
    answer:
      "Anthony grew from hands-on software engineering into Scrum and agile coaching, engineering leadership, product building, and eventually founding his own software company.",
    aliases: ["What is Anthony's career path?", "How did his career develop?"],
    intent: "The progression and evolution of Anthony's career over time.",
    matchSignals: ["career evolved", "career path", "career develop", "progression"],
  }),
  prepared({
    key: "product-engineer",
    question: "Is Anthony a product engineer?",
    answer:
      "Yes. Anthony works across product discovery, architecture, implementation, testing, launch, and iteration rather than treating engineering as an isolated delivery step.",
    aliases: [
      "Does Anthony have product engineering experience?",
      "Is he product focused?",
    ],
    intent: "Anthony's product-engineering approach and product focus.",
    matchSignals: ["product engineer", "product engineering", "product focused"],
  }),
  prepared({
    key: "founder-experience",
    question: "Does Anthony have founder experience?",
    answer:
      "Yes. Anthony founded KYC SOFTWARE LTD and owns product strategy, architecture, implementation, pricing, operations, positioning, and go-to-market work around Bisonflow.",
    aliases: ["Has Anthony founded a company?", "What has he done as a founder?"],
    intent: "Anthony's founder, CEO, company-building, and entrepreneurial experience.",
    matchSignals: ["founder", "founded", "entrepreneur", "company building", "ceo"],
  }),
  prepared({
    key: "nextjs-experience",
    question: "Has Anthony worked with Next.js?",
    answer:
      "Yes. Anthony has used Next.js across several products, including Bisonflow, Pixlr, and earlier project management platforms.",
    aliases: ["Does Anthony know Next.js?", "What is his Next.js experience?"],
    intent: "Anthony's experience with Next.js and the Next framework.",
    matchSignals: ["next js", "nextjs", "next framework"],
  }),
  prepared({
    key: "react-experience",
    question: "What is Anthony's React experience?",
    answer:
      "React is one of Anthony's core technologies. He has used it for SaaS products, AI tools, collaborative editors, dashboards, 3D prototypes, and this portfolio.",
    aliases: ["Does Anthony know React?", "Has he worked with React?"],
    intent: "Anthony's professional experience building products with React.",
    matchSignals: ["react", "reactjs", "react experience"],
  }),
  prepared({
    key: "typescript-experience",
    question: "Does Anthony work with TypeScript?",
    answer:
      "Yes. TypeScript is central to Anthony's recent full-stack work across React, Next.js, TanStack Start, Convex, APIs, shared packages, and product tooling.",
    aliases: ["Does Anthony know TypeScript?", "What is his TypeScript experience?"],
    intent: "Anthony's TypeScript knowledge and professional usage.",
    matchSignals: ["typescript", "type script"],
  }),
  prepared({
    key: "nodejs-experience",
    question: "What is Anthony's Node.js experience?",
    answer:
      "Anthony has used Node.js throughout his career for APIs, SaaS backends, automation, integrations, project management platforms, and production services.",
    aliases: ["Does Anthony know Node.js?", "Has he built Node backends?"],
    intent: "Anthony's backend and service-development experience with Node.js.",
    matchSignals: ["node js", "nodejs", "node backend"],
  }),
  prepared({
    key: "tanstack-start-experience",
    question: "Has Anthony used TanStack Start?",
    answer:
      "Yes. Anthony has used TanStack Start for this portfolio, Bragi Notes, Loany, and the Biotech concept, combining prerendered experiences with focused server capabilities.",
    aliases: ["Does Anthony know TanStack Start?", "What did he build with TanStack?"],
    intent: "Anthony's experience with TanStack Start and its full-stack architecture.",
    matchSignals: ["tanstack start", "tan stack start", "tanstack"],
  }),
  prepared({
    key: "convex-experience",
    question: "What is Anthony's experience with Convex?",
    answer:
      "Anthony has used Convex for realtime product data, authentication-aware mutations, shared collaboration, quotas, file storage, scheduled jobs, and AI workflows across several products.",
    aliases: ["Does Anthony know Convex?", "Which projects use Convex?"],
    intent: "Anthony's experience designing and implementing Convex backends.",
    matchSignals: ["convex", "convex backend"],
  }),
  prepared({
    key: "database-experience",
    question: "What databases has Anthony worked with?",
    answer:
      "Anthony has worked with PostgreSQL, MySQL, Neon, Supabase, Prisma-backed databases, Convex, and IndexedDB across SaaS, AI, and local-first products.",
    aliases: ["What is Anthony's database experience?", "Does he know PostgreSQL?"],
    intent: "Anthony's experience with databases, persistence, and data platforms.",
    matchSignals: ["database", "databases", "postgresql", "mysql", "data storage"],
  }),
  prepared({
    key: "frontend-experience",
    question: "What is Anthony's frontend experience?",
    answer:
      "Anthony builds modern React interfaces including responsive product shells, rich-text editors, dashboards, complex tables, accessible interactions, design systems, and animated landing pages.",
    aliases: ["Is Anthony a frontend developer?", "How strong is he at frontend work?"],
    intent: "Anthony's frontend engineering, UI, and interaction-design experience.",
    matchSignals: ["frontend", "front end", "ui engineering", "user interface"],
  }),
  prepared({
    key: "backend-experience",
    question: "What is Anthony's backend experience?",
    answer:
      "Anthony builds APIs, data models, authorization, background workflows, webhooks, billing, file storage, and AI integrations using Node.js, Hono, FastAPI, Convex, and SQL platforms.",
    aliases: ["Is Anthony a backend developer?", "Can he build APIs?"],
    intent: "Anthony's backend, API, data, and server-side engineering experience.",
    matchSignals: ["backend", "back end", "build apis", "server side"],
  }),
  prepared({
    key: "fullstack-experience",
    question: "Is Anthony a full-stack engineer?",
    answer:
      "Yes. Anthony works from interface and product behavior through APIs, data, authentication, infrastructure, testing, and deployment.",
    aliases: ["Does Anthony do full-stack development?", "Can he work across the stack?"],
    intent: "Anthony's ability to work across frontend, backend, and product delivery.",
    matchSignals: ["full stack", "fullstack", "across the stack"],
  }),
  prepared({
    key: "ai-openai-experience",
    question: "What is Anthony's AI and OpenAI experience?",
    answer:
      "Anthony has built AI product workflows using OpenAI for structured extraction, voice, realtime conversations, embeddings, function calling, assistant routing, and cost-aware usage controls.",
    aliases: ["Has Anthony built AI products?", "Does he know the OpenAI API?"],
    intent: "Anthony's AI product development and OpenAI API experience.",
    matchSignals: ["openai", "ai products", "ai experience", "artificial intelligence"],
  }),
  prepared({
    key: "realtime-voice-experience",
    question: "Has Anthony built voice AI features?",
    answer:
      "Yes. Anthony has built voice-driven product commands and this profile-grounded Realtime assistant with transcription, interruption handling, cached speech, semantic routing, and quota controls.",
    aliases: ["What is Anthony's voice AI experience?", "Has he used OpenAI Realtime?"],
    intent: "Anthony's experience with voice interfaces and OpenAI Realtime.",
    matchSignals: ["voice ai", "voice assistant", "openai realtime", "realtime api"],
  }),
  prepared({
    key: "testing-quality",
    question: "How does Anthony approach testing and quality?",
    answer:
      "Anthony treats quality as part of delivery, using unit, integration, end-to-end, regression, accessibility, performance, and security testing with automated verification before release.",
    aliases: ["Does Anthony write tests?", "What testing tools does he use?"],
    intent: "Anthony's testing strategy, quality standards, and verification practices.",
    matchSignals: ["testing", "write tests", "quality", "test strategy", "verification"],
  }),
  prepared({
    key: "architecture-experience",
    question: "What kind of software architecture has Anthony designed?",
    answer:
      "Anthony has designed multi-tenant SaaS, realtime collaboration, local-first products, static-first sites, AI workflows, and multi-service platforms with clear security and data boundaries.",
    aliases: [
      "Is Anthony a software architect?",
      "What architecture experience does he have?",
    ],
    intent: "Anthony's software and product architecture experience.",
    matchSignals: [
      "software architecture",
      "architect",
      "system design",
      "architecture experience",
    ],
  }),
  prepared({
    key: "multi-tenancy",
    question: "Does Anthony have multi-tenant SaaS experience?",
    answer:
      "Yes. Anthony has built organization and workspace models, subdomain routing, tenant-aware data access, RLS-style isolation, invitations, permissions, and database-per-tenant prototypes.",
    aliases: [
      "Has Anthony built multi-tenant systems?",
      "Does he understand tenant isolation?",
    ],
    intent: "Anthony's multi-tenant SaaS and tenant-isolation architecture experience.",
    matchSignals: ["multi tenant", "multitenant", "tenant isolation", "multi tenancy"],
  }),
  prepared({
    key: "saas-billing",
    question: "Has Anthony built SaaS billing systems?",
    answer:
      "Yes. Anthony has implemented Stripe checkout, subscriptions, trials, organization binding, plan handling, team-seat synchronization, and billing-aware product access.",
    aliases: ["Does Anthony know Stripe?", "Has he implemented subscriptions?"],
    intent: "Anthony's SaaS monetization, Stripe, billing, and subscription experience.",
    matchSignals: [
      "saas billing",
      "stripe",
      "subscriptions",
      "checkout",
      "billing system",
    ],
  }),
  prepared({
    key: "realtime-collaboration",
    question: "Has Anthony built realtime collaboration?",
    answer:
      "Yes. Bragi Notes combines local private notes with explicit shared rooms, realtime editing, participant presence, recovery, validation, expiry, and rate limits.",
    aliases: [
      "Has Anthony built local-first software?",
      "What is his collaboration experience?",
    ],
    intent: "Anthony's realtime collaboration and local-first product experience.",
    matchSignals: [
      "realtime collaboration",
      "real time collaboration",
      "local first",
      "shared editing",
    ],
  }),
  prepared({
    key: "latest-projects",
    question: "What are Anthony's latest projects?",
    answer:
      "Anthony's latest projects include this portfolio, Bragi Notes, Tingshuo, Loany, and a Biotech concept prototype. Which one would you like to explore?",
    aliases: ["What has Anthony built recently?", "Tell me about his recent work"],
    intent: "Anthony's latest, newest, current, or recent projects and products.",
    matchSignals: [
      "latest project",
      "latest projects",
      "recent project",
      "recent projects",
      "recent work",
      "built recently",
      "newest project",
    ],
  }),
  prepared({
    key: "portfolio-project",
    question: "How did Anthony build this portfolio?",
    answer:
      "Anthony built it with React, TanStack Start, Nitro, Base UI, and a static-first architecture, then added a Convex-backed OpenAI Realtime assistant with prepared speech and semantic routing.",
    aliases: ["Tell me about Anthony's portfolio", "What powers this website?"],
    intent:
      "The architecture, design, and implementation of Anthony's current portfolio.",
    matchSignals: [
      "this portfolio",
      "portfolio website",
      "this website",
      "portfolio project",
    ],
  }),
  prepared({
    key: "bisonflow-project",
    question: "What is Bisonflow?",
    answer:
      "Bisonflow is Anthony's AI-assisted project management SaaS connecting tasks, documentation, roadmaps, releases, onboarding, billing, admin analytics, voice commands, and AI workflows.",
    aliases: ["What did Anthony build with Bisonflow?", "Tell me about Bisonflow"],
    intent: "Anthony's Bisonflow product, company work, and project-management SaaS.",
    matchSignals: ["bisonflow", "bison flow"],
  }),
  prepared({
    key: "bragi-notes-project",
    question: "What is Bragi Notes?",
    answer:
      "Bragi Notes is Anthony's local-first rich-text notes product. Private notes work offline, while explicit shared rooms add realtime editing and participant presence.",
    aliases: ["What did Anthony build with Bragi Notes?", "Tell me about Bragi"],
    intent: "Anthony's Bragi Notes local-first and collaborative notes product.",
    matchSignals: ["bragi", "bragi notes"],
  }),
  prepared({
    key: "tingshuo-project",
    question: "What is Tingshuo?",
    answer:
      "Tingshuo is Anthony's installable Mandarin-learning product. It turns English captures into structured Taiwan Mandarin vocabulary, examples, search, statistics, and spaced review.",
    aliases: ["What did Anthony build with Tingshuo?", "Tell me about Tingshuo"],
    intent: "Anthony's Tingshuo Mandarin-learning PWA and AI extraction workflow.",
    matchSignals: ["tingshuo", "ting shuo", "mandarin learning"],
  }),
  prepared({
    key: "loany-project",
    question: "What is Loany?",
    answer:
      "Loany is Anthony's French financial-planning product with nine deterministic simulators, versioned assumptions, cited sources, and server-verified calculations.",
    aliases: ["What did Anthony build with Loany?", "Tell me about Loany"],
    intent: "Anthony's Loany financial-planning and simulation product.",
    matchSignals: ["loany", "financial planning", "financial simulator"],
  }),
  prepared({
    key: "biotech-project",
    question: "What is Anthony's Biotech project?",
    answer:
      "It is an interactive Three.js concept for exploring cancer-response product interactions. Its formulas are explicitly invented for product validation and have no clinical meaning.",
    aliases: [
      "Tell me about Anthony's cancer-response prototype",
      "What did he build with Three.js?",
    ],
    intent: "Anthony's Biotech 3D cancer-response concept prototype and its limitations.",
    matchSignals: ["biotech", "cancer response", "three js", "3d prototype"],
  }),
  prepared({
    key: "pixlr-project",
    question: "What did Anthony do at Pixlr?",
    answer:
      "Anthony led engineering and contributed hands-on to a million-plus-user generative AI platform spanning image, video, audio, design, logo, and slide workflows.",
    aliases: ["What was Anthony's Pixlr role?", "Tell me about his Pixlr experience"],
    intent: "Anthony's engineering leadership and full-stack work at Pixlr.",
    matchSignals: ["pixlr", "photo editor", "generative ai platform"],
  }),
  prepared({
    key: "project-management-products",
    question: "What project management products has Anthony built?",
    answer:
      "Anthony built several product-management generations, including EasyTask, DAKA, DAKA Labs, Kudu Flow, and Bisonflow, using each to validate product and architecture decisions.",
    aliases: [
      "Has Anthony built project management software?",
      "What came before Bisonflow?",
    ],
    intent: "Anthony's project-management SaaS lineage and product iterations.",
    matchSignals: [
      "project management products",
      "project management software",
      "before bisonflow",
      "daka",
      "easytask",
      "kudu flow",
    ],
  }),
  prepared({
    key: "mobile-experience",
    question: "Does Anthony have mobile development experience?",
    answer:
      "Yes. Anthony has built React Native and Expo foundations using routing, authentication, secure storage, notifications, maps, media APIs, offline state, and shared monorepo packages.",
    aliases: ["Has Anthony used React Native?", "Does he know Expo?"],
    intent: "Anthony's React Native, Expo, mobile, and cross-platform experience.",
    matchSignals: ["mobile development", "react native", "expo", "mobile apps"],
  }),
  prepared({
    key: "location",
    question: "Where is Anthony based?",
    answer:
      "Anthony is currently based in Taiwan and works remotely. His earlier career includes several roles in France.",
    aliases: ["Where does Anthony live?", "Is Anthony based in Taiwan?"],
    intent: "Where Anthony lives, is based, is located, or works from.",
    matchSignals: ["where", "based", "live", "located", "location"],
  }),
  prepared({
    key: "remote-work",
    question: "Does Anthony work remotely?",
    answer:
      "Yes. Anthony is based in Taiwan and is experienced working remotely with distributed, international, and offshore teams.",
    aliases: ["Is Anthony open to remote work?", "Can he work with distributed teams?"],
    intent: "Anthony's remote-work and distributed-team experience.",
    matchSignals: ["work remotely", "remote work", "distributed teams", "offshore teams"],
  }),
  prepared({
    key: "international-experience",
    question: "Does Anthony have international experience?",
    answer:
      "Yes. Anthony's career spans France, Taiwan, a Singapore-based product environment, a UK research project, and work with multicultural and offshore teams.",
    aliases: ["Has Anthony worked internationally?", "Has he worked across cultures?"],
    intent: "Anthony's international, multicultural, and cross-border work experience.",
    matchSignals: [
      "international experience",
      "worked internationally",
      "across cultures",
      "multicultural",
    ],
  }),
  prepared({
    key: "languages",
    question: "What languages does Anthony speak?",
    answer:
      "Anthony speaks French and English at native or bilingual level. He has basic working Chinese and elementary Spanish.",
    aliases: ["Does Anthony speak English?", "Does he speak Chinese?"],
    intent: "The human languages Anthony speaks and his proficiency levels.",
    matchSignals: [
      "languages",
      "speak english",
      "speak french",
      "speak chinese",
      "speak spanish",
    ],
  }),
  prepared({
    key: "agile-coaching",
    question: "What is Anthony's agile coaching experience?",
    answer:
      "Anthony has coached Product Owners, Product Managers, Scrum Masters, developers, QA, and leaders using Scrum, Kanban, SAFe, flow improvement, and pragmatic delivery practices.",
    aliases: [
      "Has Anthony worked as an agile coach?",
      "Does he know Scrum and Kanban?",
      "How does Anthony help teams improve delivery?",
    ],
    intent:
      "Anthony's agile coaching, Scrum, Kanban, SAFe, and transformation experience.",
    matchSignals: [
      "agile coach",
      "agile coaching",
      "improve delivery",
      "scrum",
      "kanban",
      "safe",
    ],
  }),
  prepared({
    key: "engineering-leadership",
    question: "What is Anthony's engineering leadership experience?",
    answer:
      "Anthony has led engineering delivery while remaining hands-on, coached cross-functional teams, supported architecture decisions, and raised testing and execution standards.",
    aliases: ["Has Anthony managed engineers?", "Is he an engineering leader?"],
    intent:
      "Anthony's engineering management, leadership, and team-development experience.",
    matchSignals: [
      "engineering leadership",
      "managed engineers",
      "engineering leader",
      "lead engineers",
    ],
  }),
  prepared({
    key: "carrefour-experience",
    question: "What did Anthony do at Carrefour?",
    answer:
      "Anthony supported a Digital Factory transformation with six Agile Release Trains, around twenty teams, and roughly 250 people while coaching product and delivery roles.",
    aliases: [
      "Tell me about Anthony's Carrefour experience",
      "What was his Carrefour role?",
    ],
    intent:
      "Anthony's large-scale agile transformation and consulting work at Carrefour.",
    matchSignals: ["carrefour", "digital factory", "agile release trains"],
  }),
  prepared({
    key: "thales-experience",
    question: "What did Anthony do at Thales?",
    answer:
      "Anthony built defense and aerospace-protection software with Ada, Java, Node.js, React, and AngularJS, then also supported Scrum and delivery practices.",
    aliases: [
      "Tell me about Anthony's Thales experience",
      "Did he work in defense software?",
    ],
    intent:
      "Anthony's software engineering and Scrum work at Thales in defense and aerospace.",
    matchSignals: ["thales", "defense software", "aerospace", "ada"],
  }),
  prepared({
    key: "consulting-experience",
    question: "Does Anthony have consulting experience?",
    answer:
      "Yes. Anthony has consulted on product delivery and agile transformation at Carrefour, RAS Interim, and ZOL, adapting methods to each organization's maturity and constraints.",
    aliases: ["Has Anthony worked as a consultant?", "What consulting has he done?"],
    intent:
      "Anthony's consulting experience in product delivery and agile transformation.",
    matchSignals: ["consulting experience", "consultant", "worked as a consultant"],
  }),
  prepared({
    key: "team-scaling",
    question: "Has Anthony worked with large or distributed teams?",
    answer:
      "Yes. Anthony has supported environments ranging from small product teams to three-team departments and large transformations involving about twenty teams and 250 people.",
    aliases: ["Can Anthony help scale teams?", "Has he managed offshore teams?"],
    intent:
      "Anthony's experience scaling, coaching, and coordinating large or distributed teams.",
    matchSignals: [
      "large teams",
      "scale teams",
      "distributed teams",
      "offshore teams",
      "team scaling",
    ],
  }),
  prepared({
    key: "working-style",
    question: "What is Anthony's working style?",
    answer:
      "Anthony works with high ownership and prefers durable, simple solutions. He moves comfortably between product decisions, architecture, implementation, and team coaching.",
    aliases: ["How does Anthony work?", "What is it like to work with him?"],
    intent: "Anthony's working style, collaboration, ownership, and approach.",
    matchSignals: ["working style", "work style", "how does", "work with", "ownership"],
  }),
  prepared({
    key: "why-hire",
    question: "Why should a company hire Anthony?",
    answer:
      "Anthony is a strong fit when a team needs someone who can understand the product, simplify the architecture, write the code, improve delivery, and coach others.",
    aliases: ["Why hire Anthony?", "What value would Anthony bring?"],
    intent: "Why Anthony could be a strong hire and the value he brings to a team.",
    matchSignals: ["why hire", "value would", "good fit", "hire anthony"],
  }),
  prepared({
    key: "availability",
    question: "Is Anthony available for opportunities?",
    answer:
      "Yes. Anthony's portfolio currently marks him as available for opportunities. Contact him directly to discuss timing and fit.",
    aliases: [
      "Is Anthony looking for work?",
      "Can we hire Anthony?",
      "Would Tony be open to a new position?",
    ],
    intent: "Anthony's current availability for work, roles, projects, or opportunities.",
    matchSignals: [
      "available",
      "looking for work",
      "open to a new position",
      "hire anthony",
      "opportunities",
    ],
  }),
  prepared({
    key: "education",
    question: "What is Anthony's educational background?",
    answer:
      "Anthony studied software engineering at EPITECH, computing and entrepreneurship at the University of Kent, and digital transformation and consulting at HEC Paris.",
    aliases: [
      "Where did Anthony study?",
      "What degrees does he have?",
      "What school did Anthony go to?",
    ],
    intent: "Anthony's education, degrees, certificates, and academic background.",
    matchSignals: [
      "education",
      "educational background",
      "study",
      "school",
      "degrees",
      "university",
    ],
  }),
  prepared({
    key: "contact",
    question: "How can I contact Anthony?",
    answer:
      "You can contact Anthony at anthony dot abramo dot pro at gmail dot com, or through LinkedIn at linkedin dot com slash in slash anthony-abramo.",
    aliases: [
      "What is Anthony's email?",
      "Where can I reach him?",
      "How do I get in touch with him?",
    ],
    intent: "How to contact, email, message, or reach Anthony.",
    matchSignals: [
      "contact",
      "email",
      "reach him",
      "get in touch",
      "linkedin",
      "message anthony",
    ],
  }),
] as const;

export const PREPARED_QUESTION_COUNT = SEEDED_FAQS.length - 1;
