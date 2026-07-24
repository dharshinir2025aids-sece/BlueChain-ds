export const siteConfig = {
  name: "BlueChain MRV",
  shortName: "BlueChain",
  tagline: "National Blue Carbon Registry",
  description:
    "Government-grade blue carbon registry and MRV platform for India's coastal ecosystems — transparent, verifiable, and audit-ready.",
  url: "http://localhost:3000",
  links: {
    docs: "/docs",
    registry: "/registry",
    map: "/map",
  },
} as const;

export type NavItem = {
  title: string;
  href: string;
  description?: string;
};

export const publicNav: NavItem[] = [
  { title: "Registry", href: "/registry", description: "Browse verified projects and credits" },
  { title: "Map", href: "/map", description: "Explore coastal restoration sites" },
  { title: "Docs", href: "/docs", description: "How BlueChain MRV works" },
  { title: "About", href: "/about", description: "Mission and SIH context" },
];

export type RoleNavItem = NavItem & { icon?: string };

export const roleHomes = {
  field: "/field",
  ngo: "/ngo",
  verifier: "/verifier",
  admin: "/admin",
  government: "/government",
  buyer: "/buyer",
  super: "/super",
} as const;

export const fieldNav: RoleNavItem[] = [
  { title: "Overview", href: "/field" },
  { title: "Projects", href: "/field/projects" },
  { title: "Uploads", href: "/field/uploads" },
];

export const ngoNav: RoleNavItem[] = [
  { title: "Overview", href: "/ngo" },
  { title: "Projects", href: "/ngo/projects" },
  { title: "Reports", href: "/ngo/reports" },
  { title: "Team", href: "/ngo/team" },
  { title: "Credits", href: "/ngo/credits" },
];

export const verifierNav: RoleNavItem[] = [
  { title: "Overview", href: "/verifier" },
  { title: "Queue", href: "/verifier/queue" },
  { title: "History", href: "/verifier/history" },
];

export const adminNav: RoleNavItem[] = [
  { title: "Overview", href: "/admin" },
  { title: "Projects", href: "/admin/projects" },
  { title: "Verifications", href: "/admin/verifications" },
  { title: "Credits", href: "/admin/credits" },
  { title: "Analytics", href: "/admin/analytics" },
  { title: "Users", href: "/admin/users" },
  { title: "System", href: "/admin/system" },
];

export const governmentNav: RoleNavItem[] = [
  { title: "Overview", href: "/government" },
  { title: "Programs", href: "/government/programs" },
  { title: "Compliance", href: "/government/compliance" },
  { title: "Reports", href: "/government/reports" },
  { title: "Analytics", href: "/government/analytics" },
];

export const buyerNav: RoleNavItem[] = [
  { title: "Overview", href: "/buyer" },
  { title: "Marketplace", href: "/buyer/marketplace" },
  { title: "Portfolio", href: "/buyer/portfolio" },
  { title: "Retire", href: "/buyer/retire" },
  { title: "Reports", href: "/buyer/reports" },
];

export const superNav: RoleNavItem[] = [
  { title: "Overview", href: "/super" },
  { title: "Contracts", href: "/super/contracts" },
  { title: "Logs", href: "/super/logs" },
];
