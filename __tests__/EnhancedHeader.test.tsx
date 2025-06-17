import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnhancedHeader } from '@/components/layout/EnhancedHeader';
import useSWR from 'swr';

jest.mock('swr');

type Snapshot = {
  unscheduledCount: number;
  totalOnOrder: number;
  scheduledCount: number;
  inProcessCount: number;
  utilizationPct?: number | null;
};

const baseProps = {
  title: 'KPIs',
  searchTerm: '',
  onSearchChange: jest.fn(),
  filters: {},
  onFiltersChange: jest.fn(),
  availablePumpModels: [],
  availablePowderCoaters: [],
  availableCustomers: [],
  availableSerialNumbers: [],
  availablePONumbers: [],
  availablePriorities: [] as { label: string; value: string }[],
};

function renderWithKpis(snapshot: Snapshot) {
  (useSWR as jest.Mock).mockReturnValue({
    data: snapshot,
    error: null,
    isLoading: false,
  });

  render(<EnhancedHeader {...baseProps} />);
}

describe('EnhancedHeader KPI deck', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders KPI values from the snapshot', () => {
    renderWithKpis({
      unscheduledCount: 2,
      totalOnOrder: 5,
      scheduledCount: 1,
      inProcessCount: 2,
      utilizationPct: 80,
    });

    const unscheduled = screen.getByTestId('kpi-card-unscheduled');
    expect(unscheduled).toHaveTextContent('2 of 5');

    const remaining = screen.getByTestId('kpi-card-remaining');
    expect(remaining).toHaveTextContent('Unscheduled');
    expect(remaining).toHaveTextContent('2');
    expect(remaining).toHaveTextContent('Scheduled');
    expect(remaining).toHaveTextContent('1');
    expect(remaining).toHaveTextContent('In Process');
    expect(remaining).toHaveTextContent('2');

    const capacity = screen.getByTestId('kpi-card-capacity');
    expect(capacity).toHaveTextContent('80%');
  });

  it('hides the Capacity card when utilizationPct is missing', () => {
    renderWithKpis({
      unscheduledCount: 2,
      totalOnOrder: 5,
      scheduledCount: 1,
      inProcessCount: 2,
    });

    expect(screen.queryByTestId('kpi-card-capacity')).not.toBeInTheDocument();
  });
});
