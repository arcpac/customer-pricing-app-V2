import { describe, it, expect } from 'vitest';
import { Role } from '../generated/prisma/enums.js';
import { checkRole } from '../utils/role.js';

describe('checkRole', () => {
  it('returns true for a valid role', () => {
    expect(checkRole('STAFF')).toBe(true);
    expect(checkRole('ADMIN')).toBe(true);
    expect(checkRole('SUPER_ADMIN')).toBe(true);
  });
  it('returns false for an invalid role', () => {
    expect(checkRole('EMPLOYEE')).toBe(false);
  });
});
