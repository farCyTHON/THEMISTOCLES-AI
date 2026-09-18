import type { Organization, Person } from "./types";

export const organization: Organization = {
  id: "org-acme",
  name: "Acme",
  tagline: "Your organization remembers.",
};

export const currentUserId = "person-alex";

export const people: Person[] = [
  {
    id: "person-alex",
    name: "Alex Chen",
    role: "Product / Engineering",
    teamId: "team-engineering",
    email: "alex.chen@acme.example",
    department: "Engineering",
  },
  {
    id: "person-sam",
    name: "Sam Lee",
    role: "Backend Engineer",
    teamId: "team-engineering",
    email: "sam.lee@acme.example",
    department: "Engineering",
  },
  {
    id: "person-maya",
    name: "Maya Patel",
    role: "Security Engineer",
    teamId: "team-security",
    email: "maya.patel@acme.example",
    department: "Security",
  },
  {
    id: "person-daniel",
    name: "Daniel Kim",
    role: "Operations Lead",
    teamId: "team-ops",
    email: "daniel.kim@acme.example",
    department: "Operations",
  },
  {
    id: "person-sarah",
    name: "Sarah Ahmed",
    role: "Product Manager",
    teamId: "team-product",
    email: "sarah.ahmed@acme.example",
    department: "Product",
  },
  {
    id: "person-lena",
    name: "Lena Torres",
    role: "Design Lead",
    teamId: "team-product",
    email: "lena.torres@acme.example",
    department: "Product",
  },
  {
    id: "person-james",
    name: "James Okafor",
    role: "Sales Director",
    teamId: "team-ops",
    email: "james.okafor@acme.example",
    department: "Sales",
  },
  {
    id: "person-rachel",
    name: "Rachel Kim",
    role: "Customer Success Lead",
    teamId: "team-ops",
    email: "rachel.kim@acme.example",
    department: "Customer Success",
  },
];

