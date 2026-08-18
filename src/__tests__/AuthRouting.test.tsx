import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { authAPI } from '../api/client';

jest.mock('../api/client', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    getMe: jest.fn(),
  },
}));

jest.mock('socket.io-client', () => ({
  io: () => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  }),
}));

describe('Auth routing', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('shows the login page for unauthenticated visitors', async () => {
    window.history.pushState({}, '', '/login');
    render(<App />);

    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('redirects unauthenticated users from /dashboard to login', async () => {
    window.history.pushState({}, '', '/dashboard');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });
    expect(authAPI.getMe).not.toHaveBeenCalled();
  });
});
