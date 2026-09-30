import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

describe('Frontend Component Tests', () => {
  it('renders MetricCard with correct value and title', () => {
    render(
      <MetricCard
        title="5. NET MOVEMENT"
        value={15}
        subtext="Purchases + Transfer In - Transfer Out"
      />
    );

    expect(screen.getByText('5. NET MOVEMENT')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Purchases + Transfer In - Transfer Out')).toBeInTheDocument();
  });

  it('renders StatusBadge correctly for COMPLETED status', () => {
    render(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('renders Modal dialog when open and triggers close', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="NET MOVEMENT CALCULATION">
        <div>Formula: 20 + 10 - 15 = 15</div>
      </Modal>
    );

    expect(screen.getByText('NET MOVEMENT CALCULATION')).toBeInTheDocument();
    expect(screen.getByText('Formula: 20 + 10 - 15 = 15')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close dialog');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
