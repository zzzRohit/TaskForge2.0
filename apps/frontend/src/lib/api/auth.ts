import { api } from "./client";
import type { User } from "../../types/taskforge";

type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export async function signup(data: SignupInput): Promise<User> {
  const response = await api.post<User>("/auth/signup", data);

  return response.data;
}
export async function login(email: string, password: string): Promise<User> {
  const response = await api.post<{ user: User }>("/auth/signin", {
    email,
    password,
  });
  localStorage.setItem("taskforge.user", JSON.stringify(response.data.user));
  return response.data.user;
}

export function getStoredUser(): User | null {
  const storedUser = localStorage.getItem("taskforge.user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem("taskforge.user");
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem("taskforge.user");
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>("/auth/me");
  localStorage.setItem("taskforge.user", JSON.stringify(response.data));
  return response.data;
}

export async function updateCurrentUser(input: {
  name?: string;
  avatarUrl?: string | null;
}): Promise<User> {
  const response = await api.patch<User>("/auth/me", input);
  localStorage.setItem("taskforge.user", JSON.stringify(response.data));
  return response.data;
}
