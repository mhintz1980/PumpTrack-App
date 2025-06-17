import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { KpiDeck } from '@/components/schedule/KpiDeck';
import type { KpiSnapshot } from '@/types';

const baseSnapshot: KpiSnapshot = {
  unscheduledCount: 3,
  totalOnOrder: 10,
  scheduledCount: 4,
  inProcessCount: 2,
  utilizationPct: 75,
};

describe('KpiDeck', () => {
  it('renders KPI values correctly', () => {
    render(<KpiDeck snapshot={baseSnapshot} />);

    // Unscheduled card shows "X of Y"
    expect(screen.getByTestId('kpi-card-unscheduled')).toHaveTextContent('3 of 10');

    // Remaining work rows
    const remaining = screen.getByTestId('kpi-card-remaining');
    const remainingWithin = within(remaining);
    expect(remainingWithin.getByText('Unscheduled')).toBeInTheDocument();
    expect(remainingWithin.getByText('3')).toBeInTheDocument();
    expect(remainingWithin.getByText('Scheduled')).toBeInTheDocument();
    expect(remainingWithin.getByText('4')).toBeInTheDocument();
    expect(remainingWithin.getByText('In Process')).toBeInTheDocument();
    expect(remainingWithin.getByText('2')).toBeInTheDocument();

    // Capacity card percentage
    expect(screen.getByTestId('kpi-card-capacity')).toHaveTextContent('75%');
  });

  it('shows N/A for missing capacity', () => {
    const noCapacity: KpiSnapshot = { ...baseSnapshot, utilizationPct: null };
    render(<KpiDeck snapshot={noCapacity} />);
    expect(screen.getByTestId('kpi-card-capacity')).toHaveTextContent('N/A');
  });
});
