import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyUser, getUserByEmail } from '../utils/user.js';
import { prisma } from '../lib/prisma.js';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));


const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockFindUnique.mockReset();
});

describe('utils user', () => {
  describe('verifyUser', () => {
    it('use existing user Id', async () => {
      mockFindUnique.mockResolvedValue({ role: 'STAFF' });
      const result = await verifyUser('existing-id');
      expect(result).toEqual({ role: 'STAFF' });
    });
  });
  describe('verifyUser', () => {
    it('use not existing user Id', async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await verifyUser('nonexistent-id');
      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('returns user when email exists', async () => {
      const mockUser = { id: 'u1', email: 'test@example.com', role: 'STAFF', passwordHash: 'hash', createdAt: new Date() };
      mockFindUnique.mockResolvedValue(mockUser);
      const result = await getUserByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('returns null when email does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await getUserByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });
});
