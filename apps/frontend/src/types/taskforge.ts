export type User = {
  id: string;
  name: string;
  email: string;
  role?: Role;
  avatarUrl?: string;
};

export type Organization = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
  members: number;
  boards: number;
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
  description: string;
  code: string;
  activityLabel: string;
  memberAvatars: string[];
};

export type MockBoard = Board & {
  updatedLabel: string;
  status: string;
  statusTone: "success" | "accent" | "warning" | "muted";
  activeMembers: number;
  memberAvatars: string[];
};

export type MockCard = {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
  meta?: string;
  priority?: string;
  assigneeInitials?: string;
  done?: boolean;
};

export type MockList = {
  id: string;
  boardId: string;
  title: string;
  cards: MockCard[];
};
