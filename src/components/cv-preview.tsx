import { Download, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import "./cv-preview.css";

const pdf = "/Anthony_Abramo_TW_CV.pdf";
const pageSizes =
  "(max-width: 720px) calc(100vw - 2rem), min(53rem, calc(100vw - 5.5rem))";

export function CvPreview() {
  return (
    <Dialog>
      <DialogTrigger type="button" className="cv-trigger" aria-label="Preview CV">
        CV
      </DialogTrigger>
      <DialogContent className="cv-viewer" overlayClassName="cv-overlay">
        <DialogDescription className="sr-only">
          Preview both pages or open the original, searchable PDF in a new tab.
        </DialogDescription>
        <header className="cv-bar">
          <DialogClose render={<Button size="icon-sm" />} aria-label="Close CV preview">
            <X aria-hidden="true" />
          </DialogClose>
          <DialogTitle className="cv-title">CV</DialogTitle>
          <Button
            size="icon-sm"
            nativeButton={false}
            role="link"
            render={<a href={pdf} target="_blank" rel="noreferrer" />}
            aria-label="Open CV PDF in a new tab"
            title="Open PDF in a new tab"
          >
            <ExternalLink aria-hidden="true" />
          </Button>
          <Button
            nativeButton={false}
            role="link"
            render={<a href={pdf} download />}
            aria-label="Download CV PDF"
          >
            <Download data-icon="inline-start" aria-hidden="true" />
            Download
          </Button>
        </header>
        <section
          className="cv-pages"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll both pages.
          tabIndex={0}
          aria-label="CV pages"
        >
          <img
            src="/cv/page-1.webp"
            srcSet="/cv/page-1.webp 1034w, /cv/page-1-2x.webp 1720w"
            sizes={pageSizes}
            alt="CV page 1 of 2. Summary and experience at KYC Software, Pixlr, and Carrefour."
            width="1034"
            height="1462"
            decoding="async"
          />
          <img
            src="/cv/page-2.webp"
            srcSet="/cv/page-2.webp 1034w, /cv/page-2-2x.webp 1720w"
            sizes={pageSizes}
            alt="CV page 2 of 2. Earlier experience, technical skills, education, and languages."
            width="1034"
            height="1462"
            loading="lazy"
            decoding="async"
          />
        </section>
      </DialogContent>
    </Dialog>
  );
}
