import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AuthProvider, AuthContext, useAuth } from '../../src/context/AuthContext';

const TestComponent = () => {
  const { user, login, logout, loading, error } = useAuth();
  
  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      {user && (
        <div>
          <div data-testid="user-token">{user.token}</div>
          <div data-testid="user-id">{user.id}</div>
          <div data-testid="user-username">{user.username}</div>
          <div data-testid="user-role">{user.role}</div>
        </div>
      )}
      <button 
        data-testid="login-btn" 
        onClick={() => login('test-token', '123', 'testuser', 'user')}
      >
        Login
      </button>
      <button 
        data-testid="invalid-login-btn" 
        onClick={() => {
          const circular = {};
          circular.self = circular;
          login('test-token', circular, 'testuser', 'user');
        }}
      >
        Invalid Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
      <button 
        data-testid="error-logout-btn" 
        onClick={() => {
          // Simulate an error during logout
          Object.defineProperty(window, 'localStorage', {
            value: {
              removeItem: () => { throw new Error('Simulated error'); }
            }
          });
          logout();
        }}
      >
        Error Logout
      </button>
    </div>
  );
};

// Test component for testing the useAuth hook outside AuthProvider
const StandaloneComponent = () => {
  try {
    const auth = useAuth();
    return <div data-testid="success">Success</div>;
  } catch (error) {
    return <div data-testid="hook-error">{error.message}</div>;
  }
};

describe('Enhanced AuthContext', () => {
  // Mock localStorage
  let localStorageMock;
  
  beforeEach(() => {
    // Setup localStorage mock for each test
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Mock console.error to avoid test output pollution
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Clear mocks before each test
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });
  
  it('handles localStorage exceptions during initialization', async () => {
    // Force localStorage.getItem to throw an error
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage is not available');
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Should show error and user should not be authenticated
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.queryByTestId('user-token')).not.toBeInTheDocument();
    
    // Verify localStorage.removeItem was called to clean up potentially corrupted data
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });
  
  it('handles JSON parsing errors during initialization', async () => {
    // Return invalid JSON from localStorage
    localStorageMock.getItem.mockReturnValue('{ invalid json }');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Should show error and user should not be authenticated
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.queryByTestId('user-token')).not.toBeInTheDocument();
    
    // Verify localStorage.removeItem was called to clean up corrupted data
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });
  
  it('handles errors during login', async () => {
    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Click invalid login button (which will cause JSON.stringify to fail)
    await user.click(screen.getByTestId('invalid-login-btn'));
    
    // Should show error and user should not be authenticated
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.queryByTestId('user-token')).not.toBeInTheDocument();
  });
  
  it('handles errors during logout', async () => {
    const user = userEvent.setup();
    
    // Start with a logged-in user
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      token: 'test-token',
      id: '123',
      username: 'testuser',
      role: 'user'
    }));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.getByTestId('user-token')).toBeInTheDocument();
    });
    
    // Click error logout button which creates an exception during logout
    await user.click(screen.getByTestId('error-logout-btn'));
    
    // Should show error and user should still be authenticated
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByTestId('user-token')).toBeInTheDocument();
  });
  
  it('throws error when useAuth is used outside of AuthProvider', () => {
    render(<StandaloneComponent />);
    
    // Should show error message
    expect(screen.getByTestId('hook-error')).toHaveTextContent('useAuth must be used within an AuthProvider');
  });
  
  it('clears error when login is successful after a previous error', async () => {
    const user = userEvent.setup();
    
    // Force localStorage.getItem to throw an error during initialization
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage is not available');
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Should show error initially
    expect(screen.getByTestId('error')).toBeInTheDocument();
    
    // Reset localStorage mock to work normally for login
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });
    
    // Click login button
    await user.click(screen.getByTestId('login-btn'));
    
    // Error should be cleared and user should be authenticated
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    expect(screen.getByTestId('user-token')).toBeInTheDocument();
  });
  
  it('clears error when logout is successful after a previous error', async () => {
    const user = userEvent.setup();
    
    // Start with a logged-in user and an error
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      token: 'test-token',
      id: '123',
      username: 'testuser',
      role: 'user'
    }));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Simulate setting an error
    // First, we need to access the context's setError function
    // Since we can't directly access it, we'll trigger an error via invalid login
    await user.click(screen.getByTestId('invalid-login-btn'));
    
    // Verify error is shown
    expect(screen.getByTestId('error')).toBeInTheDocument();
    
    // Reset localStorage mock to work normally for logout
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });
    
    // Click logout button
    await user.click(screen.getByTestId('logout-btn'));
    
    // Error should be cleared and user should be logged out
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-token')).not.toBeInTheDocument();
  });
});