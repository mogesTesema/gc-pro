import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage, RegisterPage } from '../pages/auth/AuthPages';
import { AuthProvider } from '../context/AuthContext';
import { authAPI } from '../api/client';

jest.mock('../api/client', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    getMe: jest.fn(),
  },
}));

const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>;

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

function renderRegister() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Auth pages', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders the login form and submits credentials', async () => {
    mockAuthAPI.login.mockResolvedValue({
      data: {
        token: 'test-token',
        user: {
          _id: 'u1',
          name: 'Ada',
          email: 'ada@example.com',
          role: 'creator',
        },
      },
    } as any);

    renderLogin();

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByText(/email address/i)).toBeInTheDocument();
    expect(screen.getByText(/^password$/i)).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'ada@example.com');
    await userEvent.type(screen.getByPlaceholderText('Your password'), 'secret12');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockAuthAPI.login).toHaveBeenCalledWith('ada@example.com', 'secret12');
    });
  });

  it('renders the register form and submits a new account', async () => {
    mockAuthAPI.register.mockResolvedValue({
      data: {
        token: 'test-token',
        user: {
          _id: 'u2',
          name: 'Abebe Kebede',
          email: 'abebe@example.com',
          role: 'creator',
        },
      },
    } as any);

    renderRegister();

    expect(screen.getByRole('heading', { name: /join aacp/i })).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText('Abebe Kebede'), 'Abebe Kebede');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'abebe@example.com');
    await userEvent.type(screen.getByPlaceholderText('Min 6 characters'), 'secret12');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockAuthAPI.register).toHaveBeenCalledWith({
        name: 'Abebe Kebede',
        email: 'abebe@example.com',
        password: 'secret12',
        role: 'creator',
      });
    });
  });
});
