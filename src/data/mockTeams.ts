import type { Team } from "./types";

export const teams: Team[] = [
  {
    id: "team-engineering",
    name: "Engineering",
    description: "Builds and operates product services, including payments and CI/CD.",
  },
  {
    id: "team-product",
    name: "Product",
    description: "Defines product direction and launch criteria.",
  },
  {
    id: "team-security",
    name: "Security",
    description: "Reviews production changes and maintains security policy.",
  },
  {
    id: "team-ops",
    name: "Operations",
    description: "Runs incident response, onboarding, and production platforms.",
  },
];
