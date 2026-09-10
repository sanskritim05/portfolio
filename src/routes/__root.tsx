import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
} from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[oklch(0.235_0.048_264)] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-[oklch(0.97_0.012_235)]">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-[oklch(0.97_0.012_235)]">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-[oklch(0.76_0.035_240)]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-[oklch(0.86_0.06_235)] px-4 py-2 text-sm font-medium text-[oklch(0.24_0.05_264)] transition-colors hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[oklch(0.235_0.048_264)] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-[oklch(0.97_0.012_235)]">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-[oklch(0.76_0.035_240)]">
          Something went wrong on our end. You can try refreshing or head back
          home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-[oklch(0.86_0.06_235)] px-4 py-2 text-sm font-medium text-[oklch(0.24_0.05_264)] transition-colors hover:opacity-90"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-[oklch(1_0_0/0.18)] bg-[oklch(0.235_0.048_264)] px-4 py-2 text-sm font-medium text-[oklch(0.97_0.012_235)] transition-colors hover:bg-[oklch(0.32_0.045_264)]"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sanskriti Malakar" },
      {
        name: "description",
        content:
          "Sanskriti Malakar — AI/ML & full-stack engineering portfolio",
      },
      { name: "author", content: "Sanskriti Malakar" },
      { property: "og:title", content: "Sanskriti Malakar" },
      {
        property: "og:description",
        content:
          "Sanskriti Malakar — AI/ML & full-stack engineering portfolio",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@SanskritiMalakar" },
    ],
    links: [{ rel: "icon", type: "image/png", href: `${import.meta.env.BASE_URL}favicon.png` }],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <Outlet />
    </QueryClientProvider>
  );
}
