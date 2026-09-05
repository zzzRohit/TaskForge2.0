import { Request, Response } from "express";
import * as authservice from "../service/auth.service";

export const signup = async (request: Request, response: Response) => {
  const { name, email, password } = request.body;
  const user = await authservice.signup({ name, email, password });
  return response.status(201).json(user);
};
