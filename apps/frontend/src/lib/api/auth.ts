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
  const response = await api.post<User>("/auth/signin", { email, password });
  return response.data;
}
