import { Link } from "@tanstack/react-router";
import { ArrowLeft, Github, Linkedin, Mail } from "lucide-react";
import { CustomCursor } from "@/components/CustomCursor";
import { person } from "@/lib/portfolio";


export function ScrapbookLayout({
  children,
  tone = "paper",
  hero,
  hideNav = false,
}: {
  children: React.ReactNode;
  tone?: "navy" | "paper";
  hero?: React.ReactNode;
  hideNav?: boolean;
}) {
  const navy = tone === "navy";

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden ${
        navy ? "bg-[oklch(0.235_0.048_264)] text-[oklch(0.97_0.012_235)]" : "page-paper"
      }`}
    >
      <CustomCursor />

      {hero}

      {!hideNav && (
        <div className="relative z-20 px-6 pt-6 md:px-12">
          <Link
            to="/"
            className="lift-stamp inline-flex items-center gap-2 font-script text-2xl text-[oklch(0.24_0.05_264)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            home
          </Link>
        </div>
      )}

      <main className="relative z-10">{children}</main>


      <footer className="relative z-10 mt-24">
        <div
          className={`flex flex-wrap items-start justify-end gap-6 px-6 py-8 md:px-12 ${
            navy ? "" : "bg-[oklch(0.235_0.048_264)]"
          }`}
          style={navy ? undefined : undefined}
        >
          <div className="space-y-1 text-right">
            <a
              href={person.linkedin}
              className="flex items-center justify-end gap-2 font-body text-sm italic text-[oklch(0.97_0.012_235)]/85 hover:underline"
            >
              <Linkedin className="h-4 w-4" />
              {person.linkedin.replace("https://", "")}
            </a>
            <a
              href={`mailto:${person.email}`}
              className="flex items-center justify-end gap-2 font-body text-sm italic text-[oklch(0.97_0.012_235)]/85 hover:underline"
            >
              <Mail className="h-4 w-4" />
              {person.email}
            </a>
            <a
              href={person.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-end gap-2 font-body text-sm italic text-[oklch(0.97_0.012_235)]/85 hover:underline"
            >
              <Github className="h-4 w-4" />
              {person.github.replace("https://", "")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
