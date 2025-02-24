import { describe, it, expect, beforeEach } from '@jest/globals';
import testUtils from '../helpers';
import { validateResponse } from '../assertions';

describe('API Testing Examples', () => {
  beforeEach(() => {
    global.mockFetch.mockClear();
  });

  describe('Success Responses', () => {
    it('handles successful GET request', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test User' };
      testUtils.fetch.success(mockData);

      // Act
      const response = await fetch('https://api.example.com/users/1');

      // Assert
      await validateResponse.success(response, mockData);
    });

    it('handles successful POST request with custom status', async () => {
      // Arrange
      const newUser = { name: 'New User', email: 'test@example.com' };
      testUtils.fetch.success(newUser, { status: 201 });

      // Act
      const response = await fetch('https://api.example.com/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      // Assert
      await validateResponse.success(response, newUser, 201);

      // Verify request
      expect(global.mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(newUser),
        })
      );
    });
  });

  describe('Error Responses', () => {
    it('handles not found error', async () => {
      // Arrange
      testUtils.fetch.error('NOT_FOUND', 'User not found', { status: 404 });

      // Act
      const response = await fetch('https://api.example.com/users/999');

      // Assert
      await validateResponse.error(response, {
        status: 404,
        type: 'NOT_FOUND',
        message: 'User not found',
      });
    });

    it('handles validation error', async () => {
      // Arrange
      const invalidUser = { name: '' };
      testUtils.fetch.error('VALIDATION_ERROR', 'Name is required', { status: 400 });

      // Act
      const response = await fetch('https://api.example.com/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidUser),
      });

      // Assert
      await validateResponse.error(response, {
        status: 400,
        type: 'VALIDATION_ERROR',
        message: 'Name is required',
      });
    });

    it('handles network errors', async () => {
      // Arrange
      testUtils.fetch.networkError(new Error('Network timeout'));

      // Act & Assert
      await validateResponse.networkError(
        fetch('https://api.example.com/users'),
        'Network timeout'
      );
    });
  });

  describe('Response Formats', () => {
    it('verifies success response format', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test User' };
      testUtils.fetch.success(mockData);

      // Act
      const response = await fetch('https://api.example.com/users/1');

      // Assert
      const data = await validateResponse.success(response, mockData);
      expect(data).toEqual({
        success: true,
        data: mockData,
      });
    });

    it('verifies error response format', async () => {
      // Arrange
      const errorDetails = {
        type: 'VALIDATION_ERROR',
        message: 'Invalid input',
      };
      testUtils.fetch.error(errorDetails.type, errorDetails.message, { status: 400 });

      // Act
      const response = await fetch('https://api.example.com/users');

      // Assert
      const data = await validateResponse.error(response, {
        status: 400,
        ...errorDetails,
      });
      expect(data).toEqual({
        success: false,
        ...errorDetails,
      });
    });
  });

  describe('Response Types', () => {
    it('handles typed success response', async () => {
      // Arrange
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      };
      testUtils.fetch.success(mockUser);

      // Act
      const response = await fetch('https://api.example.com/users/1');

      // Assert
      const data = await validateResponse.success<User>(response, mockUser);
      expect(data.data.email).toBe('test@example.com');
    });
  });
});