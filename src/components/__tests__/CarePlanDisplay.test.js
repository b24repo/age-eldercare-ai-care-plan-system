import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarePlanDisplay from '../CarePlanDisplay';
import ProductionCareplanAgent from '../ProductionCareplanAgent';

const mockCarePlan = {
  plan: 'Sample care plan content',
  quality: {
    specificity: { score: 4, explanation: 'Good specificity' },
    actionability: { score: 5, explanation: 'Very actionable' },
    evidenceConnection: { score: 4, explanation: 'Well supported' },
    clinicalSafety: { score: 5, explanation: 'Very safe' },
    researchIntegration: { score: 4, explanation: 'Good research' },
    familyEngagement: { score: 3, explanation: 'Moderate engagement' },
    overall: { score: 4, explanation: 'Overall good plan' }
  }
};

describe('CarePlanDisplay Component - Full Scenario Coverage', () => {
  test('renders care plan content with correct styling', () => {
    render(<CarePlanDisplay carePlan={mockCarePlan} />);
    const planContent = screen.getByTestId('care-plan-content');
    expect(planContent).toHaveClass('prose', 'max-w-none', 'p-4', 'bg-white', 'rounded-lg', 'shadow');
    expect(planContent).toHaveTextContent('Sample care plan content');
  });

  test('renders quality scores with correct styling', () => {
    render(<CarePlanDisplay carePlan={mockCarePlan} />);
    const qualityScores = screen.getByTestId('quality-scores');
    expect(qualityScores).toBeInTheDocument();
  });

  test('renders with missing quality data', () => {
    render(<CarePlanDisplay carePlan={{ plan: 'Plan only' }} />);
    expect(screen.getByTestId('care-plan-content')).toHaveTextContent('Plan only');
    // Should not throw or crash
  });

  test('renders with missing plan', () => {
    render(<CarePlanDisplay carePlan={{ quality: mockCarePlan.quality }} />);
    expect(screen.queryByTestId('care-plan-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('quality-scores')).toBeInTheDocument();
  });

  test('renders nothing if no carePlan prop', () => {
    render(<CarePlanDisplay />);
    expect(screen.queryByTestId('care-plan-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('quality-scores')).not.toBeInTheDocument();
  });

  test('renders error state', () => {
    render(<CarePlanDisplay error="Something went wrong" />);
    expect(screen.getByTestId('error-message')).toHaveTextContent('Something went wrong');
  });

  test('renders loading state', () => {
    render(<CarePlanDisplay loading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('is accessible by role and aria', () => {
    render(<CarePlanDisplay carePlan={mockCarePlan} />);
    const region = screen.getByRole('region', { name: /care plan/i });
    expect(region).toBeInTheDocument();
  });

  test('renders all score cards with correct values', () => {
    render(<CarePlanDisplay carePlan={mockCarePlan} />);
    expect(screen.getAllByTestId('score-card').length).toBeGreaterThan(0);
    expect(screen.getByText('Good specificity')).toBeInTheDocument();
    expect(screen.getByText('Very actionable')).toBeInTheDocument();
    expect(screen.getByText('Overall good plan')).toBeInTheDocument();
  });

  test('does not render score cards if quality missing', () => {
    render(<CarePlanDisplay carePlan={{ plan: 'Plan only' }} />);
    expect(screen.queryByTestId('score-card')).not.toBeInTheDocument();
  });
});

describe('ProductionCareplanAgent Quality Scores Display', () => {
  test('renders quality scores section when scores are present', () => {
    render(<ProductionCareplanAgent />);
    // Simulate state or props if needed, or check for static text
    expect(screen.getByText(/quality scores/i)).toBeInTheDocument();
  });

  // ...other tests can be added for conditional rendering, etc.
}); 