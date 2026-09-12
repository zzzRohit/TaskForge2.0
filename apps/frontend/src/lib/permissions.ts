import type { Role } from "../types/taskforge";

export type BoardPermission = "create" | "edit" | "delete" | "view";

export function canManageBoards(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canPerformBoardAction(
  role: Role,
  action: BoardPermission,
): boolean {
  if (action === "view") {
    return true;
  }

  return canManageBoards(role);
}
