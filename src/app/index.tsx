import { createFileRoute } from "@tanstack/react-router";

import { PortfolioExperience } from "@/components/portfolio-experience";

export const Route = createFileRoute("/")({
  component: Home,
  validateSearch: (search) => ({
    project: typeof search.project === "string" ? search.project : undefined,
  }),
});

function Home() {
  return <PortfolioExperience />;
}
