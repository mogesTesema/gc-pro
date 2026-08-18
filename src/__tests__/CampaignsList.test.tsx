import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CampaignsList from '../pages/shared/CampaignsList';
import { campaignAPI } from '../api/client';
import { ICampaign } from '../types';

jest.mock('../api/client', () => ({
  campaignAPI: {
    getAll: jest.fn(),
    toggleBookmark: jest.fn(),
  },
}));

const mockCampaignAPI = campaignAPI as jest.Mocked<typeof campaignAPI>;

const campaign: ICampaign = {
  _id: 'c1',
  title: 'Summer Tech Launch',
  description: 'Promote our new gadget across YouTube.',
  budget: 25000,
  currency: 'ETB',
  duration: 14,
  niche: ['tech'],
  requiredSkills: [],
  targetAudience: 'developers',
  platform: ['youtube'],
  requirements: '',
  postedBy: {
    _id: 'b1',
    name: 'Brand Co',
    email: 'brand@example.com',
    role: 'business',
    coinBalance: 0,
    profileStatus: 'approved',
    avatar: '',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  status: 'open',
  applicationsCount: 3,
  tags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('CampaignsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCampaignAPI.getAll.mockResolvedValue({
      data: {
        campaigns: [campaign],
        pagination: { page: 1, limit: 9, total: 1, pages: 1 },
      },
    } as any);
  });

  it('renders the heading, search field, and campaign cards from the API', async () => {
    render(
      <MemoryRouter>
        <CampaignsList />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /browse campaigns/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search campaigns/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Summer Tech Launch')).toBeInTheDocument();
    });

    expect(screen.getByText(/promote our new gadget across youtube/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view & apply/i })).toHaveAttribute(
      'href',
      '/campaigns/c1'
    );
    expect(mockCampaignAPI.getAll).toHaveBeenCalled();
  });
});
