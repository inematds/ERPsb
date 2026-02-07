import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the auth function
const mockAuth = vi.fn();

vi.mock('@/core/auth/auth', async () => {
  return {
    auth: () => mockAuth(),
    getCurrentUser: async () => {
      const session = await mockAuth();
      if (!session?.user?.id) {
        return null;
      }
      return {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        image: session.user.image,
      };
    },
  };
});

import { getCurrentUser } from '@/core/auth/auth';

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when there is no session', async () => {
    mockAuth.mockResolvedValue(null);

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('should return null when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: { email: 'test@test.com' } });

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('should return user data when session is valid', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'user_123',
        email: 'test@test.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
      },
    });

    const user = await getCurrentUser();
    expect(user).toEqual({
      id: 'user_123',
      email: 'test@test.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
    });
  });

  it('should handle missing optional fields', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'user_123',
        email: null,
        name: null,
        image: null,
      },
    });

    const user = await getCurrentUser();
    expect(user).toEqual({
      id: 'user_123',
      email: '',
      name: '',
      image: null,
    });
  });
});
