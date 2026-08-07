import { useRouter } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Mail,
  Menu,
  RotateCw,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VoiceAssistant } from "@/components/voice-assistant";
import { type Project, projects, siteConfig } from "@/content/portfolio";
import { getProjectSlug, validateProjects } from "@/lib/portfolio";

const validProjects = validateProjects(projects);

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (project: Project, trigger: HTMLButtonElement) => void;
}) {
  const content = (
    <>
      <div className="project-media">
        <img
          src={project.cover.src}
          alt={project.cover.alt}
          loading="lazy"
          decoding="async"
          className="fill-image"
        />
        <span className="project-open">
          {project.concept ? "Open concept" : "Open live"}
          <ArrowUpRight aria-hidden="true" />
        </span>
      </div>

      <div className="project-card-copy">
        <span className="project-year">{project.year}</span>
        <div className="project-card-main">
          <p>{project.role}</p>
          <div className="project-title-row">
            <h3>{project.title}</h3>
            <ArrowUpRight aria-hidden="true" />
          </div>
          <p className="project-summary">{project.summary}</p>
        </div>
        {project.confidentialityNote ? (
          <p className="project-confidentiality">{project.confidentialityNote}</p>
        ) : (
          <ul aria-label={`${project.title} technologies`}>
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <article className="project-card">
      <button
        type="button"
        className="project-card-trigger"
        onClick={(event) => {
          if (project.embeddable === false && !project.concept) {
            window.open(project.liveUrl, "_blank", "noopener,noreferrer");
            return;
          }
          onOpen(project, event.currentTarget);
        }}
        aria-label={`Open ${project.title} ${project.concept ? "concept visual" : "website"}`}
      >
        {content}
      </button>
    </article>
  );
}

function LiveProject({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoaded(false);
    setTimedOut(false);
    setReloadKey(0);
    if (!project) return;

    const timer = window.setTimeout(() => setTimedOut(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [project]);

  const reload = () => {
    setLoaded(false);
    setTimedOut(false);
    setReloadKey((value) => value + 1);
  };

  return (
    <Dialog open={Boolean(project)} onOpenChange={(open) => !open && onClose()}>
      {project ? (
        <DialogContent className="top-0 left-0 translate-x-0 translate-y-0 project-viewer">
          <DialogTitle className="sr-only">{project.title}</DialogTitle>
          <DialogDescription className="sr-only">
            {project.concept
              ? `Concept visual for ${project.title}`
              : `Live embedded preview of ${project.title}`}
          </DialogDescription>

          <div className="viewer-shell">
            <header className="viewer-bar">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                aria-label={`Close ${project.title}`}
              >
                <ArrowLeft data-icon="inline-start" />
                Back
              </Button>

              <div className="viewer-identity">
                <strong>{project.title}</strong>
                <span>
                  {project.concept
                    ? "Concept visual"
                    : loaded
                      ? "Live website"
                      : "Connecting"}
                </span>
              </div>

              {project.concept ? null : (
                <div className="viewer-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    onClick={reload}
                    aria-label={`Reload ${project.title}`}
                  >
                    <RotateCw />
                  </Button>
                  <Button
                    render={<a href={project.liveUrl} target="_blank" rel="noreferrer" />}
                    variant="secondary"
                    size="sm"
                  >
                    Open site
                    <ExternalLink data-icon="inline-end" />
                  </Button>
                </div>
              )}
            </header>

            {project.concept ? (
              <div className="concept-project">
                <img src={project.cover.src} alt={project.cover.alt} />
              </div>
            ) : (
              <div className="live-project">
                <div className={`live-project-poster${loaded ? " is-hidden" : ""}`}>
                  <img
                    src={project.cover.src}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="fill-image"
                  />
                  <div className="live-project-loading" role="status">
                    <span />
                    <strong>
                      {timedOut ? "Preview unavailable" : `Opening ${project.title}`}
                    </strong>
                    <p>
                      {timedOut
                        ? "This site may block embedding. Use Open site."
                        : "Loading live website"}
                    </p>
                  </div>
                </div>

                <iframe
                  key={`${project.slug}-${reloadKey}`}
                  src={project.liveUrl}
                  title={`${project.title} live website`}
                  onLoad={() => setLoaded(true)}
                  referrerPolicy="strict-origin-when-cross-origin"
                  sandbox="allow-downloads allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  allow="clipboard-read; clipboard-write; fullscreen"
                />
              </div>
            )}
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function ContactSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(siteConfig.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="contact-sheet">
        <SheetHeader className="contact-sheet-header">
          <div className="sheet-topline">
            <span className="eyebrow">Work with me</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="panel-close"
              onClick={() => onOpenChange(false)}
              aria-label="Close contact panel"
            >
              <X />
            </Button>
          </div>
          <SheetTitle>What are you working on?</SheetTitle>
          <SheetDescription>
            Send me a few details about the project and where you need help. I&apos;ll
            reply personally.
          </SheetDescription>
        </SheetHeader>

        <div className="contact-sheet-body">
          <div>
            <p className="contact-label">Email</p>
            <a className="contact-email" href={`mailto:${siteConfig.email}`}>
              <Mail aria-hidden="true" />
              <span>{siteConfig.email}</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <button type="button" className="copy-email" onClick={copyEmail}>
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? "Copied" : "Copy email"}
            </button>
          </div>

          <div className="contact-brief">
            <p className="contact-label">Helpful to include</p>
            <ul>
              <li>
                <span>01</span>
                What you&apos;re building
              </li>
              <li>
                <span>02</span>
                What you need help with
              </li>
              <li>
                <span>03</span>
                When you need it
              </li>
            </ul>
          </div>
        </div>

        <footer className="contact-sheet-footer">
          {siteConfig.socialLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              <ArrowUpRight aria-hidden="true" />
              {link.label}
            </a>
          ))}
        </footer>
      </SheetContent>
    </Sheet>
  );
}

export function PortfolioExperience() {
  const router = useRouter({ warn: false });
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const heroImageRef = useRef<HTMLImageElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const scrollPosition = useRef(0);

  const activeProject = useMemo(
    () => validProjects.find((project) => project.slug === activeSlug) ?? null,
    [activeSlug],
  );

  useEffect(() => {
    const syncFromLocation = () => {
      const slug = getProjectSlug(window.location.search);
      setActiveSlug(validProjects.some((project) => project.slug === slug) ? slug : null);
    };
    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, []);

  useEffect(() => {
    const image = heroImageRef.current;
    const reveal = () => setHeroLoaded(true);
    const fallback = window.setTimeout(reveal, 1200);

    if (image?.complete)
      void image
        .decode()
        .catch(() => {})
        .finally(reveal);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (
      !hero ||
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let frame = 0;
    const movePortrait = (event: PointerEvent) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * -2;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -2;
        hero.style.setProperty("--portrait-shift-x", `${x * 10}px`);
        hero.style.setProperty("--portrait-shift-y", `${y * 7}px`);
      });
    };
    const resetPortrait = () => {
      window.cancelAnimationFrame(frame);
      hero.style.setProperty("--portrait-shift-x", "0px");
      hero.style.setProperty("--portrait-shift-y", "0px");
    };

    hero.addEventListener("pointermove", movePortrait);
    hero.addEventListener("pointerleave", resetPortrait);
    return () => {
      window.cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", movePortrait);
      hero.removeEventListener("pointerleave", resetPortrait);
    };
  }, []);

  const openProject = (project: Project, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    scrollPosition.current = window.scrollY;
    setActiveSlug(project.slug);
    void router.navigate({
      to: "/",
      search: { project: project.slug },
      state: { portfolioProject: project.slug },
      resetScroll: false,
    });
  };

  const closeProject = () => {
    const restore = () => {
      window.scrollTo({ top: scrollPosition.current });
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    };

    if (window.history.state?.portfolioProject === activeSlug) {
      router.history.back();
      window.setTimeout(restore, 0);
      return;
    }

    setActiveSlug(null);
    void router.navigate({
      to: "/",
      search: { project: undefined },
      replace: true,
      resetScroll: false,
    });
    restore();
  };

  const goToSection = (id: string) => {
    setMenuOpen(false);
    window.setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ block: "start" }),
      160,
    );
  };

  return (
    <>
      <div className="portfolio-page">
        <header className="site-header">
          <a href="#home" className="brand" aria-label="Anthony Abramo home">
            <span>AA</span>
            <span className="ml-2">Available for opportunities</span>
          </a>
          <div className="header-actions">
            <button
              type="button"
              className="contact-trigger"
              onClick={() => setContactOpen(true)}
            >
              Work with me
            </button>
            <button
              type="button"
              className="menu-trigger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu aria-hidden="true" />
            </button>
          </div>
        </header>

        <main>
          <section
            ref={heroRef}
            id="home"
            className={`hero${heroLoaded ? " is-ready" : ""}`}
          >
            <div className="hero-grid" aria-hidden="true" />

            <div className="hero-name" role="img" aria-label="Anthony Abramo">
              <span>Anthony</span>
              <span>Abramo</span>
            </div>

            <div className="hero-portrait">
              <img
                ref={heroImageRef}
                src="/assets/portrait-new-transparent-1800.webp"
                alt=""
                width="1800"
                height="2400"
                fetchPriority="high"
                decoding="async"
                className="hero-poster fill-image"
                onLoad={(event) => {
                  void event.currentTarget
                    .decode()
                    .catch(() => {})
                    .finally(() => setHeroLoaded(true));
                }}
                onError={() => setHeroLoaded(true)}
              />
            </div>

            <div className="hero-intro">
              <p className="eyebrow">
                <span className="hero-status-dot" />
                Senior product engineer · Taipei / Remote
              </p>
              <h1>
                10<span className="hero-plus">+</span> years building
                <br />
                products <em>that last.</em>
              </h1>
              <p>{siteConfig.introduction}</p>
            </div>

            <p className="hero-chinese" lang="zh-Hant">
              我住在台灣，也還在學中文。
            </p>

            <VoiceAssistant />

            <a href="#work" className="scroll-cue">
              <span>Scroll down</span>
              <ArrowDown aria-hidden="true" className="pb-1" />
            </a>
          </section>

          <section id="work" className="work-section">
            <header className="section-heading">
              <div>
                <p className="eyebrow">Selected work · Built and shipped</p>
                <h2>
                  I stand behind
                  <br />
                  <em>the work.</em>
                </h2>
              </div>
              <p>
                Selected product and team work across collaboration, learning, finance,
                retail, and operations. Public products open live; confidential work uses
                clearly labeled concept visuals.
              </p>
            </header>

            <div className="project-grid">
              {validProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} onOpen={openProject} />
              ))}
            </div>
          </section>

          <section className="manifesto">
            <p className="eyebrow">How I work</p>
            <p>
              Own the outcome.
              <br />
              Make complexity feel simple.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="manifesto-cta"
              onClick={() => setContactOpen(true)}
            >
              Tell me what you&apos;re building
              <ArrowUpRight data-icon="inline-end" />
            </Button>
          </section>
        </main>

        <footer className="site-footer">
          <span>© 2026 Anthony Abramo</span>
          <span>Designed and built by myself.</span>
          <a href="#home">
            <span>Back to top</span>
            <span className="back-to-top-arrow" aria-hidden="true">
              ↑
            </span>
          </a>
        </footer>
      </div>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent
          overlayClassName="navigation-overlay"
          className="top-0 left-0 translate-x-0 translate-y-0 navigation-dialog"
        >
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <DialogDescription className="sr-only">
            Portfolio navigation and social links
          </DialogDescription>
          <div className="menu-topline">
            <span className="brand">
              <span>AA</span>
              <span>Available for opportunities</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="panel-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <X />
            </Button>
          </div>

          <nav className="menu-links" aria-label="Main navigation">
            <button type="button" onClick={() => goToSection("home")}>
              <span data-label="Home">Home</span>
              <small>01</small>
            </button>
            <button type="button" onClick={() => goToSection("work")}>
              <span data-label="Work">Work</span>
              <small>02</small>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                window.setTimeout(() => setContactOpen(true), 160);
              }}
            >
              <span data-label="Contact">Contact</span>
              <small>03</small>
            </button>
          </nav>

          <footer className="menu-footer">
            <span>Menu</span>
            <div>
              {siteConfig.socialLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                  <ArrowUpRight aria-hidden="true" />
                  {link.label}
                </a>
              ))}
            </div>
          </footer>
        </DialogContent>
      </Dialog>

      <ContactSheet open={contactOpen} onOpenChange={setContactOpen} />
      <LiveProject project={activeProject} onClose={closeProject} />
    </>
  );
}
