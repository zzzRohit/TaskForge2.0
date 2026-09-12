export type User = {
  id: string;
  name: string;
  email: string;
};

export type Organization = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Board = {
  id: string;
  title: string;
  description: string | null;
  organizationId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type Role = "OWNER" | "ADMIN" | "MEMBER";

export type MockOrganization = Organization & {
  role: Role;
  members: number;
  boards: number;
};

export type MockBoard = Board & {
  updatedLabel: string;
};
