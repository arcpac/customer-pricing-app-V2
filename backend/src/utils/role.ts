import { Role } from '../generated/prisma/enums.js';

export function checkRole(role: string): role is Role {
  return !!role && Object.values(Role).includes(role as Role);
}
