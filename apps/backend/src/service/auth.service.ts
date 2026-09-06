import { prisma } from "@taskforge/db";
import bcrypt from "bcrypt";
import { AppError } from "../utils/app-error";
import { generateToken } from "../utils/jwt";
type Credentials = {
  name: string;
  email: string;
  password: string;
};
type SigninCredentials = {
  email: string;
  password: string;
};

export const signup = async ({ name, email, password }: Credentials) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return user;
};

export const signin = async ({ email, password }: SigninCredentials) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }
  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!passwordCorrect) {
    throw new AppError("Invalid email or password", 401);
  }
  const token = generateToken(user.id); // Generate a JWT token for the authenticated user
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  }; // Return the user object if authentication is successful
};
