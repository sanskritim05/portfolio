import { createFileRoute } from "@tanstack/react-router";
import { Book } from "@/components/Book";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sanskriti Malakar - Portfolio" },
      {
        name: "description",
        content: "Sanskriti Malakar - Portfolio: about, skills, projects, experience and contact.",
      },
      { property: "og:title", content: "Sanskriti Malakar - Portfolio" },
      { property: "og:description", content: "A portfolio for Sanskriti Malakar." },
    ],
  }),
  component: Index,
});

function Index() {
  return <Book />;
}
