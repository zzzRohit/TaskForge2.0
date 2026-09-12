import type { MockBoard, MockOrganization, User } from "../../types/taskforge";

export const currentUser: User = {
  id: "user-1",
  name: "Aarav Mehta",
  email: "aarav@taskforge.test",
};

export const organizations: MockOrganization[] = [
  {
    id: "taskforge",
    name: "TaskForge",
    role: "OWNER",
    members: 8,
    boards: 5,
    createdAt: "2026-08-12T09:00:00.000Z",
    updatedAt: "2026-09-11T14:20:00.000Z",
  },
  {
    id: "dev-team",
    name: "Dev Team",
    role: "ADMIN",
    members: 12,
    boards: 7,
    createdAt: "2026-07-03T09:00:00.000Z",
    updatedAt: "2026-09-10T12:00:00.000Z",
  },
  {
    id: "college-project",
    name: "College Project",
    role: "MEMBER",
    members: 5,
    boards: 3,
    createdAt: "2026-08-27T09:00:00.000Z",
    updatedAt: "2026-09-09T18:00:00.000Z",
  },
];

export const boards: MockBoard[] = [
  {
    id: "product-roadmap",
    title: "Product Roadmap",
    description: "Plan upcoming product work.",
    organizationId: "taskforge",
    ownerId: "user-1",
    createdAt: "2026-08-14T09:00:00.000Z",
    updatedAt: "2026-09-12T10:00:00.000Z",
    updatedLabel: "Updated 2h ago",
  },
  {
    id: "engineering",
    title: "Engineering",
    description: "Backend development and release work.",
    organizationId: "taskforge",
    ownerId: "user-1",
    createdAt: "2026-08-16T09:00:00.000Z",
    updatedAt: "2026-09-11T10:00:00.000Z",
    updatedLabel: "Updated yesterday",
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "Campaign planning and launch notes.",
    organizationId: "taskforge",
    ownerId: "user-1",
    createdAt: "2026-08-21T09:00:00.000Z",
    updatedAt: "2026-09-09T10:00:00.000Z",
    updatedLabel: "Updated 3 days ago",
  },
  {
    id: "design-system",
    title: "Design System",
    description: "Components, tokens, and interface decisions.",
    organizationId: "dev-team",
    ownerId: "user-1",
    createdAt: "2026-07-08T09:00:00.000Z",
    updatedAt: "2026-09-11T17:00:00.000Z",
    updatedLabel: "Updated yesterday",
  },
  {
    id: "semester-plan",
    title: "Semester Plan",
    description: "Milestones for the project presentation.",
    organizationId: "college-project",
    ownerId: "user-2",
    createdAt: "2026-08-28T09:00:00.000Z",
    updatedAt: "2026-09-08T11:00:00.000Z",
    updatedLabel: "Updated 4 days ago",
  },
];
