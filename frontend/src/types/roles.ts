// frontend/src/types/roles.ts
export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
