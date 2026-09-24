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

export type OrganizationMemberPreview = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type ApiOrganization = Organization & {
  memberAvatars: OrganizationMemberPreview[];
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

export type BoardMember = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "OWNER" | "MEMBER";
  createdAt: string;
};

export type BoardList = {
  id: string;
  title: string;
  position: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardCard = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  listId: string;
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
  listId?: string;
  position?: number;
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
