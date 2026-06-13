import { prisma } from '../lib/prisma.js';
import { Role, type User } from '../generated/prisma/client.js';

export type DbUser = {
  role: Role;
};

export async function verifyUser(userId: string): Promise<DbUser | null> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return dbUser ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const dbUser = await prisma.user.findUnique({
    where: { email },
  });

  return dbUser;
}