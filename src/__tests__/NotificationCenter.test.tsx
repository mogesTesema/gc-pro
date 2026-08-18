import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationCenterPage from '../pages/shared/NotificationCenterPage';
import { notificationsAPI } from '../api/client';
import { INotification } from '../types';

jest.mock('../api/client', () => ({
  notificationsAPI: {
    getAll: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  },
}));

const mockNotificationsAPI = notificationsAPI as jest.Mocked<typeof notificationsAPI>;

const notifications: INotification[] = [
  {
    _id: 'n1',
    userId: 'u1',
    type: 'new_message',
    title: 'New message',
    message: 'A brand sent you a message.',
    isRead: false,
    createdAt: '2026-01-02T10:00:00.000Z',
  },
  {
    _id: 'n2',
    userId: 'u1',
    type: 'profile_approved',
    title: 'Profile approved',
    message: 'Your profile is live.',
    isRead: true,
    createdAt: '2026-01-01T10:00:00.000Z',
  },
];

describe('NotificationCenterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotificationsAPI.getAll.mockResolvedValue({
      data: { notifications },
    } as any);
  });

  it('shows all notifications and filters to unread', async () => {
    render(<NotificationCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('New message')).toBeInTheDocument();
    });
    expect(screen.getByText('Profile approved')).toBeInTheDocument();
    expect(screen.getByText(/1 unread/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /unread/i }));

    expect(screen.getByText('New message')).toBeInTheDocument();
    expect(screen.queryByText('Profile approved')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^all/i }));

    expect(screen.getByText('New message')).toBeInTheDocument();
    expect(screen.getByText('Profile approved')).toBeInTheDocument();
  });
});
