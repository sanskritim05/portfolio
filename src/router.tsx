import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const basepath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export const getRouter = () => {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    basepath: basepath === "/" ? undefined : basepath,
  });
};
