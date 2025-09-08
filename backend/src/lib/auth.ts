import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Context } from "hono";

const JWT_SECRET = process.env.JWT_SECRET!;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: number, email: string): string => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (
  token: string
): { userId: number; email: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
    };
    return decoded;
  } catch {
    return null;
  }
};

export const getAuthUser = async (c: Context) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  return verifyToken(token);
};
