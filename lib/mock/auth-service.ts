// Mock user data for testing
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isEmailVerified: true,
  preferences: {
    theme: 'system' as const,
    notifications: true,
  },
};

// Mock authentication service
export const mockAuthService = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials
    if (email === 'test@example.com' && password === 'Test@123456') {
      return {
        success: true,
        data: mockUser,
        message: 'Login successful',
      };
    }

    throw new Error('Invalid email or password');
  },

  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: null,
      message: 'Logged out successfully',
    };
  },

  getUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: mockUser,
      message: 'User data retrieved successfully',
    };
  },

  updateUser: async (data: Partial<typeof mockUser>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: { ...mockUser, ...data },
      message: 'User updated successfully',
    };
  },
};