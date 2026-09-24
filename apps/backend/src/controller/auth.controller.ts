import { Request, Response } from "express";
import * as authservice from "../service/auth.service";

export const signup = async (request: Request, response: Response) => {
  const { name, email, password } = request.body;
  const user = await authservice.signup({ name, email, password });
  return response.status(201).json(user);
};
export const signin = async (request: Request, response: Response) => {
  const { email, password } = request.body;
  const result = await authservice.signin({ email, password });
  response.cookie("token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 100,
  });
  return response.status(200).json({
    user: result.user,
  });
};

export const me = async (request: Request, response: Response) => {
  const user = await authservice.getCurrentUser(request.userId!);
  if (!user) return response.status(404).json({ error: "User not found" });
  return response.status(200).json(user);
};

export const updateMe = async (request: Request, response: Response) => {
  const { name, avatarUrl } = request.body;
  if (name !== undefined && (!name || !name.trim())) {
    return response.status(400).json({ error: "Name is required" });
  }
  const user = await authservice.updateCurrentUser({
    userId: request.userId!,
    name: typeof name === "string" ? name.trim() : undefined,
    avatarUrl,
  });
  return response.status(200).json(user);
};
