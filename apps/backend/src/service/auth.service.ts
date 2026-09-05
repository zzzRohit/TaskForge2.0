import { prisma } from "@taskforge/db";
import bcrypt from "bcrypt";
import { AppError } from "../utils/app-error";

type Credentials = {
    name: string;
    email: string;
    password: string;
};

export const signup = async ({
    name,
    email,
    password,
}: Credentials) => {

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