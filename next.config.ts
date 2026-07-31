import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables React's <ViewTransition>, used to morph a project card's title
    // into the case-study headline (project-card.tsx <-> work/[slug]/page.tsx).
    // Degrades silently: browsers without the View Transitions API just navigate.
    viewTransition: true,
  },
};

export default nextConfig;
